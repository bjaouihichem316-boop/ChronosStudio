/**
 * Mock Media Storage — Chronos Studio Stage 8
 *
 * In-memory storage implementation for development and testing.
 * Implements IMediaStorage interface.
 */

import { IMediaStorage, MediaArtifact, StorageReference } from '../types/media';
import { MediaType } from '../types/pipeline';

/**
 * Mock storage provider that keeps artifacts in memory.
 * Suitable for development and testing.
 */
export class MockMediaStorage implements IMediaStorage {
  private storage = new Map<string, ArrayBuffer>();

  /**
   * Store an artifact in memory.
   */
  async store(
    projectId: string,
    type: MediaType,
    data: ArrayBuffer | Blob,
    filename: string
  ): Promise<StorageReference> {
    // Convert Blob to ArrayBuffer if needed
    let buffer: ArrayBuffer;
    if (data instanceof Blob) {
      buffer = await data.arrayBuffer();
    } else {
      buffer = data;
    }

    // Generate unique ID
    const id = `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const path = `mock://${projectId}/${type}/${id}`;

    // Calculate checksum (simple hash for mock)
    const checksum = this.calculateChecksum(buffer);

    // Store in memory
    this.storage.set(path, buffer);

    return {
      provider: 'memory',
      path,
      size: buffer.byteLength,
      checksum,
    };
  }

  /**
   * Retrieve an artifact from memory.
   */
  async retrieve(ref: StorageReference): Promise<ArrayBuffer | null> {
    return this.storage.get(ref.path) || null;
  }

  /**
   * Delete an artifact from memory.
   */
  async delete(ref: StorageReference): Promise<boolean> {
    return this.storage.delete(ref.path);
  }

  /**
   * Check if artifact exists in memory.
   */
  async exists(ref: StorageReference): Promise<boolean> {
    return this.storage.has(ref.path);
  }

  /**
   * Generate a mock preview (returns same reference for mock).
   */
  async generatePreview(ref: StorageReference): Promise<StorageReference | null> {
    // For mock, just return the same reference
    return ref;
  }

  /**
   * Simple checksum calculation for mock artifacts.
   */
  private calculateChecksum(buffer: ArrayBuffer): string {
    const view = new Uint8Array(buffer);
    let hash = 0;
    for (let i = 0; i < Math.min(view.length, 1000); i++) {
      hash = (hash << 5) - hash + view[i];
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get storage statistics (for debugging).
   */
  getStats(): { count: number; totalSize: number } {
    let totalSize = 0;
    for (const buffer of this.storage.values()) {
      totalSize += buffer.byteLength;
    }
    return {
      count: this.storage.size,
      totalSize,
    };
  }

  /**
   * Clear all stored artifacts.
   */
  clear(): void {
    this.storage.clear();
  }
}

/**
 * Singleton mock storage instance.
 */
export const mockStorage = new MockMediaStorage();

/**
 * Create a mock media artifact for testing.
 */
export function createMockArtifact(
  projectId: string,
  type: MediaType,
  output: any
): MediaArtifact {
  const now = new Date().toISOString();

  // Generate mock storage reference
  const storage: StorageReference = {
    provider: 'memory',
    path: `mock://${projectId}/${type}/mock-${Date.now()}`,
    size: 1024, // Mock 1KB
    checksum: `mock-${Date.now()}`,
  };

  // Build metadata based on type
  const metadata: any = {
    format: output.format || 'mock',
  };

  if (type === 'image') {
    const [width, height] = (output.resolution || '1920x1080').split('x').map(Number);
    metadata.width = width;
    metadata.height = height;
  } else if (type === 'video') {
    const [width, height] = (output.resolution || '1920x1080').split('x').map(Number);
    metadata.width = width;
    metadata.height = height;
    metadata.duration = output.duration;
    metadata.fps = output.fps;
  } else if (type === 'audio' || type === 'voice' || type === 'music') {
    metadata.duration = output.duration;
    metadata.sampleRate = output.sampleRate || 44100;
  }

  return {
    id: `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    type,
    filename: `mock-${type}-${Date.now()}.${output.format || 'mock'}`,
    mimeType: getMimeType(type, output.format),
    storage,
    metadata,
    status: 'ready',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get MIME type for media type and format.
 */
function getMimeType(type: MediaType, format?: string): string {
  const mimeTypes: Record<string, Record<string, string>> = {
    image: {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    },
    video: {
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
    },
    audio: {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
    },
    voice: {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
    },
    music: {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
    },
  };

  return mimeTypes[type]?.[format || ''] || `application/${type}`;
}
