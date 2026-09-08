import { useState } from 'react';
import { PipelineData, GenerationTask, GenerationOutput, PipelineStatus } from '../../../types/pipeline';
import { AIData, GenerationRequest } from '../../../types/ai';
import { ProductionData } from '../../../types/production';
import { VisualBibleData } from '../../../types/visual-bible';
import { ResearchData } from '../../../types/research';
import { ScriptData } from '../../../types/script';
import { MediaData } from '../../../types/media';
import { executeTask, areDependenciesMet, hasFailedDependency, getReadyTasks, updateTaskDependencyStatus } from '../../../utils/pipelineExecutor';
import { providerRegistry } from '../../../utils/providerRegistry';
import { processCompletedTask } from '../../../utils/assetManager';
import ProviderStatus from './ProviderStatus';
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface PipelineWorkspaceProps {
  pipelineData: PipelineData;
  aiData: AIData;
  productionData: ProductionData;
  visualBibleData: VisualBibleData;
  researchData: ResearchData;
  scriptData: ScriptData;
  mediaData: MediaData;
  onUpdateData: (data: PipelineData) => void;
  onUpdateMediaData: (data: MediaData) => void;
}

export default function PipelineWorkspace({
  pipelineData,
  aiData,
  productionData,
  visualBibleData,
  researchData,
  scriptData,
  mediaData,
  onUpdateData,
  onUpdateMediaData,
}: PipelineWorkspaceProps) {
  const [selectedTask, setSelectedTask] = useState<GenerationTask | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<GenerationOutput | null>(null);

  const tasks = pipelineData.tasks;
  const outputs = pipelineData.outputs;

  // Get task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const runningTasks = tasks.filter((t) => t.status === 'running').length;
  const failedTasks = tasks.filter((t) => t.status === 'failed').length;
  const readyTasks = tasks.filter((t) => t.status === 'ready').length;

  // Handle task execution
  const handleExecuteTask = async (task: GenerationTask) => {
    const request = aiData.requests.find((r) => r.id === task.requestId);
    if (!request) return;

    // Update task to running
    const updatedTask: GenerationTask = {
      ...task,
      status: 'running',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateData({
      ...pipelineData,
      tasks: pipelineData.tasks.map((t) => (t.id === task.id ? updatedTask : t)),
    });

    try {
      // Execute task (provider registry will select best available provider)
      const output = await executeTask(updatedTask, request);

      // Update task to completed
      const completedTask: GenerationTask = {
        ...updatedTask,
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        outputIds: [output.id],
      };

      // Process completed task to create media artifact and asset
      const { mediaData: updatedMediaData } = await processCompletedTask(
        task.projectId,
        output,
        mediaData,
        `Generated ${output.mediaType} - ${new Date().toLocaleString()}`
      );

      onUpdateData({
        ...pipelineData,
        tasks: pipelineData.tasks.map((t) => (t.id === task.id ? completedTask : t)),
        outputs: [...pipelineData.outputs, output],
      });

      onUpdateMediaData(updatedMediaData);
    } catch (error) {
      // Update task to failed
      const failedTask: GenerationTask = {
        ...updatedTask,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date().toISOString(),
      };

      onUpdateData({
        ...pipelineData,
        tasks: pipelineData.tasks.map((t) => (t.id === task.id ? failedTask : t)),
      });
    }
  };

  // Handle task retry
  const handleRetryTask = (task: GenerationTask) => {
    const retriedTask: GenerationTask = {
      ...task,
      status: 'pending',
      error: null,
      retryCount: task.retryCount + 1,
      updatedAt: new Date().toISOString(),
    };

    onUpdateData({
      ...pipelineData,
      tasks: pipelineData.tasks.map((t) => (t.id === task.id ? retriedTask : t)),
    });
  };

  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    onUpdateData({
      ...pipelineData,
      tasks: pipelineData.tasks.filter((t) => t.id !== taskId),
      outputs: pipelineData.outputs.filter((o) => o.taskId !== taskId),
    });

    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  // Get status icon
  const getStatusIcon = (status: PipelineStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running':
        return <Play className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'ready':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#2a2b3d]">
        <div>
          <h2 className="text-2xl font-bold text-white">Generation Pipeline</h2>
          <p className="text-sm text-gray-400 mt-1">Manage and execute AI generation tasks</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{completedTasks}/{totalTasks}</div>
            <div className="text-xs text-gray-400">Tasks Completed</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 p-6 border-b border-[#2a2b3d]">
        <div className="bg-[#1a1b2e] rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{totalTasks}</div>
          <div className="text-xs text-gray-400">Total Tasks</div>
        </div>
        <div className="bg-[#1a1b2e] rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-400">{readyTasks}</div>
          <div className="text-xs text-gray-400">Ready</div>
        </div>
        <div className="bg-[#1a1b2e] rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{runningTasks}</div>
          <div className="text-xs text-gray-400">Running</div>
        </div>
        <div className="bg-[#1a1b2e] rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-400">{completedTasks}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="bg-[#1a1b2e] rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{failedTasks}</div>
          <div className="text-xs text-gray-400">Failed</div>
        </div>
      </div>

      {/* Provider Status */}
      <div className="p-6 border-b border-[#2a2b3d]">
        <ProviderStatus />
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Clock className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Tasks Yet</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Create generation requests in the AI workspace to start building your pipeline.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const request = aiData.requests.find((r) => r.id === task.requestId);
                const taskOutputs = outputs.filter((o) => o.taskId === task.id);

                return (
                  <div
                    key={task.id}
                    className={`bg-[#1a1b2e] rounded-lg p-4 border-2 transition-colors cursor-pointer ${
                      selectedTask?.id === task.id
                        ? 'border-indigo-500'
                        : 'border-[#2a2b3d] hover:border-[#3a3b5d]'
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            {request?.prompt.subject || 'Untitled Task'}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {task.mediaType} • {task.sourceReference.kind}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status === 'ready' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteTask(task);
                            }}
                            className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                            title="Execute task"
                          >
                            <Play className="w-4 h-4 text-white" />
                          </button>
                        )}
                        {task.status === 'failed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetryTask(task);
                            }}
                            className="p-1.5 bg-amber-600 hover:bg-amber-500 rounded transition-colors"
                            title="Retry task"
                          >
                            <RotateCcw className="w-4 h-4 text-white" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="p-1.5 bg-red-600 hover:bg-red-500 rounded transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {task.status === 'running' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-[#12132a] rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {task.error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-2 mb-3">
                        <p className="text-xs text-red-400">{task.error}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Priority: {task.priority}</span>
                      <span>Retries: {task.retryCount}/{task.maxRetries}</span>
                      {taskOutputs.length > 0 && (
                        <span>Outputs: {taskOutputs.length}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <div className="w-96 border-l border-[#2a2b3d] overflow-y-auto bg-[#0f1021]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Task Details</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTask.status)}
                    <span className="text-sm text-white capitalize">{selectedTask.status}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Media Type</div>
                  <div className="text-sm text-white capitalize">{selectedTask.mediaType}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Source</div>
                  <div className="text-sm text-white">
                    {selectedTask.sourceReference.kind}: {selectedTask.sourceReference.id}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Priority</div>
                  <div className="text-sm text-white capitalize">{selectedTask.priority}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Dependencies</div>
                  <div className="text-sm text-white">
                    {selectedTask.dependencies.length === 0
                      ? 'None'
                      : `${selectedTask.dependencies.length} task(s)`}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Retries</div>
                  <div className="text-sm text-white">
                    {selectedTask.retryCount} / {selectedTask.maxRetries}
                  </div>
                </div>

                {selectedTask.startedAt && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Started</div>
                    <div className="text-sm text-white">
                      {new Date(selectedTask.startedAt).toLocaleString()}
                    </div>
                  </div>
                )}

                {selectedTask.completedAt && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Completed</div>
                    <div className="text-sm text-white">
                      {new Date(selectedTask.completedAt).toLocaleString()}
                    </div>
                  </div>
                )}

                {selectedTask.error && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Error</div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                      <p className="text-xs text-red-400">{selectedTask.error}</p>
                    </div>
                  </div>
                )}

                {/* Outputs */}
                {outputs.filter((o) => o.taskId === selectedTask.id).length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Outputs</div>
                    <div className="space-y-2">
                      {outputs
                        .filter((o) => o.taskId === selectedTask.id)
                        .map((output) => (
                          <div
                            key={output.id}
                            className="bg-[#1a1b2e] rounded p-3 cursor-pointer hover:bg-[#22234a] transition-colors"
                            onClick={() => setSelectedOutput(output)}
                          >
                            <div className="text-xs text-white font-medium">{output.mediaType}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {output.output.type === 'image' && `${output.output.resolution}`}
                              {output.output.type === 'video' && `${output.output.duration}s`}
                              {output.output.type === 'audio' && `${output.output.duration}s`}
                              {output.output.type === 'voice' && `${output.output.duration}s`}
                              {output.output.type === 'music' && `${output.output.duration}s`}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
