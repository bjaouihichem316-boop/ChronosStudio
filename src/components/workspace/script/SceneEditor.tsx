import { useState } from 'react';
import { Scene, SceneStatus } from '../../../types/script';
import { ResearchData } from '../../../types/research';
import { X, Check } from 'lucide-react';

interface SceneEditorProps {
  scene: Scene | null;
  chapterId: string;
  researchData: ResearchData | null;
  onSave: (scene: Omit<Scene, 'id' | 'chapterId' | 'order' | 'dateCreated' | 'dateModified'>) => void;
  onClose: () => void;
}

const statusOptions: { value: SceneStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  { value: 'review', label: 'Review', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'approved', label: 'Approved', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
];

export default function SceneEditor({
  scene,
  chapterId,
  researchData,
  onSave,
  onClose,
}: SceneEditorProps) {
  const [title, setTitle] = useState(scene?.title || '');
  const [location, setLocation] = useState(scene?.location || '');
  const [timePeriod, setTimePeriod] = useState(scene?.timePeriod || '');
  const [purpose, setPurpose] = useState(scene?.purpose || '');
  const [narration, setNarration] = useState(scene?.narration || '');
  const [dialogue, setDialogue] = useState(scene?.dialogue || '');
  const [visualDirection, setVisualDirection] = useState(scene?.visualDirection || '');
  const [estimatedDuration, setEstimatedDuration] = useState(scene?.estimatedDuration || 60);
  const [status, setStatus] = useState<SceneStatus>(scene?.status || 'draft');
  const [linkedClaimIds, setLinkedClaimIds] = useState<string[]>(scene?.linkedClaimIds || []);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      location,
      timePeriod,
      purpose,
      narration,
      dialogue,
      visualDirection,
      estimatedDuration,
      status,
      linkedClaimIds,
    });
  };

  const toggleClaim = (claimId: string) => {
    setLinkedClaimIds((prev) =>
      prev.includes(claimId) ? prev.filter((id) => id !== claimId) : [...prev, claimId]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-[#1a1b2e] border-b border-[#2a2b3d] p-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {scene ? 'Edit Scene' : 'New Scene'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#22234a] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Scene Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The Siege Begins"
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Constantinople Walls"
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Time Period
              </label>
              <input
                type="text"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                placeholder="e.g., April 1453"
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                min={10}
                max={600}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">{formatDuration(estimatedDuration)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Status
              </label>
              <div className="flex gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                      status === opt.value
                        ? opt.color
                        : 'bg-[#12132a] text-gray-500 border-[#2a2b3d] hover:border-gray-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Scene Purpose
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What is the narrative purpose of this scene?"
              rows={2}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none"
            />
          </div>

          {/* Narration */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Narration
            </label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Voice-over narration for this scene..."
              rows={4}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none"
            />
          </div>

          {/* Dialogue */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Dialogue
            </label>
            <textarea
              value={dialogue}
              onChange={(e) => setDialogue(e.target.value)}
              placeholder="Character dialogue (if any)..."
              rows={3}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none"
            />
          </div>

          {/* Visual Direction */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Visual Direction
            </label>
            <textarea
              value={visualDirection}
              onChange={(e) => setVisualDirection(e.target.value)}
              placeholder="Visual style, camera work, transitions, etc."
              rows={3}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none"
            />
          </div>

          {/* Linked Claims */}
          {researchData && researchData.claims.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Linked Historical Claims ({linkedClaimIds.length})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-[#2a2b3d] rounded-lg p-3">
                {researchData.claims.map((claim) => {
                  const isSelected = linkedClaimIds.includes(claim.id);
                  const hasSources = claim.sourceIds.length > 0;
                  return (
                    <label
                      key={claim.id}
                      className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-500/10 border border-indigo-500/30'
                          : 'bg-[#12132a] border border-transparent hover:border-[#2a2b3d]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleClaim(claim.id)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500/30"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 line-clamp-1">{claim.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            claim.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                            claim.status === 'disputed' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {claim.status}
                          </span>
                          {!hasSources && (
                            <span className="text-[10px] text-amber-400">⚠ No sources</span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#1a1b2e] border-t border-[#2a2b3d] p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            {scene ? 'Save Changes' : 'Create Scene'}
          </button>
        </div>
      </div>
    </div>
  );
}
