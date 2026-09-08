// Production domain types
// Independent from Research and Script domains
// References other domains by ID only

export type CharacterStatus = 'active' | 'archived' | 'draft';
export type ProductionSceneStatus = 'planning' | 'in-progress' | 'complete';
export type ShotStatus = 'draft' | 'review' | 'approved';
export type AssetType = 'image' | 'video' | 'audio' | 'reference' | 'placeholder';
export type AssetStatus = 'pending' | 'generating' | 'complete' | 'failed';

export type ShotType =
  | 'establishing'
  | 'wide'
  | 'medium'
  | 'close-up'
  | 'extreme-close-up'
  | 'over-the-shoulder'
  | 'tracking'
  | 'aerial'
  | 'pov';

export type CameraMovement =
  | 'static'
  | 'pan'
  | 'tilt'
  | 'dolly'
  | 'tracking'
  | 'crane'
  | 'handheld';

export type TimeOfDay = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'night';
export type Weather = 'clear' | 'cloudy' | 'rain' | 'fog' | 'snow' | 'storm';

export interface ContinuityInfo {
  timeOfDay: TimeOfDay;
  weather: Weather;
  characterAppearance: string;
  clothing: string;
  props: string[];
  locationState: string;
  notes: string;
}

export interface ProductionCharacter {
  id: string;
  name: string;
  description: string;
  historicalRole: string;
  era: string;
  appearance: string;
  clothing: string;
  personality: string;
  voiceNotes: string;
  continuityNotes: string;
  referenceImages: string[]; // placeholders for now
  status: CharacterStatus;
  dateCreated: string;
  dateModified: string;
}

export interface ProductionLocation {
  id: string;
  name: string;
  description: string;
  historicalContext: string;
  era: string;
  visualDescription: string;
  architecture: string;
  atmosphere: string;
  continuityNotes: string;
  referenceImages: string[]; // placeholders for now
  dateCreated: string;
  dateModified: string;
}

export interface Shot {
  id: string;
  sceneId: string; // references ProductionScene
  order: number;
  shotType: ShotType;
  cameraAngle: string;
  cameraMovement: CameraMovement;
  framing: string;
  subject: string;
  action: string;
  environment: string;
  lighting: string;
  mood: string;
  visualDescription: string;
  duration: number; // seconds
  characterIds: string[]; // references ProductionCharacter
  locationId: string; // references ProductionLocation
  continuity: ContinuityInfo;
  status: ShotStatus;
  dateCreated: string;
  dateModified: string;
}

export interface ProductionScene {
  id: string;
  scriptSceneId: string; // references Script.Scene
  chapterId: string; // references Script.Chapter
  title: string;
  status: ProductionSceneStatus;
  characterIds: string[]; // references ProductionCharacter
  locationId: string; // references ProductionLocation
  shotIds: string[]; // references Shot
  assetIds: string[]; // references Asset
  continuity: ContinuityInfo;
  notes: string;
  dateCreated: string;
  dateModified: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  description: string;
  status: AssetStatus;
  sceneId?: string; // optional link to ProductionScene
  characterId?: string; // optional link to ProductionCharacter
  locationId?: string; // optional link to ProductionLocation
  referenceUrl?: string;
  notes: string;
  dateCreated: string;
  dateModified: string;
}

export interface ProductionData {
  characters: ProductionCharacter[];
  locations: ProductionLocation[];
  scenes: ProductionScene[];
  shots: Shot[];
  assets: Asset[];
  lastSaved: string;
}
