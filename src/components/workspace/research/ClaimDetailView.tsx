import { useState } from 'react';
import { HistoricalClaim, ResearchSource, ClaimStatus } from '../../../types/research';
import { ArrowLeft, Shield, AlertTriangle, HelpCircle, XCircle, ExternalLink, BookOpen, FileText, Layers } from 'lucide-react';

interface ClaimDetailViewProps {
  claim: HistoricalClaim;
  sources: ResearchSource[];
  onBack: () => void;
  onUpdateClaim: (claim: HistoricalClaim) => void;
}

const statusConfig: Record<ClaimStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  verified: { label: 'Verified', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Shield },
  disputed: { label: 'Disputed', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertTriangle },
  unverified: { label: 'Unverified', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: HelpCircle },
  debunked: { label: 'Debunked', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
};

const typeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  primary: { label: 'Primary', icon: BookOpen, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  secondary: { label: 'Secondary', icon: FileText, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  tertiary: { label: 'Tertiary', icon: Layers, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

const reliabilityConfig: Record<string, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low: { label: 'Low', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  unverified: { label: 'Unverified', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

export default function ClaimDetailView({
  claim,
  sources,
  onBack,
  onUpdateClaim,
}: ClaimDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(claim.title);
  const [editDescription, setEditDescription] = useState(claim.description);
  const [editStatus, setEditStatus] = useState<ClaimStatus>(claim.status);

  const config = statusConfig[claim.status];
  const StatusIcon = config.icon;

  const handleSave = () => {
    onUpdateClaim({
      ...claim,
      title: editTitle,
      description: editDescription,
      status: editStatus,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(claim.title);
    setEditDescription(claim.description);
    setEditStatus(claim.status);
    setIsEditing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 mb-4 transition-colors"
        aria-label="Back to claims list"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to claims
      </button>

      {/* Claim Detail */}
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-6 mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
            />
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Status</label>
              <div className="flex items-center gap-2 flex-wrap">
                {(Object.keys(statusConfig) as ClaimStatus[]).map((status) => {
                  const cfg = statusConfig[status];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => setEditStatus(status)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        editStatus === status
                          ? cfg.color
                          : 'bg-[#12132a] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-600">Added {formatDate(claim.dateAdded)}</span>
                </div>
                <h2 className="text-lg font-bold text-white">{claim.title}</h2>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-xs font-medium rounded-lg border border-[#2a2b3d] transition-colors"
              >
                Edit
              </button>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {claim.description}
            </p>
          </>
        )}
      </div>

      {/* Supporting Sources */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Supporting Sources
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-[#22234a] text-gray-400">
            {sources.length}
          </span>
        </h3>

        {sources.length === 0 ? (
          <div className="text-center py-8 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
            <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No sources associated with this claim.</p>
            <p className="text-xs text-gray-600 mt-1">Add sources and associate them with this claim.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source) => {
              const typeConf = typeConfig[source.type];
              const relConf = reliabilityConfig[source.reliability];
              const TypeIcon = typeConf.icon;

              return (
                <div
                  key={source.id}
                  className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4 hover:border-[#3a3b5d] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${typeConf.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeConf.label}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${relConf.color}`}>
                          {relConf.label}
                        </span>
                        {source.year && (
                          <span className="text-[10px] text-gray-600">{source.year}</span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-200">{source.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">by {source.author}</p>
                      {source.notes && (
                        <p className="text-xs text-gray-500 leading-relaxed mt-2">
                          {source.notes}
                        </p>
                      )}
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mt-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View source
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
