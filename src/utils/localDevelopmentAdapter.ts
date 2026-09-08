/**
 * Local Development Adapter — Chronos Studio Stage 10
 *
 * A deterministic local adapter for architecture testing.
 * This is NOT a real AI provider - it's a test/mock provider that
 * clearly identifies itself as a development tool.
 *
 * Purpose:
 * - Test the provider interface implementation
 * - Validate the execution lifecycle
 * - Verify cancellation and progress reporting
 * - Test error handling
 * - Demonstrate provider capabilities
 *
 * This adapter NEVER pretends to be real AI inference.
 */

import {
  IProvider,
  ProviderConfig,
  ProviderHealth,
  ProviderStatus,
  ProviderType,
  AIModel,
  ProviderExecutionRequest,
  ProviderExecutionResult,
  ExecutionProgress,
  ExecutionPhase,
} from '../types/provider';
import { MediaType } from '../types/pipeline';

/**
 * Local development adapter for testing the provider architecture.
 * This is a deterministic test provider, NOT real AI inference.
 */
export class LocalDevelopmentAdapter implements IProvider {
  id = 'local-dev-adapter';
  name = 'Local Development Adapter';
  type: ProviderType = 'mock';
  description = 'Deterministic test adapter for architecture validation. NOT real AI.';

  models: AIModel[] = [
    {
      id: 'dev-adapter-test-model',
      providerId: this.id,
      name: 'Test Model',
      description: 'Deterministic test model for development',
      capabilities: ['image', 'video', 'audio', 'voice', 'music'],
      inputRequirements: {
        promptRequired: true,
        contextRequired: false,
        maxPromptLength: 1000,
      },
      outputCapabilities: {
        supportedMediaTypes: ['image', 'video', 'audio', 'voice', 'music'],
        supportedResolutions: ['512x512', '1024x1024', '1920x1080'],
        supportedFormats: ['png', 'jpg', 'mp4', 'mp3', 'wav'],
        maxDuration: 60,
      },
      supportedParameters: ['quality', 'seed', 'steps'],
      status: 'available',
      metadata: {
        isTestModel: true,
        deterministic: true,
      },
    },
  ];

  status: ProviderStatus = 'available';

  config: ProviderConfig = {
    id: this.id,
    name: this.name,
    type: this.type,
    description: this.description,
    enabled: true,
    priority: -100, // Low priority - only used for testing
    config: {
      simulationDelay: 1000, // ms
      failureRate: 0.1, // 10% failure rate for testing
      progressSteps: 5,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  private activeExecutions = new Map<string, AbortController>();

  /**
   * Initialize the adapter.
   */
  async initialize(): Promise<void> {
    // No initialization needed for test adapter
    this.status = 'available';
  }

  /**
   * Check if adapter is available.
   */
  isAvailable(): boolean {
    return this.status === 'available';
  }

  /**
   * Get health information.
   */
  async getHealth(): Promise<ProviderHealth> {
    return {
      status: this.status,
      lastChecked: new Date().toISOString(),
      message: 'Development adapter - deterministic test provider',
      capabilities: {
        mediaTypes: ['image', 'video', 'audio', 'voice', 'music'],
        models: this.models.map((m) => m.id),
        maxConcurrentTasks: 2,
      },
    };
  }

  /**
   * Get available models.
   */
  getModels(): AIModel[] {
    return this.models;
  }

  /**
   * Get a specific model.
   */
  getModel(modelId: string): AIModel | undefined {
    return this.models.find((m) => m.id === modelId);
  }

  /**
   * Execute a generation request.
   * This is a deterministic test execution, NOT real AI inference.
   */
  async execute(request: ProviderExecutionRequest): Promise<ProviderExecutionResult> {
    const startTime = Date.now();
    const abortController = new AbortController();
    this.activeExecutions.set(request.taskId, abortController);

    // Link external signal if provided
    if (request.signal) {
      request.signal.addEventListener('abort', () => {
        abortController.abort();
      });
    }

    try {
      // Simulate execution phases
      await this.simulatePhase('queued', 0, 'Task queued', abortController.signal, request.onProgress);
      await this.simulatePhase('preparing', 10, 'Preparing execution', abortController.signal, request.onProgress);
      await this.simulatePhase('generating', 40, 'Generating media (simulated)', abortController.signal, request.onProgress);
      await this.simulatePhase('processing', 70, 'Processing output', abortController.signal, request.onProgress);
      await this.simulatePhase('storing', 90, 'Storing artifact', abortController.signal, request.onProgress);
      await this.simulatePhase('finalizing', 95, 'Finalizing', abortController.signal, request.onProgress);

      // Simulate random failure for testing
      const failureRate = this.config.config.failureRate || 0.1;
      if (Math.random() < failureRate) {
        throw new Error('Simulated execution failure for testing');
      }

      // Generate deterministic test output
      const output = this.generateTestOutput(request);

      await this.simulatePhase('completed', 100, 'Completed', abortController.signal, request.onProgress);

      return {
        success: true,
        output,
        artifactId: `dev-artifact-${request.taskId}-${Date.now()}`,
        generationTime: Date.now() - startTime,
        providerId: this.id,
        modelId: request.modelId || this.models[0].id,
        metadata: {
          isTestExecution: true,
          deterministic: true,
          simulationDelay: this.config.config.simulationDelay,
        },
      };
    } catch (error) {
      if (abortController.signal.aborted) {
        return {
          success: false,
          generationTime: Date.now() - startTime,
          providerId: this.id,
          modelId: request.modelId || this.models[0].id,
          error: {
            code: 'CANCELLED',
            message: 'Execution was cancelled',
          },
        };
      }

      return {
        success: false,
        generationTime: Date.now() - startTime,
        providerId: this.id,
        modelId: request.modelId || this.models[0].id,
        error: {
          code: 'EXECUTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    } finally {
      this.activeExecutions.delete(request.taskId);
    }
  }

  /**
   * Cancel an ongoing execution.
   */
  async cancel(taskId: string): Promise<void> {
    const controller = this.activeExecutions.get(taskId);
    if (controller) {
      controller.abort();
      this.activeExecutions.delete(taskId);
    }
  }

  /**
   * Validate a request.
   */
  validateRequest(request: ProviderExecutionRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const model = request.modelId ? this.getModel(request.modelId) : this.models[0];
    if (!model) {
      errors.push(`Model not found: ${request.modelId}`);
      return { valid: false, errors };
    }

    if (!model.capabilities.includes(request.mediaType)) {
      errors.push(
        `Model does not support media type: ${request.mediaType}. Supported: ${model.capabilities.join(', ')}`
      );
    }

    if (request.parameters) {
      for (const key of Object.keys(request.parameters)) {
        if (!model.supportedParameters.includes(key)) {
          errors.push(`Model does not support parameter: ${key}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Simulate an execution phase with delay.
   */
  private async simulatePhase(
    phase: ExecutionPhase,
    percent: number,
    message: string,
    signal: AbortSignal,
    onProgress?: (progress: ExecutionProgress) => void
  ): Promise<void> {
    if (signal.aborted) {
      throw new Error('Execution cancelled');
    }

    const delay = (this.config.config.simulationDelay || 1000) / 5;
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, delay);

      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('Execution cancelled'));
      });
    });

    if (onProgress) {
      onProgress({
        phase,
        percent,
        message,
        timestamp: new Date().toISOString(),
        metadata: {
          isSimulation: true,
        },
      });
    }
  }

  /**
   * Generate deterministic test output.
   */
  private generateTestOutput(request: ProviderExecutionRequest): {
    type: MediaType;
    data: Blob;
    mimeType: string;
    filename: string;
    metadata: Record<string, any>;
  } {
    const timestamp = Date.now();

    switch (request.mediaType) {
      case 'image':
        return {
          type: 'image',
          data: new Blob(['TEST_IMAGE_DATA'], { type: 'image/png' }),
          mimeType: 'image/png',
          filename: `test-image-${timestamp}.png`,
          metadata: {
            width: 1024,
            height: 1024,
            format: 'png',
            isTestOutput: true,
          },
        };

      case 'video':
        return {
          type: 'video',
          data: new Blob(['TEST_VIDEO_DATA'], { type: 'video/mp4' }),
          mimeType: 'video/mp4',
          filename: `test-video-${timestamp}.mp4`,
          metadata: {
            width: 1920,
            height: 1080,
            duration: 10,
            fps: 30,
            format: 'mp4',
            isTestOutput: true,
          },
        };

      case 'audio':
      case 'voice':
        return {
          type: request.mediaType,
          data: new Blob(['TEST_AUDIO_DATA'], { type: 'audio/mp3' }),
          mimeType: 'audio/mp3',
          filename: `test-${request.mediaType}-${timestamp}.mp3`,
          metadata: {
            duration: 15,
            sampleRate: 44100,
            format: 'mp3',
            isTestOutput: true,
          },
        };

      case 'music':
        return {
          type: 'music',
          data: new Blob(['TEST_MUSIC_DATA'], { type: 'audio/mp3' }),
          mimeType: 'audio/mp3',
          filename: `test-music-${timestamp}.mp3`,
          metadata: {
            duration: 60,
            tempo: 120,
            format: 'mp3',
            isTestOutput: true,
          },
        };

      default:
        throw new Error(`Unsupported media type: ${request.mediaType}`);
    }
  }
}

/**
 * Singleton instance of the local development adapter.
 */
export const localDevelopmentAdapter = new LocalDevelopmentAdapter();
