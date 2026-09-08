import { ResearchData } from '../../../types/research';
import { BookOpen, Flag, FileText } from 'lucide-react';

interface ResearchProgressIndicatorProps {
  data: ResearchData;
}

export default function ResearchProgressIndicator({ data }: ResearchProgressIndicatorProps) {
  const totalItems = data.notes.length + data.claims.length + data.sources.length;
  const verifiedClaims = data.claims.filter((c) => c.status === 'verified').length;
  const primarySources = data.sources.filter((s) => s.type === 'primary').length;
  const highReliabilitySources = data.sources.filter((s) => s.reliability === 'high').length;

  // Calculate progress score (0-100)
  const progressScore = Math.min(100, Math.round(
    (data.notes.length * 5) +
    (verifiedClaims * 10) +
    (data.claims.length * 3) +
    (primarySources * 8) +
    (highReliabilitySources * 5)
  ));

  return (
    <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">Research Progress</h3>
        <span className="text-xs text-indigo-400 font-medium">{progressScore}%</span>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full h-2 bg-[#12132a] rounded-full overflow-hidden mb-4"
        role="progressbar"
        aria-valuenow={progressScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Research progress: ${progressScore}%`}
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progressScore}%` }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span className="text-lg font-bold text-gray-200">{data.notes.length}</span>
          </div>
          <p className="text-[10px] text-gray-500">Notes</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flag className="w-3 h-3 text-amber-400" />
            <span className="text-lg font-bold text-gray-200">{data.claims.length}</span>
          </div>
          <p className="text-[10px] text-gray-500">Claims</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FileText className="w-3 h-3 text-emerald-400" />
            <span className="text-lg font-bold text-gray-200">{data.sources.length}</span>
          </div>
          <p className="text-[10px] text-gray-500">Sources</p>
        </div>
      </div>

      {/* Additional Info */}
      {totalItems > 0 && (
        <div className="mt-3 pt-3 border-t border-[#2a2b3d]">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>{verifiedClaims} verified claims</span>
            <span>{primarySources} primary sources</span>
          </div>
        </div>
      )}
    </div>
  );
}
