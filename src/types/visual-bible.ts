// Visual Bible domain types
// Defines canonical visual identity for characters and locations
// Provides continuity system for AI generation

export type HistoricalCertainty = 'verified' | 'probable' | 'interpreted' | 'unknown';

export interface HistoricalReference {
  claimId: string; // Research claim
  sourceIds: string[]; // Supporting sources
  certainty: HistoricalCertainty;
  notes: string;
}

// ─── Character Visual Identity ─────────────────────────────────────────────

export interface CharacterPhysicalDescription {
  ageRange: string; // e.g., "30-35"
  height: string;
  build: string;
  hair: string;
  facialFeatures: string;
  skinTone: string;
  distinguishingFeatures: string;
}

export interface CharacterClothing {
  description: string;
  materials: string;
  colors: string;
  accessories: string;
  historicalAccuracy: HistoricalCertainty;
}

export interface CharacterCinematicIdentity {
  screenPresence: string; // e.g., "commanding", "quiet intensity"
  typicalExpressions: string;
  posture: string;
  movementStyle: string;
  emotionalRange: string;
  visualArchetype: string; // e.g., "tragic hero", "wise elder"
}

export interface CharacterVisualState {
  id: string;
  name: string; // e.g., "Before Siege", "During Siege"
  description: string;
  period: string; // Historical period
  clothing: CharacterClothing;
  appearanceChanges: string; // What's different in this state
  props: string[];
  continuityNotes: string;
  referenceImageIds: string[]; // Future: reference to actual images
  historicalReferences: HistoricalReference[];
  dateCreated: string;
  dateModified: string;
}

export interface CharacterCanon {
  id: string;
  productionCharacterId: string; // Links to Production domain
  
  // Identity
  canonicalName: string;
  aliases: string[];
  historicalRole: string;
  era: string;
  
  // Historical identity
  historicalDescription: string;
  historicalReferences: HistoricalReference[];
  uncertaintyNotes: string;
  
  // Canonical visual identity
  physicalDescription: CharacterPhysicalDescription;
  defaultClothing: CharacterClothing;
  cinematicIdentity: CharacterCinematicIdentity;
  
  // Visual states (different appearances across time)
  visualStates: CharacterVisualState[];
  
  // Continuity
  continuityRules: string; // Global rules for this character
  
  // References
  referenceImageIds: string[]; // Future: reference images
  
  // Metadata
  dateCreated: string;
  dateModified: string;
}

// ─── Location Visual Identity ──────────────────────────────────────────────

export interface LocationArchitecture {
  style: string; // e.g., "Byzantine", "Ottoman"
  materials: string;
  structures: string;
  colors: string;
  distinguishingFeatures: string;
  historicalAccuracy: HistoricalCertainty;
}

export interface LocationEnvironment {
  geography: string; // Surrounding landscape
  climate: string;
  timeOfDay: string; // Typical lighting
  atmosphere: string;
  soundscape: string; // Ambient sounds
}

export interface LocationVisualState {
  id: string;
  name: string; // e.g., "Pre-siege", "Damaged"
  description: string;
  period: string;
  condition: string; // State of the location
  architectureChanges: string; // What's different
  environmentalChanges: string;
  continuityNotes: string;
  referenceImageIds: string[];
  historicalReferences: HistoricalReference[];
  dateCreated: string;
  dateModified: string;
}

export interface LocationCanon {
  id: string;
  productionLocationId: string; // Links to Production domain
  
  // Identity
  canonicalName: string;
  historicalPeriod: string;
  historicalDescription: string;
  historicalReferences: HistoricalReference[];
  
  // Visual identity
  architecture: LocationArchitecture;
  environment: LocationEnvironment;
  
  // Visual states
  visualStates: LocationVisualState[];
  
  // Continuity
  continuityRules: string;
  
  // References
  referenceImageIds: string[];
  
  // Metadata
  dateCreated: string;
  dateModified: string;
}

// ─── Visual Canon (Global) ─────────────────────────────────────────────────

export interface CinematographyRules {
  visualStyle: string; // e.g., "observational cinematic"
  lensLanguage: string;
  framingPrinciples: string;
  cameraMovement: string;
  depthOfField: string;
  compositionRules: string;
}

export interface LightingRules {
  philosophy: string; // e.g., "naturalistic"
  contrast: string;
  naturalLightRules: string;
  artificialLightRules: string;
  interiorRules: string;
  exteriorRules: string;
  timeOfDayRules: string;
}

export interface ColorRules {
  palette: string; // e.g., "muted historical"
  saturation: string;
  contrast: string;
  historicalTreatment: string;
  reconstructionTreatment: string;
}

export interface TextureRules {
  filmGrain: string;
  realismLevel: string;
  environmentalTexture: string;
  archivalTreatment: string;
}

export interface MotionRules {
  documentaryRealism: string;
  cameraMovementPhilosophy: string;
  pacing: string;
}

export interface VisualCanon {
  id: string;
  projectId: string;
  
  // Cinematography
  cinematography: CinematographyRules;
  
  // Lighting
  lighting: LightingRules;
  
  // Color
  color: ColorRules;
  
  // Texture
  texture: TextureRules;
  
  // Motion
  motion: MotionRules;
  
  // Historical treatment
  historicalAccuracy: 'strict' | 'moderate' | 'liberal';
  modernObjectsPolicy: 'forbidden' | 'minimized' | 'contextual';
  
  // Notes
  generalNotes: string;
  
  dateCreated: string;
  dateModified: string;
}

// ─── Visual Bible Data ─────────────────────────────────────────────────────

export interface VisualBibleData {
  characterCanons: CharacterCanon[];
  locationCanons: LocationCanon[];
  visualCanon: VisualCanon | null;
  lastSaved: string;
}

// ─── Readiness Calculation ─────────────────────────────────────────────────

export interface ReadinessScore {
  overall: number; // 0-100
  identity: boolean;
  historicalRefs: boolean;
  appearance: boolean;
  clothing: boolean;
  visualStates: boolean;
  references: boolean;
  continuity: boolean;
}
