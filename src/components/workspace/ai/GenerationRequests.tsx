import { useState } from 'react';
import { GenerationRequest, GenerationJob } from '../../../types/ai';
import { Plus, Search, Trash2, Eye, FileText } from 'lucide-react';

interface GenerationRequestsProps {
  requests: GenerationRequest[];
  jobs: GenerationJob[];
  onCreateRequest: () => void;
  onSelectRequest: (request: GenerationRequest) => void;
  onDeleteRequest: (requestId: string) => void;
}

export default function GenerationRequests({
  requests,
  jobs,
  onCreateRequest,
  onSelectRequest,
  onDeleteRequest,
}: GenerationRequestsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.prompt.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.source.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || req.type === typeFilter;
    const matchesStatus = !statusFilter || req.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteClick = (requestId: string) => {
    if (deleteConfirmId === requestId) {
      onDeleteRequest(requestId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(requestId);
    }
  };

  const getRequestJobCount = (requestId: string) => {
    return jobs.filter((j) => j.requestId === requestId).length;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requests..."
            className="w-full pl-10 pr-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">All Types</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="voice">Voice</option>
          <option value="music">Music</option>
          <option value="thumbnail">Thumbnail</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="ready">Ready</option>
          <option value="submitted">Submitted</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={onCreateRequest}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Request List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
          <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {searchQuery || typeFilter || statusFilter
              ? 'No requests match your filters.'
              : 'No generation requests yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const jobCount = getRequestJobCount(request.id);

            return (
              <div
                key={request.id}
                className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4 hover:border-[#3a3b5d] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-medium text-indigo-400 uppercase">
                        {request.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {request.source.kind}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        request.status === 'ready'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : request.status === 'draft'
                          ? 'bg-gray-500/20 text-gray-400'
                          : request.status === 'submitted'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {request.status}
                      </span>
                      {jobCount > 0 && (
                        <span className="text-xs text-gray-500">
                          {jobCount} job{jobCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-200 mb-1 line-clamp-2">
                      {request.prompt.subject || 'No subject'}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Priority: {request.priority}</span>
                      <span>Quality: {request.parameters.quality}</span>
                      {request.parameters.presetId && (
                        <span>Preset: {request.parameters.presetId}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectRequest(request)}
                      className="p-1.5 text-gray-400 hover:text-indigo-400 transition-colors"
                      aria-label="View request details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(request.id)}
                      className={`p-1.5 transition-colors ${
                        deleteConfirmId === request.id
                          ? 'text-red-400'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                      aria-label={deleteConfirmId === request.id ? 'Confirm delete' : 'Delete request'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
