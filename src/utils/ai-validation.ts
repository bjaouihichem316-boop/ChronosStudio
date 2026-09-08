/**
 * Validation layer for generation requests.
 * Ensures requests are well-formed before entering the job system.
 */

import { GenerationRequest, GenerationSource, GenerationContext } from '../types/ai';
import { ResearchData } from '../types/research';
import { ScriptData } from '../types/script';
import { ProductionData } from '../types/production';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidateInput {
  request: Omit<GenerationRequest, 'id' | 'dateCreated' | 'dateModified' | 'jobIds'>;
  researchData: ResearchData;
  scriptData: ScriptData;
  productionData: ProductionData;
}

/**
 * Validate a generation request before it can be created.
 * Returns a result with any validation errors found.
 */
export function validateGenerationRequest(input: ValidateInput): ValidationResult {
  const { request, researchData, scriptData, productionData } = input;
  const errors: ValidationError[] = [];

  // Validate source reference
  validateSource(request.source, productionData, scriptData, errors);

  // Validate context references
  validateContext(request.context, researchData, scriptData, productionData, errors);

  // Validate prompt
  validatePrompt(request.prompt, errors);

  // Validate parameters
  validateParameters(request.parameters, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateSource(
  source: GenerationSource,
  productionData: ProductionData,
  scriptData: ScriptData,
  errors: ValidationError[]
): void {
  switch (source.kind) {
    case 'shot': {
      const shot = productionData.shots.find((s) => s.id === source.id);
      if (!shot) {
        errors.push({ field: 'source', message: `Shot "${source.id}" not found` });
      }
      break;
    }
    case 'scene': {
      const scene = productionData.scenes.find((s) => s.id === source.id);
      if (!scene) {
        errors.push({ field: 'source', message: `Production scene "${source.id}" not found` });
      }
      break;
    }
    case 'character': {
      const character = productionData.characters.find((c) => c.id === source.id);
      if (!character) {
        errors.push({ field: 'source', message: `Character "${source.id}" not found` });
      }
      break;
    }
    case 'location': {
      const location = productionData.locations.find((l) => l.id === source.id);
      if (!location) {
        errors.push({ field: 'source', message: `Location "${source.id}" not found` });
      }
      break;
    }
    case 'script-scene': {
      const scene = scriptData.scenes.find((s) => s.id === source.id);
      if (!scene) {
        errors.push({ field: 'source', message: `Script scene "${source.id}" not found` });
      }
      break;
    }
  }
}

function validateContext(
  context: GenerationContext,
  researchData: ResearchData,
  scriptData: ScriptData,
  productionData: ProductionData,
  errors: ValidationError[]
): void {
  // Validate research references
  for (const claimId of context.research.claimIds) {
    const claim = researchData.claims.find((c) => c.id === claimId);
    if (!claim) {
      errors.push({ field: 'context.research', message: `Research claim "${claimId}" not found` });
    }
  }

  for (const sourceId of context.research.sourceIds) {
    const source = researchData.sources.find((s) => s.id === sourceId);
    if (!source) {
      errors.push({ field: 'context.research', message: `Research source "${sourceId}" not found` });
    }
  }

  // Validate script references
  if (context.script.sceneId) {
    const scene = scriptData.scenes.find((s) => s.id === context.script.sceneId);
    if (!scene) {
      errors.push({ field: 'context.script', message: `Script scene "${context.script.sceneId}" not found` });
    }
  }

  if (context.script.chapterId) {
    const chapter = scriptData.chapters.find((c) => c.id === context.script.chapterId);
    if (!chapter) {
      errors.push({ field: 'context.script', message: `Script chapter "${context.script.chapterId}" not found` });
    }
  }

  // Validate production references
  if (context.production.sceneId) {
    const scene = productionData.scenes.find((s) => s.id === context.production.sceneId);
    if (!scene) {
      errors.push({ field: 'context.production', message: `Production scene "${context.production.sceneId}" not found` });
    }
  }

  if (context.production.shotId) {
    const shot = productionData.shots.find((s) => s.id === context.production.shotId);
    if (!shot) {
      errors.push({ field: 'context.production', message: `Shot "${context.production.shotId}" not found` });
    }
  }

  // Validate character references
  for (const char of context.characters) {
    const character = productionData.characters.find((c) => c.id === char.id);
    if (!character) {
      errors.push({ field: 'context.characters', message: `Character "${char.id}" not found` });
    }
  }

  // Validate location reference
  if (context.location) {
    const location = productionData.locations.find((l) => l.id === context.location!.id);
    if (!location) {
      errors.push({ field: 'context.location', message: `Location "${context.location.id}" not found` });
    }
  }
}

function validatePrompt(
  prompt: GenerationRequest['prompt'],
  errors: ValidationError[]
): void {
  if (!prompt.subject.trim()) {
    errors.push({ field: 'prompt.subject', message: 'Subject is required' });
  }
}

function validateParameters(
  parameters: GenerationRequest['parameters'],
  errors: ValidationError[]
): void {
  if (parameters.duration !== undefined && parameters.duration <= 0) {
    errors.push({ field: 'parameters.duration', message: 'Duration must be positive' });
  }
}

/**
 * Check if a context has enough information for generation.
 * Returns warnings (not errors) for missing optional data.
 */
export function checkContextCompleteness(context: GenerationContext): string[] {
  const warnings: string[] = [];

  if (context.research.claims.length === 0) {
    warnings.push('No research claims linked — factual accuracy cannot be verified');
  }

  if (!context.script.scene) {
    warnings.push('No script scene linked — narrative context missing');
  }

  if (!context.production.shot && !context.production.scene) {
    warnings.push('No production shot or scene — visual direction missing');
  }

  if (context.characters.length === 0) {
    warnings.push('No characters specified');
  }

  if (!context.location) {
    warnings.push('No location specified');
  }

  if (!context.continuity) {
    warnings.push('No continuity information');
  }

  return warnings;
}
