/**
 * Generation Pipeline Types — Chronos Studio Stage 7
 *
 * This domain manages the execution pipeline for AI generation.
 * It transforms GenerationRequests into executable tasks with dependencies,
 * tracks execution through mock providers, and produces outputs with provenance.
 *
 * Pipeline flow:
 *   GenerationRequest → GenerationTask → Execution → GenerationOutput → Asset
 */

import { GenerationType, GenerationSource, Priority, GenerationParameters } from './ai';

// ─── Pipeline Status ─────────────────────────────────────────────────────────

export type PipelineStatus =
  | 'pending'
  | 'ready'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'blocked';

// ─── Media Types ─────────────────────────────────────────────────────────────

export type MediaType = 'image' | 'video' | 'audio' | 'voice' | 'music';

export interface ImageOutput {
  type: 'image';
  resolution: string; // e.g., "1920x1080"
  aspectRatio: string; // e.g., "16:9"
  format: string; // e.g., "png", "jpg"
}

export interface VideoOutput {
  type: 'video';
  resolution: string;
  fps: number;
  duration: number; // seconds
  format: string; // e.g., "mp4", "webm"
}

export interface AudioOutput {
  type: 'audio';
  duration: number; // seconds
  sampleRate: number; // e.g., 44100
  format: string; // e.g., "mp3", "wav"
}

export interface VoiceOutput {
  type: 'voice';
  duration: number;
  speaker: string; // voice reference ID
  format: string;
}

export interface MusicOutput {
  type: 'music';
  duration: number;
  tempo?: number; // BPM
  format: string;
}

export type MediaOutput = ImageOutput | VideoOutput | AudioOutput | VoiceOutput | MusicOutput;

// ─── Generation Task ─────────────────────────────────────────────────────────

/**
 * A generation task represents a unit of work in the pipeline.
 * Tasks can depend on other tasks and track their execution state.
 */
export interface GenerationTask {
  id: string;
  projectId: string;

  /** The request this task was created from */
  requestId: string;

  /** What type of media to generate */
  mediaType: MediaType;

  /** Source reference (shot, scene, character, location, script-scene) */
  sourceReference: GenerationSource;

  /** Task dependencies — IDs of tasks that must complete first */
  dependencies: string[];

  /** Priority for queue ordering */
  priority: Priority;

  /** Current status */
  status: PipelineStatus;

  /** Progress 0-100 */
  progress: number;

  /** Timing */
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;

  /** Error information if failed */
  error: string | null;

  /** Number of retry attempts */
  retryCount: number;

  /** Maximum retry attempts */
  maxRetries: number;

  /** IDs of generated outputs */
  outputIds: string[];

  /** Generation parameters */
  parameters: GenerationParameters;

  /** Provider that will execute this task */
  providerId: string | null;

  /** Model within the provider */
  modelId: string | null;

  /** User notes */
  notes: string;
}

// ─── Generation Output ───────────────────────────────────────────────────────

/**
 * A generation output represents a produced artifact from a task.
 * Outputs preserve complete provenance for traceability.
 */
export interface GenerationOutput {
  id: string;
  projectId: string;

  /** The task that produced this output */
  taskId: string;

  /** The request this output originated from */
  requestId: string;

  /** Media type */
  mediaType: MediaType;

  /** Output specification (resolution, duration, etc.) */
  output: MediaOutput;

  /** Mock artifact identifier (future: actual file path/URL) */
  artifactId: string;

  /** Generation metadata */
  metadata: {
    providerId: string;
    modelId: string;
    generationTime: number; // milliseconds
    seed?: number;
    parameters: GenerationParameters;
  };

  /** Complete provenance chain */
  provenance: {
    sourceType: GenerationSource['kind'];
    sourceId: string;
    contextSnapshot: string; // Serialized GenerationContext hash
    promptHash: string; // Hash of the prompt used
  };

  /** Creation timestamp */
  createdAt: string;

  /** Status */
  status: 'completed' | 'failed';

  /** Error if failed */
  error: string | null;
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

/**
 * A pipeline represents a collection of related tasks.
 * Pipelines group tasks by request or workflow.
 */
export interface GenerationPipeline {
  id: string;
  projectId: string;

  /** Pipeline name */
  name: string;

  /** Description */
  description: string;

  /** Task IDs in this pipeline */
  taskIds: string[];

  /** Overall pipeline status */
  status: PipelineStatus;

  /** Creation timestamp */
  createdAt: string;

  /** Last update */
  updatedAt: string;
}

// ─── Pipeline Data ───────────────────────────────────────────────────────────

/**
 * The complete pipeline domain state for a project.
 */
export interface PipelineData {
  pipelines: GenerationPipeline[];
  tasks: GenerationTask[];
  outputs: GenerationOutput[];
  lastSaved: string;
}

// ─── Execution Request ───────────────────────────────────────────────────────

/**
 * Request sent to a provider for execution.
 * This is the contract between pipeline and provider.
 */
export interface AIExecutionRequest {
  taskId: string;
  mediaType: MediaType;
  parameters: GenerationParameters;
  prompt: string;
  context: any; // Serialized context
}

/**
 * Result returned from a provider after execution.
 */
export interface AIExecutionResult {
  success: boolean;
  output?: MediaOutput;
  artifactId?: string;
  generationTime: number;
  error?: string;
}

// ─── Provider Contract ───────────────────────────────────────────────────────

/**
 * Provider capabilities specification.
 */
export interface AIProviderCapabilities {
  mediaTypes: MediaType[];
  maxConcurrentTasks: number;
  supportedResolutions?: string[];
  supportedFormats?: string[];
}

/**
 * Provider interface contract.
 * All providers (mock or real) must implement this.
 */
export interface IAIProvider {
  id: string;
  name: string;
  capabilities: AIProviderCapabilities;

  /**
   * Execute a generation task.
   * Returns a result with output or error.
   */
  execute(request: AIExecutionRequest): Promise<AIExecutionResult>;

  /**
   * Check if provider is available.
   */
  isAvailable(): boolean;
}
