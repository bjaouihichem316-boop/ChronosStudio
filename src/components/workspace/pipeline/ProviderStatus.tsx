/**
 * Provider Status Component — Chronos Studio Stage 9
 *
 * Displays provider health status and availability.
 * Shows which providers are available for generation.
 */

import { useState, useEffect } from 'react';
import { providerRegistry, ProviderHealth, ProviderHealthStatus } from '../../../utils/providerRegistry';
import { IAIProvider } from '../../../types/pipeline';
import { CheckCircle, XCircle, AlertCircle, Loader, Wifi, WifiOff } from 'lucide-react';

interface ProviderStatusProps {
  /** Optional media type filter */
  mediaType?: 'image' | 'video' | 'audio' | 'voice' | 'music';
  /** Callback when provider is selected */
  onProviderSelect?: (providerId: string) => void;
  /** Currently selected provider */
  selectedProviderId?: string;
}

export default function ProviderStatus({
  mediaType,
  onProviderSelect,
  selectedProviderId,
}: ProviderStatusProps) {
  const [providers, setProviders] = useState<IAIProvider[]>([]);
  const [healthMap, setHealthMap] = useState<Map<string, ProviderHealth>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, [mediaType]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      // Get providers (filtered by media type if specified)
      const allProviders = mediaType
        ? providerRegistry.getProvidersForMediaType(mediaType)
        : providerRegistry.getAllProviders();
      
      setProviders(allProviders);

      // Check health of all providers
      const health = await providerRegistry.checkAllProvidersHealth();
      setHealthMap(health);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (status: ProviderHealthStatus) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'unavailable':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'starting':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthColor = (status: ProviderHealthStatus) => {
    switch (status) {
      case 'available':
        return 'border-emerald-500/30 bg-emerald-500/5';
      case 'unavailable':
        return 'border-red-500/30 bg-red-500/5';
      case 'starting':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'degraded':
        return 'border-amber-500/30 bg-amber-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">Checking provider status...</span>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-400">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">
            No providers available{mediaType ? ` for ${mediaType}` : ''}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300">
          Available Providers{mediaType ? ` for ${mediaType}` : ''}
        </h3>
        <button
          onClick={loadProviders}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {providers.map((provider) => {
          const health = healthMap.get(provider.id);
          const isSelected = selectedProviderId === provider.id;
          const isAvailable = health?.status === 'available';

          return (
            <div
              key={provider.id}
              onClick={() => {
                if (isAvailable && onProviderSelect) {
                  onProviderSelect(provider.id);
                }
              }}
              className={`p-3 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 cursor-pointer'
                  : isAvailable
                  ? `${getHealthColor(health?.status || 'unknown')} cursor-pointer hover:border-[#3a3b5d]`
                  : 'border-gray-500/30 bg-gray-500/5 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getHealthIcon(health?.status || 'unknown')}
                    <span className="text-sm font-medium text-gray-200">
                      {provider.name}
                    </span>
                    {isSelected && (
                      <span className="text-xs text-indigo-400">(selected)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{provider.id}</p>
                  
                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1">
                    {provider.capabilities.mediaTypes.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 text-xs bg-[#12132a] border border-[#2a2b3d] rounded text-gray-400"
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Health message */}
                  {health?.message && (
                    <p className="text-xs text-gray-500 mt-2">{health.message}</p>
                  )}
                </div>

                {/* Availability indicator */}
                <div className="flex items-center gap-1">
                  {isAvailable ? (
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
