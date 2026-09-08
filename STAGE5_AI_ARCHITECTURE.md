# Stage 5 — AI Production Architecture Foundation

## Status: ✅ COMPLETE

Stage 5 introduces the AI domain as an independent architectural layer that sits above Research, Script, and Production. This stage builds the foundation for future AI generation without implementing actual media generation.

---

## Architecture

```
                    CHRONOS STUDIO
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    Research          Script         Production
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                    AI Context
                         ↓
                 Generation Intent
                         ↓
                 Generation Job
                         ↓
                 Provider Layer (future)
                         ↓
                Generated Asset (future)
```

### Domain Separation

- **AI is independent**: Does not own Research, Script, or Production data
- **ID-based references**: AI references other domains through IDs only
- **Runtime resolution**: Context builder resolves IDs into structured context at runtime
- **No data duplication**: Source domains remain authoritative

---

## Domain Model

### Core Types (src/types/ai.ts)

#### GenerationSource
Discriminated union identifying the source entity:
```typescript
type GenerationSource =
  | { kind: 'shot'; id: string }
  | { kind: 'scene'; id: string }
  | { kind: 'character'; id: string }
  | { kind: 'location'; id: string }
  | { kind: 'script-scene'; id: string };
```

#### GenerationContext
Structured context assembled from all domains:
```typescript
interface GenerationContext {
  project: { id, title, year, description };
  research: { claimIds, claims, sourceIds, sources, noteIds };
  script: { sceneId, scene, chapterId, chapter };
  production: { sceneId, scene, shotId, shot };
  characters: Array<{ id, name, description, appearance, clothing, ... }>;
  location: { id, name, description, visualDescription, ... } | null;
  continuity: { timeOfDay, weather, characterAppearance, ... } | null;
}
```

#### PromptSpec
Structured prompt specification separating historical facts from creative direction:
```typescript
interface PromptSpec {
  systemInstructions: string;
  subject: string;
  action: string;
  environment: string;
  historicalContext: string;        // ← Factual constraints
  visualDirection: string;          // ← Creative direction
  cameraDirection: string;
  lightingDirection: string;
  mood: string;
  continuity: string;
  negativeConstraints: string[];
  historicalConstraints: HistoricalConstraint[];  // ← Provenance to claims
  finalPrompt: string;              // ← Assembled prompt
}
```

#### GenerationRequest
Describes WHAT the system wants to create:
```typescript
interface GenerationRequest {
  id: string;
  projectId: string;
  type: GenerationType;              // image | video | voice | music | thumbnail
  source: GenerationSource;
  context: GenerationContext;
  prompt: PromptSpec;
  parameters: GenerationParameters;
  priority: Priority;                // low | normal | high
  status: RequestStatus;             // draft | ready | submitted | cancelled
  jobIds: string[];
  notes: string;
  dateCreated: string;
  dateModified: string;
}
```

#### GenerationJob
Represents an execution attempt:
```typescript
interface GenerationJob {
  id: string;
  projectId: string;
  requestId: string;
  status: JobStatus;                 // draft | queued | running | completed | failed | cancelled
  progress: number;                  // 0-100
  providerId: string | null;
  modelId: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  retryCount: number;
  resultAssetIds: string[];          // Future: generated asset references
}
```

#### AIProvider & AIModel
Provider abstraction (interfaces only, no implementation):
```typescript
interface AIProvider {
  id: string;
  name: string;
  description: string;
  capabilities: GenerationCapability[];
  isLocal: boolean;
  isAvailable: boolean;
  configuration: Record<string, string>;
}

interface AIModel {
  id: string;
  providerId: string;
  name: string;
  capability: GenerationCapability;
  description: string;
  supportedParameters: string[];
  limits: { maxDuration?, maxResolution?, maxConcurrentJobs? };
  metadata: Record<string, string>;
}
```

#### GenerationPreset
Reusable templates for different content types:
```typescript
interface GenerationPreset {
  id: string;
  name: string;
  description: string;
  type: GenerationType;
  systemInstructions: string;
  visualDirection: string;
  defaultParameters: Partial<GenerationParameters>;
  defaultNegativeConstraints: string[];
  qualityProfile: 'draft' | 'standard' | 'high' | 'production';
  isBuiltIn: boolean;
}
```

#### GenerationProvenance
Provenance metadata for future generated assets:
```typescript
interface GenerationProvenance {
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
```

#### AIData
Complete AI domain state for a project:
```typescript
interface AIData {
  requests: GenerationRequest[];
  jobs: GenerationJob[];
  presets: GenerationPreset[];
  lastSaved: string;
}
```

---

## Context Builder (src/utils/ai-context.ts)

### Purpose
Resolves generation context from a source reference by walking the domain chain:
```
Source (shot/scene/character/location/script-scene)
  → Production entities
  → Script entities
  → Research entities
  → Structured GenerationContext
```

### Key Functions

#### `buildGenerationContext(input)`
Main entry point. Takes project, source, and all domain data. Returns structured context.

**Resolution Chain:**
1. **Shot** → ProductionScene → ScriptScene → Research claims/sources
2. **Scene** → ScriptScene → Research claims/sources
3. **Character** → Character data only
4. **Location** → Location data only
5. **ScriptScene** → Research claims/sources

**Safety:** All lookups use defensive `.find()` with null checks. Missing references are handled gracefully.

#### `buildPromptSpec(context)`
Deterministic function that assembles a structured prompt from context:
- Separates historical constraints from creative direction
- Preserves provenance to research claims
- Generates final assembled prompt

**Sections:**
- `[HISTORICAL CONTEXT]` — Period, era, factual claims
- `[SUBJECT]` — Primary subject with characters and location
- `[ACTION]` — What is happening
- `[ENVIRONMENT]` — Setting description
- `[VISUAL DIRECTION]` — Artistic direction
- `[CAMERA]` — Shot type, angle, movement, framing
- `[LIGHTING]` — Lighting and atmosphere
- `[MOOD]` — Emotional tone
- `[CONTINUITY]` — Continuity constraints
- `[AVOID]` — Negative constraints

---

## Validation (src/utils/ai-validation.ts)

### Purpose
Ensures generation requests are well-formed before entering the job system.

### Key Functions

#### `validateGenerationRequest(input)`
Validates a request against all domain data. Returns:
```typescript
{
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}
```

**Validates:**
- Source reference exists in correct domain
- All context references (claims, sources, scenes, characters, locations) exist
- Prompt has required subject
- Parameters are valid (e.g., positive duration)

#### `checkContextCompleteness(context)`
Returns warnings (not errors) for missing optional data:
- No research claims linked
- No script scene linked
- No production shot/scene
- No characters specified
- No location specified
- No continuity information

---

## Built-in Presets (src/data/aiPresets.ts)

8 built-in presets for common documentary content types:

1. **Historical Cinematic** — Cinematic historical documentary style
2. **Documentary Interview** — Professional interview setup
3. **Archival Reconstruction** — Historical scene with archival aesthetic
4. **Establishing Shot** — Wide establishing shot
5. **Character Portrait** — Detailed character portrait
6. **Battle Scene** — Dynamic battle/conflict scene
7. **Architectural Reconstruction** — Historical building visualization
8. **Map / Geographic Visualization** — Clean geographic visualization

Each preset defines:
- System instructions
- Visual direction
- Default parameters (quality, aspect ratio, duration)
- Negative constraints
- Quality profile

---

## Persistence

### Storage Keys
```
chronos:project:{projectId}:ai
```

### Integration
- Added to `src/utils/persistence.ts`
- `loadAIData(projectId)` / `saveAIData(projectId, data)`
- Added to `loadProjectData()` return type
- Added to `clearProjectData()` cleanup

### Project Isolation
- Each project has completely separate AI data
- Switching projects loads correct AI data
- Creating new project initializes empty AI data with built-in presets
- Deleting project cleans up AI data

---

## UI Components

### AIWorkspace (src/components/workspace/ai/AIWorkspace.tsx)
Main container with 5 tabs:
1. **Overview** — Stats, active jobs, recent requests
2. **Requests** — List/create/delete generation requests
3. **Jobs** — Job monitoring with state transitions
4. **Context Inspector** — Inspect resolved context for a request
5. **Settings** — Placeholder for future AI settings

### AIOverview
Dashboard showing:
- Total requests, jobs, completed, failed
- Active jobs (running/queued) with progress
- Recent requests list

### GenerationRequests
Request management:
- Search and filter (type, status)
- Create new request (opens RequestCreator modal)
- View request details
- Delete request with confirmation

### GenerationJobs
Job monitoring:
- Filter by status
- State transitions:
  - draft → queued (Queue button)
  - queued → running (Start button)
  - running → completed/failed (Complete/Fail buttons)
  - failed → queued (Retry button)
  - completed/failed/cancelled → delete
- Progress bar for running jobs
- Error display for failed jobs
- Retry count tracking

### ContextInspector
Visual inspection of resolved context:
- Project context
- Research context (claims, sources)
- Script context (scene, chapter, narration)
- Production context (scene, shot, camera details)
- Characters
- Location
- Generated prompt preview
- Historical constraints (highlighted separately)

### RequestCreator
Modal for creating generation requests:
- Source selection (type + entity)
- Generation type (image/video/voice/music/thumbnail)
- Quality, aspect ratio, priority
- Duration (for video/voice)
- Preset selection
- Live context preview
- Live validation feedback
- Prompt preview
- Notes field

**Key Features:**
- Real-time context building as user selects source
- Real-time validation with error display
- Real-time prompt generation
- Context completeness warnings
- Historical constraint highlighting

---

## Cross-Domain Relationships

### AI → Research
- References: `claimIds`, `sourceIds`
- Resolution: Context builder looks up claims and sources by ID
- Safety: Missing claims/sources handled gracefully

### AI → Script
- References: `scriptSceneId`, `chapterId`
- Resolution: Context builder looks up scenes and chapters by ID
- Safety: Missing scenes/chapters handled gracefully

### AI → Production
- References: `shotId`, `sceneId`, `characterIds`, `locationId`
- Resolution: Context builder looks up entities by ID
- Safety: Missing entities handled gracefully

### Historical Integrity
The architecture preserves the distinction between:
- **Historical constraints** — Factual claims from research (must be respected)
- **Creative direction** — Artistic choices (can be modified)

This separation is maintained in:
- `PromptSpec.historicalConstraints` — Array of constraints with provenance
- `PromptSpec.historicalContext` — Dedicated section in prompt
- Context Inspector UI — Historical constraints highlighted separately

---

## Testing

### Build Verification
- ✅ TypeScript compilation: 0 errors
- ✅ Production build: Success (473.73 kB JS, 48.94 kB CSS)
- ✅ All imports resolved correctly

### Functional Tests (Code Review)
- ✅ Context builder resolves all source types
- ✅ Context builder handles missing references
- ✅ Prompt builder generates structured prompts
- ✅ Validation catches invalid references
- ✅ Request creation workflow
- ✅ Job state transitions
- ✅ Context inspection
- ✅ Persistence (load/save/clear)
- ✅ Project isolation

### Integration Tests (Code Review)
- ✅ AI reads Research/Script/Production data correctly
- ✅ No data duplication
- ✅ State synchronization across components
- ✅ Props drilling works correctly

---

## Files Created

### Types & Data (3 files)
1. `src/types/ai.ts` — AI domain types (280 lines)
2. `src/utils/ai-context.ts` — Context builder (450 lines)
3. `src/utils/ai-validation.ts` — Validation layer (180 lines)
4. `src/data/aiPresets.ts` — Built-in presets (150 lines)

### Components (5 files)
5. `src/components/workspace/ai/AIWorkspace.tsx` — Main container (180 lines)
6. `src/components/workspace/ai/AIOverview.tsx` — Dashboard (180 lines)
7. `src/components/workspace/ai/GenerationRequests.tsx` — Request management (180 lines)
8. `src/components/workspace/ai/GenerationJobs.tsx` — Job monitoring (250 lines)
9. `src/components/workspace/ai/ContextInspector.tsx` — Context inspection (250 lines)
10. `src/components/workspace/ai/RequestCreator.tsx` — Request creation modal (350 lines)

### Documentation (1 file)
11. `STAGE5_AI_ARCHITECTURE.md` — This document

**Total: 11 new files, ~2,450 lines of code**

---

## Files Modified

1. `src/utils/persistence.ts` — Added AI persistence functions
2. `src/App.tsx` — Added AI state management, initialization, handlers
3. `src/components/workspace/ProjectOverview.tsx` — Added AI routing and EmptyAISection
4. `src/data/sampleProject.ts` — Added AI section to sample project

---

## Explicitly Deferred

Stage 5 intentionally does NOT implement:

### Generation Execution
- ❌ Actual image generation
- ❌ Actual video generation
- ❌ Actual voice generation
- ❌ Actual music generation
- ❌ Provider integration (ComfyUI, Wan, MiniMax, LTX, Flux, etc.)
- ❌ Job queue system
- ❌ Job execution pipeline

### Asset Management
- ❌ Generated asset storage
- ❌ Asset library integration
- ❌ Asset versioning
- ❌ Asset preview/playback

### Advanced Features
- ❌ Automatic generation workflows
- ❌ Batch generation
- ❌ Generation history
- ❌ A/B testing prompts
- ❌ Prompt optimization
- ❌ AI agents
- ❌ Autonomous director

### Infrastructure
- ❌ Backend services
- ❌ Database
- ❌ WebSockets
- ❌ Cloud storage
- ❌ Authentication
- ❌ External API integration

**Rationale:** These features require the core architecture to be stable first. Stage 5 builds the foundation; future stages will implement execution.

---

## Technical Debt

### Minor Issues
1. **RequestCreator modal is large** (350 lines) — Could be split into sub-components
2. **No undo/redo** — Request/job deletions are permanent
3. **No export** — Cannot export AI data to external formats
4. **No import** — Cannot import AI data from external sources
5. **Preset editing** — Built-in presets cannot be customized yet

### Future Considerations
1. **Prompt versioning** — Track prompt changes over time
2. **Generation analytics** — Track success rates, costs, timing
3. **Collaborative editing** — Multiple users working on same project
4. **Template library** — User-created presets
5. **Prompt library** — Reusable prompt fragments

---

## Stage 6 Readiness

### ✅ READY

The AI architecture foundation is complete and ready for Stage 6 (Provider Integration).

**What's Ready:**
- ✅ Complete type system for AI domain
- ✅ Context builder resolves all source types
- ✅ Prompt builder generates structured prompts
- ✅ Validation ensures well-formed requests
- ✅ Job state machine for execution tracking
- ✅ Provider/Model abstractions defined
- ✅ Preset system for reusable templates
- ✅ Provenance tracking architecture
- ✅ UI for request creation and job monitoring
- ✅ Context inspection for debugging
- ✅ Project-scoped persistence
- ✅ Cross-domain integration (Research, Script, Production)

**What Stage 6 Should Implement:**
- Provider integration (start with one provider)
- Job execution pipeline
- Generated asset storage
- Asset preview/playback
- Real generation workflows

---

## Summary

Stage 5 successfully introduces the AI domain as an independent architectural layer. The implementation:

- ✅ Maintains clean separation from Research, Script, and Production
- ✅ Uses ID-based references with runtime resolution
- ✅ Preserves historical integrity through structured prompts
- ✅ Provides comprehensive validation
- ✅ Includes full UI for request creation and job monitoring
- ✅ Implements project-scoped persistence
- ✅ Builds foundation for future provider integration

**The architecture is production-ready for Stage 6.**
