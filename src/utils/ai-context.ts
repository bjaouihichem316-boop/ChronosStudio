/**
 * Context Builder — Resolves generation context from domain data.
 *
 * This utility takes a source reference (shot, scene, character, location)
 * and resolves all related data from Research, Script, and Production domains
 * into a structured GenerationContext.
 *
 * The context builder does NOT modify any domain data. It only reads.
 */

import { GenerationContext, GenerationSource, PromptSpec, HistoricalConstraint } from '../types/ai';
import { ResearchData } from '../types/research';
import { ScriptData } from '../types/script';
import { ProductionData, Shot, ProductionScene, ProductionCharacter, ProductionLocation, ContinuityInfo } from '../types/production';
import { Project } from '../types';

interface BuildContextInput {
  project: Project;
  source: GenerationSource;
  researchData: ResearchData;
  scriptData: ScriptData;
  productionData: ProductionData;
}

/**
 * Build a complete GenerationContext from a source reference.
 * Resolves all related entities by ID and returns structured context.
 */
export function buildGenerationContext(input: BuildContextInput): GenerationContext {
  const { project, source, researchData, scriptData, productionData } = input;

  // Start with project context
  const context: GenerationContext = {
    project: {
      id: project.id,
      title: project.title,
      year: project.year,
      description: project.description,
    },
    research: {
      claimIds: [],
      claims: [],
      sourceIds: [],
      sources: [],
      noteIds: [],
    },
    script: {
      sceneId: null,
      scene: null,
      chapterId: null,
      chapter: null,
    },
    production: {
      sceneId: null,
      scene: null,
      shotId: null,
      shot: null,
    },
    characters: [],
    location: null,
    continuity: null,
  };

  // Resolve based on source type
  switch (source.kind) {
    case 'shot':
      resolveShotContext(source.id, productionData, scriptData, researchData, context);
      break;
    case 'scene':
      resolveProductionSceneContext(source.id, productionData, scriptData, researchData, context);
      break;
    case 'character':
      resolveCharacterContext(source.id, productionData, context);
      break;
    case 'location':
      resolveLocationContext(source.id, productionData, context);
      break;
    case 'script-scene':
      resolveScriptSceneContext(source.id, scriptData, researchData, context);
      break;
  }

  return context;
}

/**
 * Resolve context from a Shot reference.
 * Walks up the chain: Shot → ProductionScene → ScriptScene → Research
 */
function resolveShotContext(
  shotId: string,
  productionData: ProductionData,
  scriptData: ScriptData,
  researchData: ResearchData,
  context: GenerationContext
): void {
  const shot = productionData.shots.find((s) => s.id === shotId);
  if (!shot) return;

  // Add shot
  context.production.shotId = shot.id;
  context.production.shot = {
    id: shot.id,
    shotType: shot.shotType,
    cameraAngle: shot.cameraAngle,
    cameraMovement: shot.cameraMovement,
    framing: shot.framing,
    subject: shot.subject,
    action: shot.action,
    environment: shot.environment,
    lighting: shot.lighting,
    mood: shot.mood,
    visualDescription: shot.visualDescription,
    duration: shot.duration,
  };

  // Add continuity
  context.continuity = {
    timeOfDay: shot.continuity.timeOfDay,
    weather: shot.continuity.weather,
    characterAppearance: shot.continuity.characterAppearance,
    clothing: shot.continuity.clothing,
    props: shot.continuity.props,
    locationState: shot.continuity.locationState,
    notes: shot.continuity.notes,
  };

  // Resolve production scene
  const productionScene = productionData.scenes.find((s) => s.id === shot.sceneId);
  if (productionScene) {
    context.production.sceneId = productionScene.id;
    context.production.scene = {
      id: productionScene.id,
      title: productionScene.title,
      notes: productionScene.notes,
    };

    // Resolve script scene
    if (productionScene.scriptSceneId) {
      const scriptScene = scriptData.scenes.find((s) => s.id === productionScene.scriptSceneId);
      if (scriptScene) {
        context.script.sceneId = scriptScene.id;
        context.script.scene = {
          id: scriptScene.id,
          title: scriptScene.title,
          narration: scriptScene.narration,
          dialogue: scriptScene.dialogue,
          purpose: scriptScene.purpose,
          timePeriod: scriptScene.timePeriod,
          visualDirection: scriptScene.visualDirection,
        };

        // Resolve chapter
        const chapter = scriptData.chapters.find((c) => c.id === scriptScene.chapterId);
        if (chapter) {
          context.script.chapterId = chapter.id;
          context.script.chapter = {
            id: chapter.id,
            title: chapter.title,
          };
        }

        // Resolve research claims
        resolveResearchClaims(scriptScene.linkedClaimIds, researchData, context);
      }
    }

    // Resolve characters from production scene
    resolveCharacters(productionScene.characterIds, productionData, context);

    // Resolve location from production scene
    if (productionScene.locationId) {
      resolveLocation(productionScene.locationId, productionData, context);
    }
  }

  // Resolve characters from shot
  if (shot.characterIds.length > 0) {
    resolveCharacters(shot.characterIds, productionData, context);
  }

  // Resolve location from shot
  if (shot.locationId) {
    resolveLocation(shot.locationId, productionData, context);
  }
}

/**
 * Resolve context from a ProductionScene reference.
 */
function resolveProductionSceneContext(
  sceneId: string,
  productionData: ProductionData,
  scriptData: ScriptData,
  researchData: ResearchData,
  context: GenerationContext
): void {
  const scene = productionData.scenes.find((s) => s.id === sceneId);
  if (!scene) return;

  context.production.sceneId = scene.id;
  context.production.scene = {
    id: scene.id,
    title: scene.title,
    notes: scene.notes,
  };

  // Resolve continuity from scene
  context.continuity = {
    timeOfDay: scene.continuity.timeOfDay,
    weather: scene.continuity.weather,
    characterAppearance: scene.continuity.characterAppearance,
    clothing: scene.continuity.clothing,
    props: scene.continuity.props,
    locationState: scene.continuity.locationState,
    notes: scene.continuity.notes,
  };

  // Resolve script scene
  if (scene.scriptSceneId) {
    const scriptScene = scriptData.scenes.find((s) => s.id === scene.scriptSceneId);
    if (scriptScene) {
      context.script.sceneId = scriptScene.id;
      context.script.scene = {
        id: scriptScene.id,
        title: scriptScene.title,
        narration: scriptScene.narration,
        dialogue: scriptScene.dialogue,
        purpose: scriptScene.purpose,
        timePeriod: scriptScene.timePeriod,
        visualDirection: scriptScene.visualDirection,
      };

      const chapter = scriptData.chapters.find((c) => c.id === scriptScene.chapterId);
      if (chapter) {
        context.script.chapterId = chapter.id;
        context.script.chapter = {
          id: chapter.id,
          title: chapter.title,
        };
      }

      resolveResearchClaims(scriptScene.linkedClaimIds, researchData, context);
    }
  }

  resolveCharacters(scene.characterIds, productionData, context);

  if (scene.locationId) {
    resolveLocation(scene.locationId, productionData, context);
  }
}

/**
 * Resolve context from a Character reference.
 */
function resolveCharacterContext(
  characterId: string,
  productionData: ProductionData,
  context: GenerationContext
): void {
  const character = productionData.characters.find((c) => c.id === characterId);
  if (!character) return;

  context.characters.push({
    id: character.id,
    name: character.name,
    description: character.description,
    appearance: character.appearance,
    clothing: character.clothing,
    historicalRole: character.historicalRole,
    era: character.era,
  });
}

/**
 * Resolve context from a Location reference.
 */
function resolveLocationContext(
  locationId: string,
  productionData: ProductionData,
  context: GenerationContext
): void {
  resolveLocation(locationId, productionData, context);
}

/**
 * Resolve context from a ScriptScene reference.
 */
function resolveScriptSceneContext(
  sceneId: string,
  scriptData: ScriptData,
  researchData: ResearchData,
  context: GenerationContext
): void {
  const scene = scriptData.scenes.find((s) => s.id === sceneId);
  if (!scene) return;

  context.script.sceneId = scene.id;
  context.script.scene = {
    id: scene.id,
    title: scene.title,
    narration: scene.narration,
    dialogue: scene.dialogue,
    purpose: scene.purpose,
    timePeriod: scene.timePeriod,
    visualDirection: scene.visualDirection,
  };

  const chapter = scriptData.chapters.find((c) => c.id === scene.chapterId);
  if (chapter) {
    context.script.chapterId = chapter.id;
    context.script.chapter = {
      id: chapter.id,
      title: chapter.title,
    };
  }

  resolveResearchClaims(scene.linkedClaimIds, researchData, context);
}

/**
 * Resolve research claims and their sources.
 */
function resolveResearchClaims(
  claimIds: string[],
  researchData: ResearchData,
  context: GenerationContext
): void {
  for (const claimId of claimIds) {
    const claim = researchData.claims.find((c) => c.id === claimId);
    if (!claim) continue;

    context.research.claimIds.push(claim.id);
    context.research.claims.push({
      id: claim.id,
      title: claim.title,
      status: claim.status,
      description: claim.description,
    });

    // Resolve sources for this claim
    for (const sourceId of claim.sourceIds) {
      if (context.research.sourceIds.includes(sourceId)) continue;
      const source = researchData.sources.find((s) => s.id === sourceId);
      if (!source) continue;

      context.research.sourceIds.push(source.id);
      context.research.sources.push({
        id: source.id,
        title: source.title,
        type: source.type,
        reliability: source.reliability,
      });
    }
  }
}

/**
 * Resolve characters by IDs.
 */
function resolveCharacters(
  characterIds: string[],
  productionData: ProductionData,
  context: GenerationContext
): void {
  for (const charId of characterIds) {
    if (context.characters.find((c) => c.id === charId)) continue;
    const character = productionData.characters.find((c) => c.id === charId);
    if (!character) continue;

    context.characters.push({
      id: character.id,
      name: character.name,
      description: character.description,
      appearance: character.appearance,
      clothing: character.clothing,
      historicalRole: character.historicalRole,
      era: character.era,
    });
  }
}

/**
 * Resolve a location by ID.
 */
function resolveLocation(
  locationId: string,
  productionData: ProductionData,
  context: GenerationContext
): void {
  const location = productionData.locations.find((l) => l.id === locationId);
  if (!location) return;

  context.location = {
    id: location.id,
    name: location.name,
    description: location.description,
    visualDescription: location.visualDescription,
    architecture: location.architecture,
    atmosphere: location.atmosphere,
    era: location.era,
  };
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

/**
 * Build a PromptSpec from a GenerationContext.
 * This is a deterministic function — given the same context, it produces
 * the same prompt structure.
 */
export function buildPromptSpec(context: GenerationContext): PromptSpec {
  const historicalConstraints: HistoricalConstraint[] = context.research.claims.map((claim) => {
    const sourceIds = context.research.sources
      .filter((s) => context.research.sourceIds.includes(s.id))
      .map((s) => s.id);

    return {
      claimId: claim.id,
      claimTitle: claim.title,
      sourceIds,
      description: claim.description,
    };
  });

  const subject = buildSubject(context);
  const action = buildAction(context);
  const environment = buildEnvironment(context);
  const historicalContext = buildHistoricalContext(context);
  const visualDirection = buildVisualDirection(context);
  const cameraDirection = buildCameraDirection(context);
  const lightingDirection = buildLightingDirection(context);
  const mood = buildMood(context);
  const continuity = buildContinuity(context);
  const negativeConstraints = buildNegativeConstraints(context);

  // Assemble final prompt
  const finalPrompt = assembleFinalPrompt({
    subject,
    action,
    environment,
    historicalContext,
    visualDirection,
    cameraDirection,
    lightingDirection,
    mood,
    continuity,
    negativeConstraints,
  });

  return {
    systemInstructions: 'You are a professional historical documentary cinematographer. Maintain factual accuracy and visual consistency with the period.',
    subject,
    action,
    environment,
    historicalContext,
    visualDirection,
    cameraDirection,
    lightingDirection,
    mood,
    continuity,
    negativeConstraints,
    historicalConstraints,
    finalPrompt,
  };
}

function buildSubject(context: GenerationContext): string {
  const parts: string[] = [];

  if (context.production.shot) {
    parts.push(context.production.shot.subject);
  }

  if (context.characters.length > 0) {
    const charNames = context.characters.map((c) => c.name).join(', ');
    parts.push(`featuring ${charNames}`);
  }

  if (context.location) {
    parts.push(`at ${context.location.name}`);
  }

  return parts.join(' ') || 'Historical scene';
}

function buildAction(context: GenerationContext): string {
  if (context.production.shot?.action) {
    return context.production.shot.action;
  }
  if (context.script.scene?.narration) {
    return context.script.scene.narration;
  }
  return '';
}

function buildEnvironment(context: GenerationContext): string {
  const parts: string[] = [];

  if (context.production.shot?.environment) {
    parts.push(context.production.shot.environment);
  }

  if (context.location?.visualDescription) {
    parts.push(context.location.visualDescription);
  }

  if (context.location?.architecture) {
    parts.push(context.location.architecture);
  }

  return parts.join('. ') || '';
}

function buildHistoricalContext(context: GenerationContext): string {
  const parts: string[] = [];

  if (context.project.year) {
    parts.push(`Period: ${context.project.year}`);
  }

  if (context.script.scene?.timePeriod) {
    parts.push(context.script.scene.timePeriod);
  }

  if (context.location?.era) {
    parts.push(`Era: ${context.location.era}`);
  }

  if (context.research.claims.length > 0) {
    const claims = context.research.claims.map((c) => c.title).join('; ');
    parts.push(`Historical facts: ${claims}`);
  }

  return parts.join('. ') || '';
}

function buildVisualDirection(context: GenerationContext): string {
  if (context.script.scene?.visualDirection) {
    return context.script.scene.visualDirection;
  }
  if (context.production.shot?.visualDescription) {
    return context.production.shot.visualDescription;
  }
  return '';
}

function buildCameraDirection(context: GenerationContext): string {
  if (!context.production.shot) return '';

  const parts: string[] = [];
  parts.push(`Shot type: ${context.production.shot.shotType}`);
  parts.push(`Camera angle: ${context.production.shot.cameraAngle}`);
  parts.push(`Camera movement: ${context.production.shot.cameraMovement}`);
  parts.push(`Framing: ${context.production.shot.framing}`);

  return parts.join('. ');
}

function buildLightingDirection(context: GenerationContext): string {
  if (context.production.shot?.lighting) {
    return context.production.shot.lighting;
  }
  if (context.continuity) {
    return `Time of day: ${context.continuity.timeOfDay}, Weather: ${context.continuity.weather}`;
  }
  return '';
}

function buildMood(context: GenerationContext): string {
  if (context.production.shot?.mood) {
    return context.production.shot.mood;
  }
  if (context.location?.atmosphere) {
    return context.location.atmosphere;
  }
  return '';
}

function buildContinuity(context: GenerationContext): string {
  if (!context.continuity) return '';

  const parts: string[] = [];

  if (context.continuity.characterAppearance) {
    parts.push(`Character appearance: ${context.continuity.characterAppearance}`);
  }
  if (context.continuity.clothing) {
    parts.push(`Clothing: ${context.continuity.clothing}`);
  }
  if (context.continuity.locationState) {
    parts.push(`Location state: ${context.continuity.locationState}`);
  }
  if (context.continuity.notes) {
    parts.push(context.continuity.notes);
  }

  return parts.join('. ');
}

function buildNegativeConstraints(context: GenerationContext): string[] {
  const constraints: string[] = [
    'modern elements',
    'anachronistic clothing',
    'contemporary architecture',
    'text overlays',
    'watermarks',
  ];

  return constraints;
}

function assembleFinalPrompt(parts: {
  subject: string;
  action: string;
  environment: string;
  historicalContext: string;
  visualDirection: string;
  cameraDirection: string;
  lightingDirection: string;
  mood: string;
  continuity: string;
  negativeConstraints: string[];
}): string {
  const sections: string[] = [];

  if (parts.historicalContext) {
    sections.push(`[HISTORICAL CONTEXT]\n${parts.historicalContext}`);
  }

  if (parts.subject) {
    sections.push(`[SUBJECT]\n${parts.subject}`);
  }

  if (parts.action) {
    sections.push(`[ACTION]\n${parts.action}`);
  }

  if (parts.environment) {
    sections.push(`[ENVIRONMENT]\n${parts.environment}`);
  }

  if (parts.visualDirection) {
    sections.push(`[VISUAL DIRECTION]\n${parts.visualDirection}`);
  }

  if (parts.cameraDirection) {
    sections.push(`[CAMERA]\n${parts.cameraDirection}`);
  }

  if (parts.lightingDirection) {
    sections.push(`[LIGHTING]\n${parts.lightingDirection}`);
  }

  if (parts.mood) {
    sections.push(`[MOOD]\n${parts.mood}`);
  }

  if (parts.continuity) {
    sections.push(`[CONTINUITY]\n${parts.continuity}`);
  }

  if (parts.negativeConstraints.length > 0) {
    sections.push(`[AVOID]\n${parts.negativeConstraints.join(', ')}`);
  }

  return sections.join('\n\n');
}
