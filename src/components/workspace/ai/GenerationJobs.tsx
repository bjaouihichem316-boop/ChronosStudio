import { useState } from 'react';
import { GenerationJob, GenerationRequest, JobStatus } from '../../../types/ai';
import { Briefcase, Play, Pause, RotateCcw, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface GenerationJobsProps {
  jobs: GenerationJob[];
  requests: GenerationRequest[];
  onCreateJob: (job: GenerationJob) => void;
  onUpdateJob: (job: GenerationJob) => void;
  onDeleteJob: (jobId: string) => void;
}

export default function GenerationJobs({
  jobs,
  requests,
  onCreateJob,
  onUpdateJob,
  onDeleteJob,
}: GenerationJobsProps) {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredJobs = jobs.filter((j) => !statusFilter || j.status === statusFilter);

  const handleCreateJob = (requestId: string) => {
    const newJob: GenerationJob = {
      id: `job-${Date.now()}`,
      projectId: '', // Will be set by parent
      requestId,
      status: 'queued',
      progress: 0,
      providerId: null,
      modelId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
      retryCount: 0,
      resultAssetIds: [],
    };
    onCreateJob(newJob);
  };

  const handleTransitionJob = (job: GenerationJob, newStatus: JobStatus) => {
    const now = new Date().toISOString();
    onUpdateJob({
      ...job,
      status: newStatus,
      startedAt: newStatus === 'running' ? now : job.startedAt,
      completedAt: newStatus === 'completed' || newStatus === 'failed' || newStatus === 'cancelled' ? now : job.completedAt,
      progress: newStatus === 'completed' ? 100 : job.progress,
    });
  };

  const handleRetry = (job: GenerationJob) => {
    onUpdateJob({
      ...job,
      status: 'queued',
      progress: 0,
      error: null,
      retryCount: job.retryCount + 1,
      startedAt: null,
      completedAt: null,
    });
  };

  const handleDeleteClick = (jobId: string) => {
    if (deleteConfirmId === jobId) {
      onDeleteJob(jobId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(jobId);
    }
  };

  const statusColors: Record<JobStatus, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    queued: 'bg-blue-500/20 text-blue-400',
    running: 'bg-amber-500/20 text-amber-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
  };

  const statusIcons: Record<JobStatus, React.ComponentType<{ className?: string }>> = {
    draft: Clock,
    queued: Clock,
    running: Play,
    completed: CheckCircle,
    failed: XCircle,
    cancelled: Pause,
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="queued">Queued</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
          <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {statusFilter ? 'No jobs match your filter.' : 'No generation jobs yet.'}
          </p>
          {!statusFilter && requests.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Create a job from a ready request to begin.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const request = requests.find((r) => r.id === job.requestId);
            const StatusIcon = statusIcons[job.status];

            return (
              <div
                key={job.id}
                className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StatusIcon className={`w-4 h-4 ${
                        job.status === 'completed' ? 'text-emerald-400' :
                        job.status === 'failed' ? 'text-red-400' :
                        job.status === 'running' ? 'text-amber-400' :
                        'text-gray-400'
                      }`} />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[job.status]}`}>
                        {job.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {request?.type || 'Unknown'} generation
                      </span>
                      {job.retryCount > 0 && (
                        <span className="text-xs text-amber-400">
                          Retry #{job.retryCount}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-200 mb-1">
                      {request?.prompt.subject || 'No subject'}
                    </p>

                    {job.status === 'running' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#12132a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${job.progress}%` }}
                            role="progressbar"
                            aria-valuenow={job.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    )}

                    {job.error && (
                      <p className="text-xs text-red-400 mt-2">{job.error}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                      {job.startedAt && <span>Started: {new Date(job.startedAt).toLocaleTimeString()}</span>}
                      {job.completedAt && <span>Completed: {new Date(job.completedAt).toLocaleTimeString()}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {job.status === 'draft' && (
                      <button
                        onClick={() => handleTransitionJob(job, 'queued')}
                        className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                        aria-label="Queue job"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                    {job.status === 'queued' && (
                      <button
                        onClick={() => handleTransitionJob(job, 'running')}
                        className="p-1.5 text-gray-400 hover:text-amber-400 transition-colors"
                        aria-label="Start job"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {job.status === 'running' && (
                      <>
                        <button
                          onClick={() => handleTransitionJob(job, 'completed')}
                          className="p-1.5 text-gray-400 hover:text-emerald-400 transition-colors"
                          aria-label="Complete job"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTransitionJob(job, 'failed')}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          aria-label="Fail job"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {job.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(job)}
                        className="p-1.5 text-gray-400 hover:text-amber-400 transition-colors"
                        aria-label="Retry job"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
                      <button
                        onClick={() => handleDeleteClick(job.id)}
                        className={`p-1.5 transition-colors ${
                          deleteConfirmId === job.id
                            ? 'text-red-400'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                        aria-label={deleteConfirmId === job.id ? 'Confirm delete' : 'Delete job'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
