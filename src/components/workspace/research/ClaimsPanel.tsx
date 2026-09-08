import { useState } from 'react';
import { HistoricalClaim, ResearchSource, ClaimStatus } from '../../../types/research';
import { Plus, Search, Trash2, ChevronRight, Shield, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';

interface ClaimsPanelProps {
  claims: HistoricalClaim[];
  sources: ResearchSource[];
  onSelectClaim: (claim: HistoricalClaim) => void;
  onAddClaim: (claim: Omit<HistoricalClaim, 'id' | 'dateAdded' | 'dateModified'>) => void;
  onDeleteClaim: (claimId: string) => void;
  isAdding: boolean;
  setIsAdding: (val: boolean) => void;
}

const statusConfig: Record<ClaimStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  verified: { label: 'Verified', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Shield },
  disputed: { label: 'Disputed', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertTriangle },
  unverified: { label: 'Unverified', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: HelpCircle },
  debunked: { label: 'Debunked', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
};

export default function ClaimsPanel({
  claims,
  sources,
  onSelectClaim,
  onAddClaim,
  onDeleteClaim,
  isAdding,
  setIsAdding,
}: ClaimsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<ClaimStatus>('unverified');
  const [formSourceIds, setFormSourceIds] = useState<string[]>([]);

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const startAdding = () => {
    setFormTitle('');
    setFormDescription('');
    setFormStatus('unverified');
    setFormSourceIds([]);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formTitle.trim() || !formDescription.trim()) return;
    onAddClaim({
      title: formTitle,
      description: formDescription,
      status: formStatus,
      sourceIds: formSourceIds,
    });
    setIsAdding(false);
  };

  const toggleSource = (sourceId: string) => {
    setFormSourceIds((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]
    );
  };

  const handleDelete = (claimId: string) => {
    if (deleteConfirm === claimId) {
      onDeleteClaim(claimId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(claimId);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>
        <button
          onClick={startAdding}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Claim
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-gray-500">Status:</span>
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
            !statusFilter
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
              : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
          }`}
        >
          All
        </button>
        {(Object.keys(statusConfig) as ClaimStatus[]).map((status) => {
          const config = statusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? null : status)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                statusFilter === status
                  ? config.color
                  : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
              }`}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Add Claim Form */}
      {isAdding && (
        <div className="bg-[#1a1b2e] border border-indigo-500/30 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">New Historical Claim</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Claim title..."
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            />
            <textarea
              placeholder="Describe the claim..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
            />
            {/* Status */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Status</label>
              <div className="flex items-center gap-2 flex-wrap">
                {(Object.keys(statusConfig) as ClaimStatus[]).map((status) => {
                  const config = statusConfig[status];
                  const Icon = config.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => setFormStatus(status)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        formStatus === status
                          ? config.color
                          : 'bg-[#12132a] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Associate Sources */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Supporting Sources</label>
              {sources.length === 0 ? (
                <p className="text-xs text-gray-600">No sources available. Add sources first.</p>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {sources.map((source) => (
                    <label
                      key={source.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        formSourceIds.includes(source.id)
                          ? 'bg-indigo-600/10 border border-indigo-500/30'
                          : 'bg-[#12132a] border border-[#2a2b3d] hover:border-[#3a3b5d]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formSourceIds.includes(source.id)}
                        onChange={() => toggleSource(source.id)}
                        className="w-3.5 h-3.5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500/30"
                      />
                      <span className="text-xs text-gray-300 truncate">{source.title}</span>
                      <span className="text-[10px] text-gray-600 ml-auto shrink-0">{source.author}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={!formTitle.trim() || !formDescription.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add Claim
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claims List */}
      <div className="space-y-3">
        {filteredClaims.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
            <AlertTriangle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {searchQuery || statusFilter ? 'No claims match your filters.' : 'No historical claims yet.'}
            </p>
          </div>
        ) : (
          filteredClaims.map((claim) => {
            const config = statusConfig[claim.status];
            const StatusIcon = config.icon;
            const supportingSources = sources.filter((s) => claim.sourceIds.includes(s.id));

            return (
              <div
                key={claim.id}
                className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4 hover:border-[#3a3b5d] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      <span className="text-[10px] text-gray-600">{formatDate(claim.dateAdded)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-200">{claim.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1.5 line-clamp-2">
                      {claim.description}
                    </p>
                    {supportingSources.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-gray-500">
                          {supportingSources.length} source{supportingSources.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          {supportingSources.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="w-5 h-5 rounded bg-[#22234a] flex items-center justify-center text-[9px] text-gray-500"
                              title={s.title}
                            >
                              {s.author.charAt(0)}
                            </span>
                          ))}
                          {supportingSources.length > 3 && (
                            <span className="text-[10px] text-gray-600">+{supportingSources.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDelete(claim.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        deleteConfirm === claim.id
                          ? 'text-red-400 bg-red-500/10'
                          : 'text-gray-500 hover:text-red-400 hover:bg-[#22234a]'
                      }`}
                      title={deleteConfirm === claim.id ? 'Click again to confirm' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectClaim(claim)}
                      className="p-1.5 text-gray-500 hover:text-indigo-400 rounded-lg hover:bg-[#22234a] transition-colors"
                      title="View details"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
