/**
 * Centralized persistence layer for Chronos Studio.
 * Uses project-scoped localStorage keys to prevent data leakage between projects.
 *
 * Key format: chronos:project:{projectId}:{domain}
 * Example: chronos:project:proj-001:research
 */

import { ResearchData } from '../types/research';
import { ScriptData } from '../types/script';
import { ProductionData } from '../types/production';
import { AIData } from '../types/ai';
import { VisualBibleData } from '../types/visual-bible';
import { PipelineData } from '../types/pipeline';
import { Project } from '../types';

// Storage key prefixes
const STORAGE_PREFIX = 'chronos:project';
const PROJECTS_KEY = 'chronos:projects';

// Domain keys
type Domain = 'research' | 'script' | 'production' | 'ai' | 'visual-bible' | 'pipeline';

/**
 * Build a project-scoped storage key
 */
function buildKey(projectId: string, domain: Domain): string {
  return `${STORAGE_PREFIX}:${projectId}:${domain}`;
}

/**
 * Safely read JSON from localStorage with error handling.
 * Returns null if data is missing or corrupt.
 */
function safeRead<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    // Corrupt data — remove it to prevent future errors
    console.warn(`[Persistence] Corrupt data at key "${key}", removing.`);
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore removal errors
    }
    return null;
  }
}

/**
 * Safely write JSON to localStorage with error handling.
 */
function safeWrite<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[Persistence] Failed to write key "${key}":`, e);
  }
}

// ─── Projects ────────────────────────────────────────────────────────────────

/**
 * Load persisted projects list.
 */
export function loadProjects(): Project[] | null {
  return safeRead<Project[]>(PROJECTS_KEY);
}

/**
 * Save projects list.
 */
export function saveProjects(projects: Project[]): void {
  safeWrite(PROJECTS_KEY, projects);
}

// ─── Research ────────────────────────────────────────────────────────────────

export function loadResearchData(projectId: string): ResearchData | null {
  return safeRead<ResearchData>(buildKey(projectId, 'research'));
}

export function saveResearchData(projectId: string, data: ResearchData): void {
  safeWrite(buildKey(projectId, 'research'), data);
}

// ─── Script ──────────────────────────────────────────────────────────────────

export function loadScriptData(projectId: string): ScriptData | null {
  return safeRead<ScriptData>(buildKey(projectId, 'script'));
}

export function saveScriptData(projectId: string, data: ScriptData): void {
  safeWrite(buildKey(projectId, 'script'), data);
}

// ─── Production ──────────────────────────────────────────────────────────────

export function loadProductionData(projectId: string): ProductionData | null {
  return safeRead<ProductionData>(buildKey(projectId, 'production'));
}

export function saveProductionData(projectId: string, data: ProductionData): void {
  safeWrite(buildKey(projectId, 'production'), data);
}

// ─── AI ──────────────────────────────────────────────────────────────────────

export function loadAIData(projectId: string): AIData | null {
  return safeRead<AIData>(buildKey(projectId, 'ai'));
}

export function saveAIData(projectId: string, data: AIData): void {
  safeWrite(buildKey(projectId, 'ai'), data);
}

// ─── Visual Bible ────────────────────────────────────────────────────────────

export function loadVisualBibleData(projectId: string): VisualBibleData | null {
  return safeRead<VisualBibleData>(buildKey(projectId, 'visual-bible'));
}

export function saveVisualBibleData(projectId: string, data: VisualBibleData): void {
  safeWrite(buildKey(projectId, 'visual-bible'), data);
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

export function loadPipelineData(projectId: string): PipelineData | null {
  return safeRead<PipelineData>(buildKey(projectId, 'pipeline'));
}

export function savePipelineData(projectId: string, data: PipelineData): void {
  safeWrite(buildKey(projectId, 'pipeline'), data);
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

/**
 * Remove all persisted data for a specific project.
 */
export function clearProjectData(projectId: string): void {
  try {
    localStorage.removeItem(buildKey(projectId, 'research'));
    localStorage.removeItem(buildKey(projectId, 'script'));
    localStorage.removeItem(buildKey(projectId, 'production'));
    localStorage.removeItem(buildKey(projectId, 'ai'));
    localStorage.removeItem(buildKey(projectId, 'visual-bible'));
    localStorage.removeItem(buildKey(projectId, 'pipeline'));
  } catch {
    // Ignore errors
  }
}

/**
 * Load all domain data for a project in one call.
 * Returns null for domains that have no persisted data.
 */
export function loadProjectData(projectId: string): {
  research: ResearchData | null;
  script: ScriptData | null;
  production: ProductionData | null;
  ai: AIData | null;
  visualBible: VisualBibleData | null;
  pipeline: PipelineData | null;
} {
  return {
    research: loadResearchData(projectId),
    script: loadScriptData(projectId),
    production: loadProductionData(projectId),
    ai: loadAIData(projectId),
    visualBible: loadVisualBibleData(projectId),
    pipeline: loadPipelineData(projectId),
  };
}
