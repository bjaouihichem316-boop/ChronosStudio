/**
 * Provider Domain Types — Chronos Studio Stage 10
 *
 * This domain defines the contracts for AI generation providers.
 * Providers are infrastructure components that communicate with inference engines.
 *
 * Architecture:
 *   Provider → Model → Capability → Execution
 *
 * Providers own communication with inference engines.
 * They must NOT know about UI components or domain-specific logic.
 */

import { MediaType } from './pipeline';

// ─── Provider Identity ───────────────────────────────────────────────────────

export type ProviderType =
  | 'local-canvas'      // Procedural canvas generation (non-AI)
  | 'local-inference'   // Local AI inference (e.g., ComfyUI, Ollama)
  | 'mock';             // Mock provider for testing

export type ProviderStatus =
  | 'available'         // Ready to execute
  | 'unavailable'       // Cannot be reached
  | 'initializing'      // Starting up
  | 'degraded'          // Available with limitations
  | 'error'             // Encountered an error
  | 'unknown';          // Status not yet determined

// ─── Model Definition ────────────────────────────────────────────────────────

/**
 * A model represents a specific AI model or algorithm within a provider.
 * A provider may expose multiple models.
 */
export interface AIModel {
  id: string;
  providerId: string;
  name: string;
  description: string;

  /** What media types this model can generate */
  capabilities: MediaType[];

  /** Input requirements */
  inputRequirements: {
    promptRequired: boolean;
    contextRequired: boolean;
    maxPromptLength?: number;
    supportedFormats?: string[];
  };

  /** Output capabilities */
  outputCapabilities: {
    supportedMediaTypes: MediaType[];
    supportedResolutions?: string[];
    supportedFormats?: string[];
    maxDuration?: number; // seconds
  };

  /** Supported parameters */
  supportedParameters: string[];

  /** Resource requirements */
  resourceRequirements?: {
    vram?: number; // GB
    ram?: number; // GB
    cpu?: number; // cores
    disk?: number; // GB
  };

  /** Current availability */
  status: ProviderStatus;

  /** Additional metadata */
  metadata: Record<string, any>;
}

// ─── Provider Configuration ──────────────────────────────────────────────────

/**
 * Configuration for a provider.
 * Provider-specific settings are stored in the extra field.
 */
export interface ProviderConfig {
  /** Provider ID */
  id: string;

  /** Display name */
  name: string;

  /** Provider type */
  type: ProviderType;

  /** Description */
  description: string;

  /** Whether this provider is enabled */
  enabled: boolean;

  /** Priority for selection (higher = preferred) */
  priority: number;

  /** Provider-specific configuration */
  config: Record<string, any>;

  /** Creation timestamp */
  createdAt: string;

  /** Last update */
  updatedAt: string;
}

// ─── Execution Progress ──────────────────────────────────────────────────────

export type ExecutionPhase =
  | 'queued'            // Task is in queue
  | 'preparing'         // Preparing for execution
  | 'generating'        // Generating media
  | 'processing'        // Post-processing
  | 'storing'           // Storing artifact
  | 'finalizing'        // Finalizing
  | 'completed'         // Done
  | 'failed'            // Failed
  | 'cancelled';        // Cancelled

/**
 * Progress information for an execution.
 */
export interface ExecutionProgress {
  /** Current phase */
  phase: ExecutionPhase;

  /** Progress percentage (0-100) */
  percent: number;

  /** Human-readable status message */
  message: string;

  /** Timestamp */
  timestamp: string;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

// ─── Execution Request ───────────────────────────────────────────────────────

/**
 * Request sent to a provider for execution.
 * This is the contract between pipeline and provider.
 */
export interface ProviderExecutionRequest {
  /** Task ID */
  taskId: string;

  /** Request ID */
  requestId: string;

  /** Project ID */
  projectId: string;

  /** Media type to generate */
  mediaType: MediaType;

  /** Model ID to use (if specified) */
  modelId?: string;

  /** Generation prompt */
  prompt: string;

  /** Generation context */
  context: any;

  /** Generation parameters */
  parameters: Record<string, any>;

  /** Abort signal for cancellation */
  signal?: AbortSignal;

  /** Progress callback */
  onProgress?: (progress: ExecutionProgress) => void;
}

// ─── Execution Result ────────────────────────────────────────────────────────

/**
 * Result returned from a provider after execution.
 */
export interface ProviderExecutionResult {
  /** Whether execution succeeded */
  success: boolean;

  /** Generated media output */
  output?: {
    type: MediaType;
    data: Blob | ArrayBuffer;
    mimeType: string;
    filename: string;
    metadata: Record<string, any>;
  };

  /** Artifact ID (if stored) */
  artifactId?: string;

  /** Generation time in milliseconds */
  generationTime: number;

  /** Provider ID that executed */
  providerId: string;

  /** Model ID that executed */
  modelId: string;

  /** Error information if failed */
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  /** Execution metadata */
  metadata?: Record<string, any>;
}

// ─── Provider Interface ──────────────────────────────────────────────────────

/**
 * Provider interface contract.
 * All providers (mock, local, or remote) must implement this.
 */
export interface IProvider {
  /** Unique provider ID */
  id: string;

  /** Display name */
  name: string;

  /** Provider type */
  type: ProviderType;

  /** Description */
  description: string;

  /** Available models */
  models: AIModel[];

  /** Current status */
  status: ProviderStatus;

  /** Configuration */
  config: ProviderConfig;

  /**
   * Initialize the provider.
   * Called once when provider is registered.
   */
  initialize(): Promise<void>;

  /**
   * Check if provider is available.
   */
  isAvailable(): boolean;

  /**
   * Get provider health information.
   */
  getHealth(): Promise<ProviderHealth>;

  /**
   * Get available models.
   */
  getModels(): AIModel[];

  /**
   * Get a specific model by ID.
   */
  getModel(modelId: string): AIModel | undefined;

  /**
   * Execute a generation request.
   */
  execute(request: ProviderExecutionRequest): Promise<ProviderExecutionResult>;

  /**
   * Cancel an ongoing execution.
   */
  cancel(taskId: string): Promise<void>;

  /**
   * Validate that the provider can handle a request.
   */
  validateRequest(request: ProviderExecutionRequest): { valid: boolean; errors: string[] };
}

// ─── Provider Health ─────────────────────────────────────────────────────────

/**
 * Health information for a provider.
 */
export interface ProviderHealth {
  /** Current status */
  status: ProviderStatus;

  /** Last checked timestamp */
  lastChecked: string;

  /** Status message */
  message?: string;

  /** Available capabilities */
  capabilities?: {
    mediaTypes: MediaType[];
    models: string[];
    maxConcurrentTasks: number;
  };

  /** Resource usage (if available) */
  resourceUsage?: {
    vram?: { used: number; total: number };
    ram?: { used: number; total: number };
    cpu?: number;
  };
}

// ─── Provider Selection Criteria ─────────────────────────────────────────────

/**
 * Criteria for selecting a provider/model.
 */
export interface ProviderSelectionCriteria {
  /** Required media type */
  mediaType: MediaType;

  /** Preferred model ID (optional) */
  modelId?: string;

  /** Required capabilities */
  requiredCapabilities?: string[];

  /** Resource constraints */
  resourceConstraints?: {
    maxVram?: number;
    maxRam?: number;
    maxCpu?: number;
  };

  /** Priority rules */
  priority?: {
    preferLocal?: boolean;
    preferFast?: boolean;
    preferHighQuality?: boolean;
  };
}

// ─── Provider Registry State ─────────────────────────────────────────────────

/**
 * State for the provider registry.
 */
export interface ProviderRegistryState {
  providers: ProviderConfig[];
  lastUpdated: string;
}
