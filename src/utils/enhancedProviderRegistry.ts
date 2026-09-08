/**
 * Enhanced Provider Registry — Chronos Studio Stage 10
 *
 * Manages AI generation providers with full lifecycle support.
 * Provides provider registration, discovery, health monitoring, and selection.
 *
 * This is an enhanced version that supports the new IProvider interface
 * while maintaining backward compatibility with the old IAIProvider interface.
 */

import { IAIProvider, MediaType, AIExecutionRequest, AIExecutionResult } from '../types/pipeline';
import {
  IProvider,
  ProviderConfig,
  ProviderHealth,
  ProviderStatus,
  ProviderType,
  ProviderExecutionRequest,
  ProviderExecutionResult,
  AIModel,
  ExecutionProgress,
} from '../types/provider';
import { mockProvider } from './mockProvider';
import { LocalCanvasProvider } from './localCanvasProvider';
import { localDevelopmentAdapter } from './localDevelopmentAdapter';

// ─── Provider Health ─────────────────────────────────────────────────────────

export type ProviderHealthStatus = ProviderStatus;

// ─── Enhanced Provider Registry ──────────────────────────────────────────────

/**
 * Enhanced registry for managing AI generation providers.
 * Supports both old IAIProvider and new IProvider interfaces.
 */
export class EnhancedProviderRegistry {
  private providers = new Map<string, IProvider>();
  private legacyProviders = new Map<string, IAIProvider>();
  private healthCache = new Map<string, ProviderHealth>();
  private configs = new Map<string, ProviderConfig>();

  constructor() {
    // Register built-in providers
    this.registerLegacyProvider(mockProvider);
    this.registerLegacyProvider(new LocalCanvasProvider());
    this.registerProvider(localDevelopmentAdapter);
  }

  /**
   * Register a new provider (IProvider interface).
   */
  registerProvider(provider: IProvider): void {
    this.providers.set(provider.id, provider);
    this.configs.set(provider.id, provider.config);
    this.healthCache.set(provider.id, {
      status: 'unknown',
      lastChecked: new Date().toISOString(),
    });
  }

  /**
   * Register a legacy provider (IAIProvider interface).
   * Wraps it in an adapter to conform to IProvider interface.
   */
  registerLegacyProvider(provider: IAIProvider): void {
    this.legacyProviders.set(provider.id, provider);

    // Create an adapter
    const adapter = this.createLegacyAdapter(provider);
    this.providers.set(provider.id, adapter);

    // Create a default config
    const config: ProviderConfig = {
      id: provider.id,
      name: provider.name,
      type: provider.id === 'mock-provider' ? 'mock' : 'local-canvas',
      description: `Legacy provider: ${provider.name}`,
      enabled: true,
      priority: 0,
      config: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.configs.set(provider.id, config);

    this.healthCache.set(provider.id, {
      status: 'unknown',
      lastChecked: new Date().toISOString(),
    });
  }

  /**
   * Create an adapter to wrap IAIProvider as IProvider.
   */
  private createLegacyAdapter(legacyProvider: IAIProvider): IProvider {
    return {
      id: legacyProvider.id,
      name: legacyProvider.name,
      type: legacyProvider.id === 'mock-provider' ? 'mock' : 'local-canvas',
      description: `Legacy provider: ${legacyProvider.name}`,
      models: [
        {
          id: `${legacyProvider.id}-default`,
          providerId: legacyProvider.id,
          name: 'Default Model',
          description: 'Default model for legacy provider',
          capabilities: legacyProvider.capabilities.mediaTypes,
          inputRequirements: {
            promptRequired: true,
            contextRequired: false,
          },
          outputCapabilities: {
            supportedMediaTypes: legacyProvider.capabilities.mediaTypes,
            supportedResolutions: legacyProvider.capabilities.supportedResolutions,
            supportedFormats: legacyProvider.capabilities.supportedFormats,
          },
          supportedParameters: [],
          status: 'available',
          metadata: {},
        },
      ],
      status: 'unknown',
      config: {
        id: legacyProvider.id,
        name: legacyProvider.name,
        type: legacyProvider.id === 'mock-provider' ? 'mock' : 'local-canvas',
        description: `Legacy provider: ${legacyProvider.name}`,
        enabled: true,
        priority: 0,
        config: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      async initialize() {
        // No initialization needed for legacy providers
      },
      isAvailable() {
        return legacyProvider.isAvailable();
      },
      async getHealth() {
        const isAvailable = legacyProvider.isAvailable();
        return {
          status: isAvailable ? 'available' : 'unavailable',
          lastChecked: new Date().toISOString(),
          capabilities: {
            mediaTypes: legacyProvider.capabilities.mediaTypes,
            models: [`${legacyProvider.id}-default`],
            maxConcurrentTasks: legacyProvider.capabilities.maxConcurrentTasks,
          },
        };
      },
      getModels() {
        return [
          {
            id: `${legacyProvider.id}-default`,
            providerId: legacyProvider.id,
            name: 'Default Model',
            description: 'Default model for legacy provider',
            capabilities: legacyProvider.capabilities.mediaTypes,
            inputRequirements: {
              promptRequired: true,
              contextRequired: false,
            },
            outputCapabilities: {
              supportedMediaTypes: legacyProvider.capabilities.mediaTypes,
              supportedResolutions: legacyProvider.capabilities.supportedResolutions,
              supportedFormats: legacyProvider.capabilities.supportedFormats,
            },
            supportedParameters: [],
            status: 'available',
            metadata: {},
          },
        ];
      },
      getModel(modelId: string) {
        if (modelId === `${legacyProvider.id}-default`) {
          return {
            id: `${legacyProvider.id}-default`,
            providerId: legacyProvider.id,
            name: 'Default Model',
            description: 'Default model for legacy provider',
            capabilities: legacyProvider.capabilities.mediaTypes,
            inputRequirements: {
              promptRequired: true,
              contextRequired: false,
            },
            outputCapabilities: {
              supportedMediaTypes: legacyProvider.capabilities.mediaTypes,
              supportedResolutions: legacyProvider.capabilities.supportedResolutions,
              supportedFormats: legacyProvider.capabilities.supportedFormats,
            },
            supportedParameters: [],
            status: 'available',
            metadata: {},
          };
        }
        return undefined;
      },
      async execute(request: ProviderExecutionRequest): Promise<ProviderExecutionResult> {
        // Convert to legacy format
        const legacyRequest: AIExecutionRequest = {
          taskId: request.taskId,
          mediaType: request.mediaType,
          parameters: request.parameters as any,
          prompt: request.prompt,
          context: request.context,
        };

        const startTime = Date.now();
        try {
          const result = await legacyProvider.execute(legacyRequest);

          if (!result.success || !result.output || !result.artifactId) {
            return {
              success: false,
              generationTime: Date.now() - startTime,
              providerId: legacyProvider.id,
              modelId: `${legacyProvider.id}-default`,
              error: {
                code: 'EXECUTION_FAILED',
                message: result.error || 'Execution failed',
              },
            };
          }

          return {
            success: true,
            output: {
              type: result.output.type,
              data: new Blob(), // Legacy providers don't return actual data
              mimeType: 'application/octet-stream',
              filename: `${request.mediaType}-${Date.now()}`,
              metadata: result.output as any,
            },
            artifactId: result.artifactId,
            generationTime: result.generationTime,
            providerId: legacyProvider.id,
            modelId: `${legacyProvider.id}-default`,
          };
        } catch (error) {
          return {
            success: false,
            generationTime: Date.now() - startTime,
            providerId: legacyProvider.id,
            modelId: `${legacyProvider.id}-default`,
            error: {
              code: 'EXECUTION_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          };
        }
      },
      async cancel(taskId: string) {
        // Legacy providers don't support cancellation
        console.warn(`Legacy provider ${legacyProvider.id} does not support cancellation`);
      },
      validateRequest(request: ProviderExecutionRequest) {
        const errors: string[] = [];

        if (!legacyProvider.capabilities.mediaTypes.includes(request.mediaType)) {
          errors.push(
            `Provider does not support media type: ${request.mediaType}. Supported: ${legacyProvider.capabilities.mediaTypes.join(', ')}`
          );
        }

        return { valid: errors.length === 0, errors };
      },
    };
  }

  /**
   * Unregister a provider.
   */
  unregisterProvider(providerId: string): boolean {
    this.healthCache.delete(providerId);
    this.configs.delete(providerId);
    this.legacyProviders.delete(providerId);
    return this.providers.delete(providerId);
  }

  /**
   * Get a provider by ID.
   */
  getProvider(providerId: string): IProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all registered providers.
   */
  getAllProviders(): IProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get enabled providers.
   */
  getEnabledProviders(): IProvider[] {
    return this.getAllProviders().filter((provider) => provider.config.enabled);
  }

  /**
   * Get providers that support a specific media type.
   */
  getProvidersForMediaType(mediaType: MediaType): IProvider[] {
    return this.getAllProviders().filter((provider) =>
      provider.models.some((model) => model.capabilities.includes(mediaType))
    );
  }

  /**
   * Check health of a specific provider.
   */
  async checkProviderHealth(providerId: string): Promise<ProviderHealth> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      const health: ProviderHealth = {
        status: 'unavailable',
        lastChecked: new Date().toISOString(),
        message: 'Provider not found',
      };
      this.healthCache.set(providerId, health);
      return health;
    }

    try {
      const health = await provider.getHealth();
      this.healthCache.set(providerId, health);
      return health;
    } catch (error) {
      const health: ProviderHealth = {
        status: 'error',
        lastChecked: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      this.healthCache.set(providerId, health);
      return health;
    }
  }

  /**
   * Check health of all providers.
   */
  async checkAllProvidersHealth(): Promise<Map<string, ProviderHealth>> {
    const results = new Map<string, ProviderHealth>();
    for (const providerId of this.providers.keys()) {
      const health = await this.checkProviderHealth(providerId);
      results.set(providerId, health);
    }
    return results;
  }

  /**
   * Get cached health status for a provider.
   */
  getCachedHealth(providerId: string): ProviderHealth | undefined {
    return this.healthCache.get(providerId);
  }

  /**
   * Select the best provider for a task.
   */
  async selectBestProvider(
    mediaType: MediaType,
    preferredProviderId?: string,
    preferredModelId?: string
  ): Promise<IProvider | null> {
    // If a specific provider is preferred and available, use it
    if (preferredProviderId) {
      const provider = this.getProvider(preferredProviderId);
      if (provider && provider.config.enabled) {
        const health = await this.checkProviderHealth(provider.id);
        if (health.status === 'available') {
          return provider;
        }
      }
    }

    // Get all enabled providers that support this media type
    const candidates = this.getProvidersForMediaType(mediaType).filter(
      (p) => p.config.enabled
    );

    // Check health and sort by priority
    const available: Array<{ provider: IProvider; priority: number }> = [];
    for (const provider of candidates) {
      const health = await this.checkProviderHealth(provider.id);
      if (health.status === 'available') {
        available.push({ provider, priority: provider.config.priority });
      }
    }

    if (available.length === 0) {
      return null;
    }

    // Sort by priority (higher first)
    available.sort((a, b) => b.priority - a.priority);

    return available[0].provider;
  }

  /**
   * Get provider count.
   */
  getProviderCount(): number {
    return this.providers.size;
  }

  /**
   * Check if any provider is available for a media type.
   */
  async hasAvailableProvider(mediaType: MediaType): Promise<boolean> {
    const provider = await this.selectBestProvider(mediaType);
    return provider !== null;
  }

  /**
   * Get provider configuration.
   */
  getProviderConfig(providerId: string): ProviderConfig | undefined {
    return this.configs.get(providerId);
  }

  /**
   * Update provider configuration.
   */
  updateProviderConfig(providerId: string, config: Partial<ProviderConfig>): boolean {
    const existing = this.configs.get(providerId);
    if (!existing) {
      return false;
    }

    const updated: ProviderConfig = {
      ...existing,
      ...config,
      updatedAt: new Date().toISOString(),
    };

    this.configs.set(providerId, updated);

    // Update provider config if it exists
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.config = updated;
    }

    return true;
  }
}

// ─── Singleton Instance ──────────────────────────────────────────────────────

/**
 * Global enhanced provider registry instance.
 */
export const enhancedProviderRegistry = new EnhancedProviderRegistry();

// ─── Backward Compatibility ──────────────────────────────────────────────────

/**
 * For backward compatibility, export as providerRegistry.
 * This allows existing code to continue working.
 */
export const providerRegistry = enhancedProviderRegistry;
