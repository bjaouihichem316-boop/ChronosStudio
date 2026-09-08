/**
 * Mock AI Provider — Chronos Studio Stage 7
 *
 * Implements the IAIProvider interface for testing the pipeline architecture.
 * Simulates generation with realistic delays and produces mock outputs.
 * Does NOT generate real media — only produces metadata describing what would be generated.
 */

import {
  IAIProvider,
  AIExecutionRequest,
  AIExecutionResult,
  AIProviderCapabilities,
  MediaOutput,
} from '../types/pipeline';

/**
 * Mock provider that simulates AI generation.
 * Useful for testing pipeline architecture without external dependencies.
 */
export class MockAIProvider implements IAIProvider {
  id = 'mock-provider';
  name = 'Mock AI Provider';

  capabilities: AIProviderCapabilities = {
    mediaTypes: ['image', 'video', 'audio', 'voice', 'music'],
    maxConcurrentTasks: 4,
    supportedResolutions: ['1920x1080', '1280x720', '3840x2160'],
    supportedFormats: ['png', 'jpg', 'mp4', 'webm', 'mp3', 'wav'],
  };

  /**
   * Simulate generation with realistic delay.
   * Returns mock output metadata without generating actual media.
   */
  async execute(request: AIExecutionRequest): Promise<AIExecutionResult> {
    const startTime = Date.now();

    // Simulate processing time based on media type
    const baseDelay = this.getBaseDelay(request.mediaType);
    const qualityMultiplier = this.getQualityMultiplier(request.parameters.quality);
    const delay = baseDelay * qualityMultiplier;

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      await this.simulateDelay(delay * 0.5);
      return {
        success: false,
        generationTime: Date.now() - startTime,
        error: 'Mock generation failed: Simulated provider error',
      };
    }

    // Simulate successful generation
    await this.simulateDelay(delay);

    const output = this.generateMockOutput(request);
    const artifactId = `mock-${request.taskId}-${Date.now()}`;

    return {
      success: true,
      output,
      artifactId,
      generationTime: Date.now() - startTime,
    };
  }

  isAvailable(): boolean {
    return true; // Mock provider is always available
  }

  /**
   * Get base delay in milliseconds for a media type.
   */
  private getBaseDelay(mediaType: string): number {
    const delays: Record<string, number> = {
      image: 500,
      video: 2000,
      audio: 1000,
      voice: 1500,
      music: 1800,
    };
    return delays[mediaType] || 1000;
  }

  /**
   * Get quality multiplier for delay calculation.
   */
  private getQualityMultiplier(quality: string): number {
    const multipliers: Record<string, number> = {
      draft: 0.5,
      standard: 1.0,
      high: 1.5,
      production: 2.0,
    };
    return multipliers[quality] || 1.0;
  }

  /**
   * Simulate async delay.
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate mock output metadata based on request.
   */
  private generateMockOutput(request: AIExecutionRequest): MediaOutput {
    const { mediaType, parameters } = request;

    switch (mediaType) {
      case 'image':
        return {
          type: 'image',
          resolution: '1920x1080',
          aspectRatio: parameters.aspectRatio || '16:9',
          format: 'png',
        };

      case 'video':
        return {
          type: 'video',
          resolution: '1920x1080',
          fps: 30,
          duration: parameters.duration || 10,
          format: 'mp4',
        };

      case 'audio':
        return {
          type: 'audio',
          duration: parameters.duration || 30,
          sampleRate: 44100,
          format: 'mp3',
        };

      case 'voice':
        return {
          type: 'voice',
          duration: parameters.duration || 15,
          speaker: 'default-narrator',
          format: 'mp3',
        };

      case 'music':
        return {
          type: 'music',
          duration: parameters.duration || 60,
          tempo: 120,
          format: 'mp3',
        };

      default:
        throw new Error(`Unsupported media type: ${mediaType}`);
    }
  }
}

/**
 * Create a singleton mock provider instance.
 */
export const mockProvider = new MockAIProvider();
