import { ClaimStatus } from './research';

export type SceneStatus = 'draft' | 'review' | 'approved';

export interface Scene {
  id: string;
  chapterId: string;
  title: string;
  location: string;
  timePeriod: string;
  purpose: string;
  narration: string;
  dialogue: string;
  visualDirection: string;
  estimatedDuration: number; // in seconds
  status: SceneStatus;
  linkedClaimIds: string[];
  order: number;
  dateCreated: string;
  dateModified: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  dateCreated: string;
  dateModified: string;
}

export interface ScriptData {
  title: string;
  chapters: Chapter[];
  scenes: Scene[];
  lastSaved: string;
}

// Derived type for displaying a scene with its linked claim data
// (read-only projection — never stored, computed on demand)
export interface SceneWithClaimData extends Scene {
  linkedClaims: Array<{
    id: string;
    title: string;
    status: ClaimStatus;
    sourceCount: number;
    hasSources: boolean;
  }>;
  unsupportedClaimCount: number;
}
