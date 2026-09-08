/**
 * AI Domain Types — Chronos Studio Stage 5
 *
 * This domain is independent from Research, Script, and Production.
 * It references those domains through IDs only and resolves them
 * at runtime via the context builder.
 *
 * The architecture supports a future pipeline:
 *   Research → Script → Production → Context → Prompt → Request → Job → Provider → Asset
 *
 * Stage 5 implements up to the Job level. Provider execution is future work.
 */

// ─── Source Reference ────────────────────────────────────────────────────────

/**
 * Discriminated union identifying which entity a generation request originates from.
 * Uses IDs only — never embeds full domain objects.
 */
export type GenerationSource =
  | { kind: 'shot'; id: string }
  | { kind: 'scene'; id: string }
  | { kind: 'character'; id: string }
  | { kind: 'location'; id: string }
  | { kind: 'script-scene'; id: string };

// ─── Generation Types ────────────────────────────────────────────────────────

export type GenerationCapability = 'image' | 'video' | 'voice' | 'music' | 'text';

export type GenerationType = GenerationCapability | 'thumbnail';

export type Priority = 'low' | 'normal' | 'high';

// ─── Prompt Architecture ─────────────────────────────────────────────────────

/**
 * Structured prompt specification.
 * Separates historical facts from creative direction so documentary
 * integrity is preserved through the generation pipeline.
 */
export interface PromptSpec {
  /** System-level instructions (e.g., "You are a historical documentary cinematographer") */
  systemInstructions: string;

  /** The primary subject of the generation */
  subject: string;

  /** What is happening / action */
  action: string;

  /** Environment / setting description */
  environment: string;

  /** Historical period and factual context — MUST be respected */
  historicalContext: string;

  /** Artistic visual direction */
  visualDirection: string;

  /** Camera-specific instructions (for video/shot generation) */
  cameraDirection: string;

  /** Lighting and atmosphere */
  lightingDirection: string;

  /** Emotional tone */
  mood: string;

  /** Continuity constraints from previous shots */
  continuity: string;

  /** Things that must NOT appear (negative prompt) */
  negativeConstraints: string[];

  /**
   * Historical constraints — factual claims that must be respected.
   * These are distinct from creative direction and must be preserved
   * separately for documentary integrity.
   */
  historicalConstraints: HistoricalConstraint[];

  /** The final assembled prompt (computed, not user-edited) */
  finalPrompt: string;
}

/**
 * A single historical constraint tied to a research claim.
 * Preserves provenance back to the source material.
 */
export interface HistoricalConstraint {
  claimId: string;
  claimTitle: string;
  sourceIds: string[];
  description: string;
}

// ─── Generation Parameters ───────────────────────────────────────────────────

/**
 * Parameters that control generation quality and behavior.
 * Provider-specific parameters will be added when providers are integrated.
 */
export interface GenerationParameters {
  /** Quality preset */
  quality: 'draft' | 'standard' | 'high' | 'production';

  /** Aspect ratio */
  aspectRatio: string;

  /** Duration in seconds (for video/voice) */
  duration?: number;

  /** Style preset ID (references a GenerationPreset) */
  presetId?: string;

  /** Seed for reproducibility */
  seed?: number;

  /** Additional provider-specific parameters */
  extra: Record<string, string | number | boolean>;
}

// ─── Generation Context ──────────────────────────────────────────────────────

/**
 * Structured context assembled from all domains.
 * This is the "intelligence" behind a generation request — it explains
 * WHY the system is asking for this specific generation.
 *
 * All references are resolved at build time but stored as structured data.
 */
export interface GenerationContext {
  /** Project-level context */
  project: {
    id: string;
    title: string;
    year: string;
    description: string;
  };

  /** Research context — claims and sources */
  research: {
    claimIds: string[];
    claims: Array<{
      id: string;
      title: string;
      status: string;
      description: string;
    }>;
    sourceIds: string[];
    sources: Array<{
      id: string;
      title: string;
      type: string;
      reliability: string;
    }>;
    noteIds: string[];
  };

  /** Script context */
  script: {
    sceneId: string | null;
    scene: {
      id: string;
      title: string;
      narration: string;
      dialogue: string;
      purpose: string;
      timePeriod: string;
      visualDirection: string;
    } | null;
    chapterId: string | null;
    chapter: {
      id: string;
      title: string;
    } | null;
  };

  /** Production context */
  production: {
    sceneId: string | null;
    scene: {
      id: string;
      title: string;
      notes: string;
    } | null;
    shotId: string | null;
    shot: {
      id: string;
      shotType: string;
      cameraAngle: string;
      cameraMovement: string;
      framing: string;
      subject: string;
      action: string;
      environment: string;
      lighting: string;
      mood: string;
      visualDescription: string;
      duration: number;
    } | null;
  };

  /** Character context */
  characters: Array<{
    id: string;
    name: string;
    description: string;
    appearance: string;
    clothing: string;
    historicalRole: string;
    era: string;
  }>;

  /** Location context */
  location: {
    id: string;
    name: string;
    description: string;
    visualDescription: string;
    architecture: string;
    atmosphere: string;
    era: string;
  } | null;

  /** Continuity context */
  continuity: {
    timeOfDay: string;
    weather: string;
    characterAppearance: string;
    clothing: string;
    props: string[];
    locationState: string;
    notes: string;
  } | null;

  /** Visual Bible context — canonical visual identity */
  visualBible?: {
    /** Global visual canon rules */
    visualCanon: {
      cinematography: {
        visualStyle: string;
        lensLanguage: string;
        framingPrinciples: string;
        cameraMovement: string;
        depthOfField: string;
        compositionRules: string;
      } | null;
      lighting: {
        philosophy: string;
        contrast: string;
        naturalLightRules: string;
        artificialLightRules: string;
        interiorRules: string;
        exteriorRules: string;
        timeOfDayRules: string;
      } | null;
      color: {
        palette: string;
        saturation: string;
        contrast: string;
        historicalTreatment: string;
        reconstructionTreatment: string;
      } | null;
      texture: {
        filmGrain: string;
        realismLevel: string;
        environmentalTexture: string;
        archivalTreatment: string;
      } | null;
      motion: {
        documentaryRealism: string;
        cameraMovementPhilosophy: string;
        pacing: string;
      } | null;
      historicalAccuracy: string;
      modernObjectsPolicy: string;
    } | null;

    /** Character canons resolved from production characters */
    characters: Array<{
      productionCharacterId: string;
      canonId: string;
      canonicalName: string;
      historicalRole: string;
      era: string;
      physicalDescription: {
        ageRange: string;
        height: string;
        build: string;
        hair: string;
        facialFeatures: string;
        skinTone: string;
        distinguishingFeatures: string;
      };
      defaultClothing: {
        description: string;
        materials: string;
        colors: string;
        accessories: string;
        historicalAccuracy: string;
      };
      cinematicIdentity: {
        screenPresence: string;
        typicalExpressions: string;
        posture: string;
        movementStyle: string;
        emotionalRange: string;
        visualArchetype: string;
      };
      activeVisualState: {
        id: string;
        name: string;
        description: string;
        period: string;
        clothing: {
          description: string;
          materials: string;
          colors: string;
          accessories: string;
          historicalAccuracy: string;
        };
        appearanceChanges: string;
        props: string[];
      } | null;
      historicalReferences: Array<{
        claimId: string;
        sourceIds: string[];
        certainty: string;
        notes: string;
      }>;
      continuityRules: string;
    }>;

    /** Location canon resolved from production location */
    location: {
      productionLocationId: string;
      canonId: string;
      canonicalName: string;
      historicalPeriod: string;
      architecture: {
        style: string;
        materials: string;
        structures: string;
        colors: string;
        distinguishingFeatures: string;
        historicalAccuracy: string;
      };
      environment: {
        geography: string;
        climate: string;
        timeOfDay: string;
        atmosphere: string;
        soundscape: string;
      };
      activeVisualState: {
        id: string;
        name: string;
        description: string;
        period: string;
        condition: string;
        architectureChanges: string;
        environmentalChanges: string;
      } | null;
      historicalReferences: Array<{
        claimId: string;
        sourceIds: string[];
        certainty: string;
        notes: string;
      }>;
      continuityRules: string;
    } | null;
  };
}

// ─── Generation Request ──────────────────────────────────────────────────────

export type RequestStatus = 'draft' | 'ready' | 'submitted' | 'cancelled';

/**
 * A generation request describes WHAT the system wants to create.
 * It contains structured context, prompt, and parameters — but does NOT
 * execute generation. That is the job of a GenerationJob + Provider.
 */
export interface GenerationRequest {
  id: string;
  projectId: string;

  /** What kind of media to generate */
  type: GenerationType;

  /** Which entity this request originates from */
  source: GenerationSource;

  /** Structured context explaining why this generation is needed */
  context: GenerationContext;

  /** Structured prompt specification */
  prompt: PromptSpec;

  /** Generation parameters */
  parameters: GenerationParameters;

  /** Priority for job queue (future) */
  priority: Priority;

  /** Current status of the request */
  status: RequestStatus;

  /** IDs of jobs created from this request */
  jobIds: string[];

  /** User notes about this request */
  notes: string;

  dateCreated: string;
  dateModified: string;
}

// ─── Generation Job ──────────────────────────────────────────────────────────

export type JobStatus = 'draft' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * A generation job represents an execution attempt for a request.
 * In Stage 5, jobs are local state only — no actual execution.
 * Future stages will connect jobs to providers.
 */
export interface GenerationJob {
  id: string;
  projectId: string;

  /** The request this job is executing */
  requestId: string;

  /** Current status */
  status: JobStatus;

  /** Progress 0-100 */
  progress: number;

  /** Provider that will execute (or did execute) this job */
  providerId: string | null;

  /** Model within the provider */
  modelId: string | null;

  /** Timing */
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;

  /** Error information if failed */
  error: string | null;

  /** Number of retry attempts */
  retryCount: number;

  /** IDs of generated assets (future — empty in Stage 5) */
  resultAssetIds: string[];
}

// ─── Provider Abstraction ────────────────────────────────────────────────────

/**
 * Describes an AI provider's capabilities.
 * Providers are not implemented in Stage 5 — only the contract.
 */
export interface AIProvider {
  id: string;
  name: string;
  description: string;
  capabilities: GenerationCapability[];
  isLocal: boolean;
  isAvailable: boolean;
  configuration: Record<string, string>;
}

/**
 * Describes a specific model within a provider.
 */
export interface AIModel {
  id: string;
  providerId: string;
  name: string;
  capability: GenerationCapability;
  description: string;
  supportedParameters: string[];
  limits: {
    maxDuration?: number;
    maxResolution?: string;
    maxConcurrentJobs?: number;
  };
  metadata: Record<string, string>;
}

// ─── Generation Presets ──────────────────────────────────────────────────────

/**
 * A reusable preset that defines default generation parameters
 * and prompt structure for a particular type of content.
 */
export interface GenerationPreset {
  id: string;
  name: string;
  description: string;

  /** What type of generation this preset is for */
  type: GenerationType;

  /** Default system instructions */
  systemInstructions: string;

  /** Default visual direction */
  visualDirection: string;

  /** Default parameters */
  defaultParameters: Partial<GenerationParameters>;

  /** Default negative constraints */
  defaultNegativeConstraints: string[];

  /** Quality profile */
  qualityProfile: 'draft' | 'standard' | 'high' | 'production';

  /** Whether this is a built-in preset */
  isBuiltIn: boolean;
}

// ─── Provenance ──────────────────────────────────────────────────────────────

/**
 * Provenance metadata for a generated asset.
 * In Stage 5, this is a type definition only — no actual assets are generated.
 * Future stages will create these when generation completes.
 */
export interface GenerationProvenance {
  assetId: string;
  projectId: string;
  requestId: string;
  jobId: string;
  sourceType: GenerationSource['kind'];
  sourceId: string;
  providerId: string;
  modelId: string;
  promptVersion: string;
  generationType: GenerationType;
  createdAt: string;
  parameters: GenerationParameters;
}

// ─── AI Domain Data ──────────────────────────────────────────────────────────

/**
 * The complete AI domain state for a project.
 * Persisted per-project using the same pattern as other domains.
 */
export interface AIData {
  requests: GenerationRequest[];
  jobs: GenerationJob[];
  presets: GenerationPreset[];
  lastSaved: string;
}
