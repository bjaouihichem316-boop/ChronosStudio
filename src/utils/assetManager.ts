/**
 * Asset Manager — Chronos Studio Stage 9
 *
 * Manages the lifecycle of media artifacts and assets.
 * Handles artifact creation from pipeline outputs, versioning, and usage tracking.
 * Supports both mock and real artifacts from local providers.
 */

import { MediaArtifact, MediaAsset, AssetVersion, MediaData, AssetOrigin, StorageReference } from '../types/media';
import { GenerationOutput, MediaType } from '../types/pipeline';
import { createMockArtifact } from './mockStorage';
import { indexedDBStorage } from './indexedDBStorage';
import { LocalCanvasProvider } from './localCanvasProvider';

/**
 * Create a media artifact from a generation output.
 * Handles both mock and real artifacts based on provider.
 */
export async function createArtifactFromOutput(
  projectId: string,
  output: GenerationOutput
): Promise<MediaArtifact> {
  // Check if this is a real artifact from local canvas provider
  if (output.metadata.providerId === 'local-canvas') {
    return createRealArtifact(projectId, output);
  }
  
  // Fall back to mock artifact for other providers
  const artifact = createMockArtifact(projectId, output.mediaType, output.output);
  
  // Link to generation source
  artifact.generationSource = {
    outputId: output.id,
    taskId: output.taskId,
    requestId: output.requestId,
  };
  
  return artifact;
}

/**
 * Create a real artifact from local canvas provider output.
 * Retrieves the actual blob and stores it in IndexedDB.
 */
async function createRealArtifact(
  projectId: string,
  output: GenerationOutput
): Promise<MediaArtifact> {
  const now = new Date().toISOString();
  
  // Get the blob from the local canvas provider
  const blob = LocalCanvasProvider.getGeneratedBlob(output.artifactId);
  if (!blob) {
    throw new Error('Generated blob not found for artifact: ' + output.artifactId);
  }
  
  // Store in IndexedDB
  const storageRef = await indexedDBStorage.store(
    projectId,
    output.mediaType,
    blob,
    `generated-${output.mediaType}-${Date.now()}.png`
  );
  
  // Clean up the temporary blob
  LocalCanvasProvider.cleanupBlob(output.artifactId);
  
  // Parse resolution from output
  const resolution = output.output.type === 'image' ? output.output.resolution : '1024x1024';
  const [width, height] = resolution.split('x').map(Number);
  
  const artifact: MediaArtifact = {
    id: output.artifactId,
    projectId,
    type: output.mediaType,
    filename: `generated-${output.mediaType}-${Date.now()}.png`,
    mimeType: 'image/png',
    storage: storageRef,
    metadata: {
      width,
      height,
      format: 'png',
    },
    status: 'ready',
    generationSource: {
      outputId: output.id,
      taskId: output.taskId,
      requestId: output.requestId,
    },
    createdAt: now,
    updatedAt: now,
  };
  
  return artifact;
}
/**
 * Create a new media asset.
 */
export function createMediaAsset(
  projectId: string,
  name: string,
  type: MediaType,
  origin: AssetOrigin,
  description: string = '',
  initialArtifactId?: string
): { asset: MediaAsset; version?: AssetVersion } {
  const now = new Date().toISOString();
  const assetId = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const asset: MediaAsset = {
    id: assetId,
    projectId,
    name,
    type,
    origin,
    description,
    currentVersionId: null,
    versionIds: [],
    usage: {
      characterIds: [],
      locationIds: [],
      sceneIds: [],
      shotIds: [],
    },
    tags: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  };

  let version: AssetVersion | undefined;

  // Create initial version if artifact provided
  if (initialArtifactId) {
    version = createAssetVersion(assetId, initialArtifactId, 1, true);
    asset.versionIds.push(version.id);
    asset.currentVersionId = version.id;
  }

  return { asset, version };
}

/**
 * Create a new version for an asset.
 */
export function createAssetVersion(
  assetId: string,
  artifactId: string,
  versionNumber: number,
  isCurrent: boolean = false,
  provenance?: AssetVersion['provenance'],
  notes?: string
): AssetVersion {
  return {
    id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    assetId,
    versionNumber,
    artifactId,
    provenance: provenance || {
      outputId: '',
      taskId: '',
      requestId: '',
      sourceType: 'shot',
      sourceId: '',
      contextSnapshot: '',
      promptHash: '',
    },
    isCurrent,
    createdAt: new Date().toISOString(),
    notes,
  };
}

/**
 * Add a new version to an asset and set it as current.
 */
export function addAssetVersion(
  asset: MediaAsset,
  artifactId: string,
  provenance?: AssetVersion['provenance'],
  notes?: string
): { updatedAsset: MediaAsset; newVersion: AssetVersion } {
  const versionNumber = asset.versionIds.length + 1;

  // Mark all existing versions as not current
  const newVersion = createAssetVersion(
    asset.id,
    artifactId,
    versionNumber,
    true,
    provenance,
    notes
  );

  const updatedAsset: MediaAsset = {
    ...asset,
    currentVersionId: newVersion.id,
    versionIds: [...asset.versionIds, newVersion.id],
    updatedAt: new Date().toISOString(),
  };

  return { updatedAsset, newVersion };
}

/**
 * Switch the current version of an asset.
 */
export function switchAssetVersion(
  asset: MediaAsset,
  versionId: string
): MediaAsset {
  if (!asset.versionIds.includes(versionId)) {
    throw new Error(`Version ${versionId} not found in asset ${asset.id}`);
  }

  return {
    ...asset,
    currentVersionId: versionId,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update asset usage tracking.
 */
export function updateAssetUsage(
  asset: MediaAsset,
  usageType: 'character' | 'location' | 'scene' | 'shot',
  entityId: string,
  action: 'add' | 'remove'
): MediaAsset {
  const usageKey = `${usageType}Ids` as keyof MediaAsset['usage'];
  const currentIds = asset.usage[usageKey];

  let newIds: string[];
  if (action === 'add') {
    if (currentIds.includes(entityId)) {
      return asset; // Already tracked
    }
    newIds = [...currentIds, entityId];
  } else {
    newIds = currentIds.filter((id) => id !== entityId);
  }

  return {
    ...asset,
    usage: {
      ...asset.usage,
      [usageKey]: newIds,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Process a completed generation task and create artifact + asset.
 */
export async function processCompletedTask(
  projectId: string,
  output: GenerationOutput,
  mediaData: MediaData,
  assetName?: string
): Promise<{ mediaData: MediaData; artifact: MediaArtifact; asset: MediaAsset; version: AssetVersion }> {
  // Create artifact from output
  const artifact = await createArtifactFromOutput(projectId, output);

  // Create asset
  const name = assetName || `Generated ${output.mediaType} - ${new Date().toLocaleString()}`;
  const { asset, version } = createMediaAsset(
    projectId,
    name,
    output.mediaType,
    'generated',
    `Generated from task ${output.taskId}`,
    artifact.id
  );

  // Update version provenance
  if (version) {
    version.provenance = {
      outputId: output.id,
      taskId: output.taskId,
      requestId: output.requestId,
      sourceType: output.provenance.sourceType,
      sourceId: output.provenance.sourceId,
      contextSnapshot: output.provenance.contextSnapshot,
      promptHash: output.provenance.promptHash,
    };
  }

  // Update media data
  const updatedMediaData: MediaData = {
    ...mediaData,
    artifacts: [...mediaData.artifacts, artifact],
    assets: [...mediaData.assets, asset],
    versions: version ? [...mediaData.versions, version] : mediaData.versions,
    lastSaved: new Date().toISOString(),
  };

  return {
    mediaData: updatedMediaData,
    artifact,
    asset,
    version: version!,
  };
}

/**
 * Get the current artifact for an asset.
 */
export function getCurrentArtifact(
  asset: MediaAsset,
  versions: AssetVersion[],
  artifacts: MediaArtifact[]
): MediaArtifact | null {
  if (!asset.currentVersionId) {
    return null;
  }

  const version = versions.find((v) => v.id === asset.currentVersionId);
  if (!version) {
    return null;
  }

  return artifacts.find((a) => a.id === version.artifactId) || null;
}

/**
 * Get all versions for an asset with their artifacts.
 */
export function getAssetVersionsWithArtifacts(
  asset: MediaAsset,
  versions: AssetVersion[],
  artifacts: MediaArtifact[]
): Array<{ version: AssetVersion; artifact: MediaArtifact | null }> {
  const result: Array<{ version: AssetVersion; artifact: MediaArtifact | null }> = [];

  for (const versionId of asset.versionIds) {
    const version = versions.find((v) => v.id === versionId);
    if (!version) {
      continue;
    }

    const artifact = artifacts.find((a) => a.id === version.artifactId) || null;
    result.push({ version, artifact });
  }

  return result.sort((a, b) => b.version.versionNumber - a.version.versionNumber);
}

/**
 * Find assets using a specific entity.
 */
export function findAssetsUsingEntity(
  mediaData: MediaData,
  entityType: 'character' | 'location' | 'scene' | 'shot',
  entityId: string
): MediaAsset[] {
  const usageKey = `${entityType}Ids` as keyof MediaAsset['usage'];

  return mediaData.assets.filter((asset) =>
    asset.usage[usageKey].includes(entityId)
  );
}

/**
 * Delete an asset and optionally its artifacts and versions.
 */
export function deleteAsset(
  mediaData: MediaData,
  assetId: string,
  deleteArtifacts: boolean = false
): MediaData {
  const asset = mediaData.assets.find((a) => a.id === assetId);
  if (!asset) {
    return mediaData;
  }

  // Get versions to delete
  const versionsToDelete = mediaData.versions.filter((v) => v.assetId === assetId);
  const artifactIdsToDelete = deleteArtifacts
    ? versionsToDelete.map((v) => v.artifactId)
    : [];

  return {
    artifacts: deleteArtifacts
      ? mediaData.artifacts.filter((a) => !artifactIdsToDelete.includes(a.id))
      : mediaData.artifacts,
    assets: mediaData.assets.filter((a) => a.id !== assetId),
    versions: mediaData.versions.filter((v) => v.assetId !== assetId),
    lastSaved: new Date().toISOString(),
  };
}
