import { AIData, GenerationRequest } from '../../../types/ai';
import { FileText, Briefcase, CheckCircle, AlertCircle, Clock, Plus } from 'lucide-react';

interface AIOverviewProps {
  data: AIData;
  onCreateRequest: () => void;
  onSelectRequest: (request: GenerationRequest) => void;
}

export default function AIOverview({
  data,
  onCreateRequest,
  onSelectRequest,
}: AIOverviewProps) {
  const totalRequests = data.requests.length;
  const totalJobs = data.jobs.length;
  const completedJobs = data.jobs.filter((j) => j.status === 'completed').length;
  const failedJobs = data.jobs.filter((j) => j.status === 'failed').length;
  const runningJobs = data.jobs.filter((j) => j.status === 'running').length;
  const queuedJobs = data.jobs.filter((j) => j.status === 'queued').length;

  const recentRequests = [...data.requests]
    .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Requests"
          value={totalRequests}
          color="indigo"
        />
        <StatCard
          icon={Briefcase}
          label="Total Jobs"
          value={totalJobs}
          color="purple"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={completedJobs}
          color="emerald"
        />
        <StatCard
          icon={AlertCircle}
          label="Failed"
          value={failedJobs}
          color="red"
        />
      </div>

      {/* Active Jobs */}
      {(runningJobs > 0 || queuedJobs > 0) && (
        <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Active Jobs
          </h3>
          <div className="space-y-2">
            {data.jobs
              .filter((j) => j.status === 'running' || j.status === 'queued')
              .slice(0, 3)
              .map((job) => {
                const request = data.requests.find((r) => r.id === job.requestId);
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 bg-[#12132a] rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-200">
                        {request?.type || 'Unknown'} generation
                      </p>
                      <p className="text-xs text-gray-500">
                        {job.status === 'running' ? 'Running...' : 'Queued'}
                      </p>
                    </div>
                    {job.status === 'running' && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-indigo-400">{job.progress}%</p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">Recent Requests</h3>
          <button
            onClick={onCreateRequest}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3 h-3" />
            New Request
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-2">No generation requests yet</p>
            <p className="text-xs text-gray-500 mb-4">
              Create a request from a production shot, scene, character, or location
            </p>
            <button
              onClick={onCreateRequest}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRequests.map((request) => (
              <button
                key={request.id}
                onClick={() => onSelectRequest(request)}
                className="w-full flex items-center justify-between p-3 bg-[#12132a] hover:bg-[#1a1b2e] rounded-lg transition-colors text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-indigo-400 uppercase">
                      {request.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {request.source.kind}: {request.source.id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 line-clamp-1">
                    {request.prompt.subject || 'No subject'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  request.status === 'ready'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : request.status === 'draft'
                    ? 'bg-gray-500/20 text-gray-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {request.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/20 text-indigo-300',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/20 text-purple-300',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-300',
    red: 'from-red-600/20 to-red-600/5 border-red-500/20 text-red-300',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <Icon className="w-4 h-4 mb-2 opacity-70" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}
