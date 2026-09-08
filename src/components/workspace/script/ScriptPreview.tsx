import { useMemo } from 'react';
import { ScriptData, Scene } from '../../../types/script';
import { ResearchData } from '../../../types/research';
import { Pencil, Clock, MapPin, Calendar, Link2, AlertTriangle } from 'lucide-react';

interface ScriptPreviewProps {
  data: ScriptData;
  researchData: ResearchData | null;
  onEditScene: (scene: Scene) => void;
}

export default function ScriptPreview({ data, researchData, onEditScene }: ScriptPreviewProps) {
  const sortedChapters = useMemo(() => {
    return [...data.chapters].sort((a, b) => a.order - b.order);
  }, [data.chapters]);

  const getScenesForChapter = (chapterId: string) => {
    return data.scenes
      .filter((s) => s.chapterId === chapterId)
      .sort((a, b) => a.order - b.order);
  };

  const totalDuration = data.scenes.reduce((sum, s) => sum + s.estimatedDuration, 0);
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatSceneDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (data.scenes.length === 0) {
    return (
      <div className="text-center py-16 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
        <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mx-auto mb-4">
          <Pencil className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No scenes to preview</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Add scenes to your script to see the continuous preview.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
        <p className="text-sm text-gray-400">
          {sortedChapters.length} acts · {data.scenes.length} scenes · {formatDuration(totalDuration)} total
        </p>
      </div>

      {/* Continuous Script */}
      <div className="space-y-8">
        {sortedChapters.map((chapter, chapterIndex) => {
          const scenes = getScenesForChapter(chapter.id);
          if (scenes.length === 0) return null;

          return (
            <div key={chapter.id} className="relative">
              {/* Act Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2a2b3d] to-transparent"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Act {chapterIndex + 1}</p>
                  <h3 className="text-lg font-bold text-white">{chapter.title}</h3>
                  {chapter.description && (
                    <p className="text-xs text-gray-400 mt-1 max-w-md">{chapter.description}</p>
                  )}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2a2b3d] to-transparent"></div>
              </div>

              {/* Scenes */}
              <div className="space-y-6">
                {scenes.map((scene, sceneIndex) => {
                  // Check for unsupported claims
                  const unsupportedClaims = researchData
                    ? scene.linkedClaimIds.filter((claimId) => {
                        const claim = researchData.claims.find((c) => c.id === claimId);
                        return claim && claim.sourceIds.length === 0;
                      }).length
                    : 0;

                  const linkedClaims = researchData
                    ? scene.linkedClaimIds
                        .map((id) => researchData.claims.find((c) => c.id === id))
                        .filter(Boolean)
                    : [];

                  return (
                    <div
                      key={scene.id}
                      className="relative bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-6 hover:border-[#3a3b5d] transition-colors group"
                    >
                      {/* Scene Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                            <span className="font-mono">
                              {chapterIndex + 1}.{sceneIndex + 1}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatSceneDuration(scene.estimatedDuration)}
                            </span>
                            {scene.location && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {scene.location}
                                </span>
                              </>
                            )}
                            {scene.timePeriod && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {scene.timePeriod}
                                </span>
                              </>
                            )}
                          </div>
                          <h4 className="text-base font-semibold text-white">{scene.title}</h4>
                        </div>
                        <button
                          onClick={() => onEditScene(scene)}
                          className="p-1.5 text-gray-500 hover:text-indigo-400 rounded-lg hover:bg-[#22234a] transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit scene"
                          aria-label={`Edit scene: ${scene.title}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Purpose */}
                      {scene.purpose && (
                        <div className="mb-4 p-3 bg-[#12132a] rounded-lg border-l-2 border-indigo-500/30">
                          <p className="text-xs text-gray-400 italic">{scene.purpose}</p>
                        </div>
                      )}

                      {/* Narration */}
                      {scene.narration && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {scene.narration}
                          </p>
                        </div>
                      )}

                      {/* Dialogue */}
                      {scene.dialogue && (
                        <div className="mb-4 pl-4 border-l-2 border-[#2a2b3d]">
                          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap font-mono">
                            {scene.dialogue}
                          </p>
                        </div>
                      )}

                      {/* Visual Direction */}
                      {scene.visualDirection && (
                        <div className="mb-4 p-3 bg-[#12132a] rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Visual Direction
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                            {scene.visualDirection}
                          </p>
                        </div>
                      )}

                      {/* Linked Claims */}
                      {linkedClaims.length > 0 && (
                        <div className="pt-4 border-t border-[#2a2b3d]">
                          <div className="flex items-center gap-2 mb-2">
                            <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-medium text-gray-400">
                              Linked Historical Claims
                            </span>
                            {unsupportedClaims > 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                                <AlertTriangle className="w-3 h-3" />
                                {unsupportedClaims} unsupported
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {linkedClaims.map((claim) => (
                              <div
                                key={claim!.id}
                                className="flex items-start gap-2 p-2 bg-[#12132a] rounded-lg"
                              >
                                <span className="text-xs text-gray-300 flex-1">
                                  {claim!.title}
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    claim!.status === 'verified'
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : claim!.status === 'disputed'
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-gray-500/20 text-gray-400'
                                  }`}
                                >
                                  {claim!.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="h-px bg-gradient-to-r from-transparent via-[#2a2b3d] to-transparent mb-6"></div>
        <p className="text-xs text-gray-600">End of Script</p>
      </div>
    </div>
  );
}
