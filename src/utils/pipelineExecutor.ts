/**
 * Pipeline Executor — Chronos Studio Stage 9
 *
 * Manages task execution, dependency resolution, and state transitions.
 * Uses the provider registry to select and execute tasks.
 */

import { GenerationTask, GenerationOutput, PipelineStatus, IAIProvider, AIExecutionRequest } from '../types/pipeline';
import { GenerationRequest } from '../types/ai';
import { providerRegistry } from './providerRegistry';
import { mockProvider } from './mockProvider';

/**
 * Execute a single task using the provider registry.
 * Automatically selects the best available provider for the task.
 * Returns the generated output or throws an error.
 */
export async function executeTask(
  task: GenerationTask,
  request: GenerationRequest,
  provider?: IAIProvider
): Promise<GenerationOutput> {
  // Select provider: use provided, or select best from registry
  const selectedProvider = provider || await providerRegistry.selectBestProvider(task.mediaType);
  
  if (!selectedProvider) {
    throw new Error(`No available provider for media type: ${task.mediaType}`);
  }

  // Build execution request
  const executionRequest: AIExecutionRequest = {
    taskId: task.id,
    mediaType: task.mediaType,
    parameters: task.parameters,
    prompt: request.prompt.finalPrompt,
    context: request.context,
  };

  // Execute via provider
  const result = await selectedProvider.execute(executionRequest);

  if (!result.success || !result.output || !result.artifactId) {
    throw new Error(result.error || 'Task execution failed');
  }

  // Build output with provenance
  const output: GenerationOutput = {
    id: `output-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId: task.projectId,
    taskId: task.id,
    requestId: task.requestId,
    mediaType: task.mediaType,
    output: result.output,
    artifactId: result.artifactId,
    metadata: {
      providerId: selectedProvider.id,
      modelId: task.modelId || 'default',
      generationTime: result.generationTime,
      seed: task.parameters.seed,
      parameters: task.parameters,
    },
    provenance: {
      sourceType: task.sourceReference.kind,
      sourceId: task.sourceReference.id,
      contextSnapshot: hashContext(request.context),
      promptHash: hashString(request.prompt.finalPrompt),
    },
    createdAt: new Date().toISOString(),
    status: 'completed',
    error: null,
  };

  return output;
}

/**
 * Check if all dependencies for a task are completed.
 */
export function areDependenciesMet(
  task: GenerationTask,
  allTasks: GenerationTask[]
): boolean {
  if (task.dependencies.length === 0) {
    return true;
  }

  return task.dependencies.every((depId) => {
    const depTask = allTasks.find((t) => t.id === depId);
    return depTask && depTask.status === 'completed';
  });
}

/**
 * Check if any dependency has failed.
 */
export function hasFailedDependency(
  task: GenerationTask,
  allTasks: GenerationTask[]
): boolean {
  return task.dependencies.some((depId) => {
    const depTask = allTasks.find((t) => t.id === depId);
    return depTask && depTask.status === 'failed';
  });
}

/**
 * Detect circular dependencies in a set of tasks.
 * Returns true if a cycle is detected.
 */
export function detectCycle(tasks: GenerationTask[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(taskId: string): boolean {
    if (recursionStack.has(taskId)) {
      return true; // Cycle detected
    }
    if (visited.has(taskId)) {
      return false;
    }

    visited.add(taskId);
    recursionStack.add(taskId);

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      for (const depId of task.dependencies) {
        if (dfs(depId)) {
          return true;
        }
      }
    }

    recursionStack.delete(taskId);
    return false;
  }

  for (const task of tasks) {
    if (dfs(task.id)) {
      return true;
    }
  }

  return false;
}

/**
 * Get tasks that are ready to execute (dependencies met, not yet started).
 */
export function getReadyTasks(tasks: GenerationTask[]): GenerationTask[] {
  return tasks.filter((task) => {
    return (
      (task.status === 'pending' || task.status === 'ready') &&
      areDependenciesMet(task, tasks) &&
      !hasFailedDependency(task, tasks)
    );
  });
}

/**
 * Update task status based on dependency state.
 */
export function updateTaskDependencyStatus(
  task: GenerationTask,
  allTasks: GenerationTask[]
): GenerationTask {
  if (task.status !== 'pending' && task.status !== 'ready') {
    return task;
  }

  if (hasFailedDependency(task, allTasks)) {
    return {
      ...task,
      status: 'blocked',
      error: 'Dependency failed',
      updatedAt: new Date().toISOString(),
    };
  }

  if (areDependenciesMet(task, allTasks)) {
    return {
      ...task,
      status: 'ready',
      updatedAt: new Date().toISOString(),
    };
  }

  return task;
}

/**
 * Simple hash function for context snapshot.
 */
function hashContext(context: any): string {
  const str = JSON.stringify(context);
  return hashString(str);
}

/**
 * Simple string hash function.
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
