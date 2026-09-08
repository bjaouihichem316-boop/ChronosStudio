/**
 * Provider Registry — Chronos Studio Stage 9
 *
 * Manages AI generation providers and their availability.
 * Provides a clean abstraction for provider selection and health monitoring.
 */

import { IAIProvider, MediaType } from '../types/pipeline';
import { mockProvider } from './mockProvider';
import { LocalCanvasProvider } from './localCanvasProvider';

// ─── Provider Health ─────────────────────────────────────────────────────────

export type ProviderHealthStatus =
  | 'available'      // Provider is ready to execute
  | 'unavailable'    // Provider cannot be reached
  | 'starting'       // Provider is initializing
  | 'degraded'       // Provider is available but with limitations
  | 'error'          // Provider encountered an error
  | 'unknown';       // Health status not yet determined

export interface ProviderHealth {
  status: ProviderHealthStatus;
  lastChecked: string;
  message?: string;
  capabilities?: {
    mediaTypes: MediaType[];
    maxConcurrentTasks: number;
  };
}

// ─── Provider Registry ───────────────────────────────────────────────────────

/**
 * Registry for managing AI generation providers.
 * Handles provider registration, lookup, and health monitoring.
 */
export class ProviderRegistry {
  private providers = new Map<string, IAIProvider>();
  private healthCache = new Map<string, ProviderHealth>();

  constructor() {
    // Register built-in providers
    this.registerProvider(mockProvider);
    this.registerProvider(new LocalCanvasProvider());
  }

  /**
   * Register a new provider.
   */
  registerProvider(provider: IAIProvider): void {
    this.providers.set(provider.id, provider);
    // Initialize health as unknown
    this.healthCache.set(provider.id, {
      status: 'unknown',
      lastChecked: new Date().toISOString(),
    });
  }

  /**
   * Unregister a provider.
   */
  unregisterProvider(providerId: string): boolean {
    this.healthCache.delete(providerId);
    return this.providers.delete(providerId);
  }

  /**
   * Get a provider by ID.
   */
  getProvider(providerId: string): IAIProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all registered providers.
   */
  getAllProviders(): IAIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get providers that support a specific media type.
   */
  getProvidersForMediaType(mediaType: MediaType): IAIProvider[] {
    return this.getAllProviders().filter((provider) =>
      provider.capabilities.mediaTypes.includes(mediaType)
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
      const isAvailable = provider.isAvailable();
      const health: ProviderHealth = {
        status: isAvailable ? 'available' : 'unavailable',
        lastChecked: new Date().toISOString(),
        capabilities: {
          mediaTypes: provider.capabilities.mediaTypes,
          maxConcurrentTasks: provider.capabilities.maxConcurrentTasks,
        },
      };
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
   * Select the best provider for a task based on media type and health.
   */
  async selectBestProvider(mediaType: MediaType): Promise<IAIProvider | null> {
    const candidates = this.getProvidersForMediaType(mediaType);
    
    // Check health of all candidates
    for (const provider of candidates) {
      const health = await this.checkProviderHealth(provider.id);
      if (health.status === 'available') {
        return provider;
      }
    }

    // No available provider found
    return null;
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
}

// ─── Singleton Instance ──────────────────────────────────────────────────────

/**
 * Global provider registry instance.
 */
export const providerRegistry = new ProviderRegistry();
