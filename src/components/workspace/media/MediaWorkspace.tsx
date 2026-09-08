import { useState } from 'react';
import { MediaData, MediaAsset, MediaArtifact, AssetVersion } from '../../../types/media';
import { PipelineData } from '../../../types/pipeline';
import { getCurrentArtifact, getAssetVersionsWithArtifacts } from '../../../utils/assetManager';
import { Film, Image, Music, Mic, Video, Package, Eye, Trash2, RefreshCw } from 'lucide-react';

interface MediaWorkspaceProps {
  mediaData: MediaData;
  pipelineData: PipelineData;
  onUpdateMediaData: (data: MediaData) => void;
}

export default function MediaWorkspace({
  mediaData,
  pipelineData,
  onUpdateMediaData,
}: MediaWorkspaceProps) {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const { assets, artifacts, versions } = mediaData;

  // Filter assets
  const filteredAssets = filter === 'all'
    ? assets
    : assets.filter(a => a.type === filter);

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      case 'music': return <Music className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  // Get current artifact for asset
  const getArtifactForAsset = (asset: MediaAsset): MediaArtifact | null => {
    return getCurrentArtifact(asset, versions, artifacts);
  };

  // Delete asset
  const handleDeleteAsset = (assetId: string) => {
    const updatedAssets = assets.filter(a => a.id !== assetId);
    const asset = assets.find(a => a.id === assetId);
    
    // Also remove associated versions
    const updatedVersions = asset
      ? versions.filter(v => v.assetId !== assetId)
      : versions;

    onUpdateMediaData({
      ...mediaData,
      assets: updatedAssets,
      versions: updatedVersions,
      lastSaved: new Date().toISOString(),
    });

    if (selectedAsset?.id === assetId) {
      setSelectedAsset(null);
    }
  };

  return (
    <div className="flex h-full">
      {/* Asset List */}
      <div className="w-80 border-r border-[#2a2b3d] flex flex-col">
        <div className="p-4 border-b border-[#2a2b3d]">
          <h2 className="text-lg font-semibold text-white mb-3">Media Assets</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-xs ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#1a1b2e] text-gray-400 hover:bg-[#22234a]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-3 py-1 rounded text-xs ${
                filter === 'image'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#1a1b2e] text-gray-400 hover:bg-[#22234a]'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3 py-1 rounded text-xs ${
                filter === 'video'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#1a1b2e] text-gray-400 hover:bg-[#22234a]'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => setFilter('audio')}
              className={`px-3 py-1 rounded text-xs ${
                filter === 'audio'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#1a1b2e] text-gray-400 hover:bg-[#22234a]'
              }`}
            >
              Audio
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No media assets yet</p>
              <p className="text-xs mt-2">Complete generation tasks to create assets</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredAssets.map(asset => {
                const artifact = getArtifactForAsset(asset);
                const isSelected = selectedAsset?.id === asset.id;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/50'
                        : 'bg-[#1a1b2e] border border-[#2a2b3d] hover:border-[#3a3b5d]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-gray-400">
                        {getTypeIcon(asset.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {asset.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {asset.origin} • v{asset.versionIds.length}
                        </div>
                        {artifact && (
                          <div className="text-xs text-gray-600 mt-1">
                            {artifact.metadata.format} • {(artifact.storage.size / 1024).toFixed(1)} KB
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Asset Detail */}
      <div className="flex-1 flex flex-col">
        {selectedAsset ? (
          <>
            <div className="p-4 border-b border-[#2a2b3d] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedAsset.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{selectedAsset.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteAsset(selectedAsset.id)}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Asset Info */}
              <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-white mb-3">Asset Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="text-white ml-2 capitalize">{selectedAsset.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Origin:</span>
                    <span className="text-white ml-2 capitalize">{selectedAsset.origin}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Versions:</span>
                    <span className="text-white ml-2">{selectedAsset.versionIds.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="text-white ml-2">
                      {new Date(selectedAsset.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Artifact */}
              {(() => {
                const currentArtifact = getArtifactForAsset(selectedAsset);
                if (!currentArtifact) {
                  return (
                    <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg p-4 mb-4">
                      <p className="text-gray-500 text-sm">No artifact available</p>
                    </div>
                  );
                }

                return (
                  <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-white mb-3">Current Artifact</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Format:</span>
                        <span className="text-white ml-2">{currentArtifact.metadata.format}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="text-white ml-2">
                          {(currentArtifact.storage.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      {currentArtifact.metadata.width && (
                        <div>
                          <span className="text-gray-500">Dimensions:</span>
                          <span className="text-white ml-2">
                            {currentArtifact.metadata.width} × {currentArtifact.metadata.height}
                          </span>
                        </div>
                      )}
                      {currentArtifact.metadata.duration && (
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="text-white ml-2">
                            {currentArtifact.metadata.duration}s
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="text-white ml-2 capitalize">{currentArtifact.status}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Storage:</span>
                        <span className="text-white ml-2 capitalize">{currentArtifact.storage.provider}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Version History */}
              <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Version History</h4>
                <div className="space-y-2">
                  {getAssetVersionsWithArtifacts(selectedAsset, versions, artifacts).map(({ version, artifact }) => (
                    <div
                      key={version.id}
                      className={`p-3 rounded border ${
                        version.isCurrent
                          ? 'bg-indigo-600/10 border-indigo-500/30'
                          : 'bg-[#12132a] border-[#2a2b3d]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">
                            Version {version.versionNumber}
                            {version.isCurrent && (
                              <span className="ml-2 text-xs text-indigo-400">(current)</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(version.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {artifact && (
                          <div className="text-xs text-gray-500">
                            {artifact.metadata.format} • {(artifact.storage.size / 1024).toFixed(1)} KB
                          </div>
                        )}
                      </div>
                      {version.notes && (
                        <div className="text-xs text-gray-400 mt-2">{version.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select an asset to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
