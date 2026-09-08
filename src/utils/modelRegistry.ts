/**
 * Model Registry — Chronos Studio Stage 10
 *
 * Manages AI models across all providers.
 * Provides model discovery, filtering, and selection.
 */

import { AIModel, ProviderStatus } from '../types/provider';
import { MediaType } from '../types/pipeline';
import { enhancedProviderRegistry } from './enhancedProviderRegistry';

/**
 * Registry for managing AI models across providers.
 */
export class ModelRegistry {
  /**
   * Get all available models from all providers.
   */
  getAllModels(): AIModel[] {
    const providers = enhancedProviderRegistry.getAllProviders();
    const models: AIModel[] = [];

    for (const provider of providers) {
      models.push(...provider.getModels());
    }

    return models;
  }

  /**
   * Get models from a specific provider.
   */
  getModelsByProvider(providerId: string): AIModel[] {
    const provider = enhancedProviderRegistry.getProvider(providerId);
    if (!provider) {
      return [];
    }
    return provider.getModels();
  }

  /**
   * Get a specific model by ID.
   */
  getModel(modelId: string): AIModel | undefined {
    const providers = enhancedProviderRegistry.getAllProviders();
    for (const provider of providers) {
      const model = provider.getModel(modelId);
      if (model) {
        return model;
      }
    }
    return undefined;
  }

  /**
   * Get models that support a specific media type.
   */
  getModelsForMediaType(mediaType: MediaType): AIModel[] {
    return this.getAllModels().filter((model) =>
      model.capabilities.includes(mediaType)
    );
  }

  /**
   * Get models that support multiple media types.
   */
  getModelsForMediaTypes(mediaTypes: MediaType[]): AIModel[] {
    return this.getAllModels().filter((model) =>
      mediaTypes.every((type) => model.capabilities.includes(type))
    );
  }

  /**
   * Get available models (status is 'available').
   */
  getAvailableModels(): AIModel[] {
    return this.getAllModels().filter((model) => model.status === 'available');
  }

  /**
   * Get available models for a specific media type.
   */
  getAvailableModelsForMediaType(mediaType: MediaType): AIModel[] {
    return this.getModelsForMediaType(mediaType).filter(
      (model) => model.status === 'available'
    );
  }

  /**
   * Check if a model exists.
   */
  hasModel(modelId: string): boolean {
    return this.getModel(modelId) !== undefined;
  }

  /**
   * Check if a model is available.
   */
  isModelAvailable(modelId: string): boolean {
    const model = this.getModel(modelId);
    return model !== undefined && model.status === 'available';
  }

  /**
   * Get model count.
   */
  getModelCount(): number {
    return this.getAllModels().length;
  }

  /**
   * Get available model count.
   */
  getAvailableModelCount(): number {
    return this.getAvailableModels().length;
  }

  /**
   * Validate that a model can handle a request.
   */
  validateModelForRequest(
    modelId: string,
    mediaType: MediaType,
    parameters?: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const model = this.getModel(modelId);
    const errors: string[] = [];

    if (!model) {
      errors.push(`Model not found: ${modelId}`);
      return { valid: false, errors };
    }

    if (model.status !== 'available') {
      errors.push(`Model is not available: ${model.status}`);
    }

    if (!model.capabilities.includes(mediaType)) {
      errors.push(
        `Model does not support media type: ${mediaType}. Supported: ${model.capabilities.join(', ')}`
      );
    }

    if (parameters) {
      for (const key of Object.keys(parameters)) {
        if (!model.supportedParameters.includes(key)) {
          errors.push(`Model does not support parameter: ${key}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Select the best model for a request.
   */
  selectBestModel(
    mediaType: MediaType,
    preferredModelId?: string,
    resourceConstraints?: {
      maxVram?: number;
      maxRam?: number;
      maxCpu?: number;
    }
  ): AIModel | null {
    // If a specific model is preferred and available, use it
    if (preferredModelId) {
      const model = this.getModel(preferredModelId);
      if (model && model.status === 'available' && model.capabilities.includes(mediaType)) {
        return model;
      }
    }

    // Get all available models for this media type
    const candidates = this.getAvailableModelsForMediaType(mediaType);

    if (candidates.length === 0) {
      return null;
    }

    // Filter by resource constraints
    let filtered = candidates;
    if (resourceConstraints) {
      filtered = candidates.filter((model) => {
        const reqs = model.resourceRequirements;
        if (!reqs) return true;

        if (resourceConstraints.maxVram && reqs.vram && reqs.vram > resourceConstraints.maxVram) {
          return false;
        }
        if (resourceConstraints.maxRam && reqs.ram && reqs.ram > resourceConstraints.maxRam) {
          return false;
        }
        if (resourceConstraints.maxCpu && reqs.cpu && reqs.cpu > resourceConstraints.maxCpu) {
          return false;
        }
        return true;
      });
    }

    if (filtered.length === 0) {
      return null;
    }

    // Return the first available model (could implement more sophisticated selection later)
    return filtered[0];
  }
}

// ─── Singleton Instance ──────────────────────────────────────────────────────

/**
 * Global model registry instance.
 */
export const modelRegistry = new ModelRegistry();
