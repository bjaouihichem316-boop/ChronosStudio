import { useState, useEffect, useCallback } from 'react';
import { ScriptData, Chapter, Scene, SceneStatus } from '../../../types/script';
import { ResearchData } from '../../../types/research';
import { PenTool, Eye, Sparkles, Clock, FileText, AlertTriangle } from 'lucide-react';
import ScriptOutline from './ScriptOutline';
import ScriptPreview from './ScriptPreview';
import SceneEditor from './SceneEditor';
import ChapterEditor from './ChapterEditor';

type ScriptView = 'outline' | 'preview';

interface ScriptWorkspaceProps {
  data: ScriptData;
  researchData: ResearchData | null;
  onUpdateData: (data: ScriptData) => void;
}

const STORAGE_KEY_PREFIX = 'chronos-script-';

export default function ScriptWorkspace({
  data,
  researchData,
  onUpdateData,
}: ScriptWorkspaceProps) {
  const [view, setView] = useState<ScriptView>('outline');
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isAddingScene, setIsAddingScene] = useState<string | null>(null); // chapterId
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SceneStatus | null>(null);
  const [lastSaved, setLastSaved] = useState(data.lastSaved);

  // Autosave to localStorage
  useEffect(() => {
    try {
      const key = STORAGE_KEY_PREFIX + 'autosave';
      localStorage.setItem(key, JSON.stringify({ data, timestamp: new Date().toISOString() }));
      setLastSaved(new Date().toISOString());
    } catch {
      // Storage quota exceeded — silently ignore
    }
  }, [data]);

  // Load autosave on mount
  useEffect(() => {
    try {
      const key = STORAGE_KEY_PREFIX + 'autosave';
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data && parsed.timestamp) {
          // Only restore if it's newer than our initial data
          if (new Date(parsed.timestamp) > new Date(data.lastSaved)) {
            onUpdateData(parsed.data);
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Computed stats
  const totalDuration = data.scenes.reduce((sum, s) => sum + s.estimatedDuration, 0);
  const scenesByStatus = {
    draft: data.scenes.filter((s) => s.status === 'draft').length,
    review: data.scenes.filter((s) => s.status === 'review').length,
    approved: data.scenes.filter((s) => s.status === 'approved').length,
  };

  // Unsupported claims warning count
  const unsupportedScenes = data.scenes.filter((scene) => {
    if (!researchData || scene.linkedClaimIds.length === 0) return false;
    return scene.linkedClaimIds.some((claimId) => {
      const claim = researchData.claims.find((c) => c.id === claimId);
      return claim && claim.sourceIds.length === 0;
    });
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Chapter operations
  const handleAddChapter = useCallback((chapter: Chapter) => {
    const newChapter = { ...chapter, order: data.chapters.length };
    onUpdateData({
      ...data,
      chapters: [...data.chapters, newChapter],
      lastSaved: new Date().toISOString(),
    });
    setIsAddingChapter(false);
  }, [data, onUpdateData]);

  const handleUpdateChapter = useCallback((updated: Chapter) => {
    onUpdateData({
      ...data,
      chapters: data.chapters.map((c) =>
        c.id === updated.id ? { ...updated, dateModified: new Date().toISOString() } : c
      ),
      lastSaved: new Date().toISOString(),
    });
    setEditingChapter(null);
  }, [data, onUpdateData]);

  const handleDeleteChapter = useCallback((chapterId: string) => {
    onUpdateData({
      ...data,
      chapters: data.chapters.filter((c) => c.id !== chapterId),
      scenes: data.scenes.filter((s) => s.chapterId !== chapterId),
      lastSaved: new Date().toISOString(),
    });
  }, [data, onUpdateData]);

  const handleReorderChapters = useCallback((activeId: string, overId: string) => {
    const oldIndex = data.chapters.findIndex((c) => c.id === activeId);
    const newIndex = data.chapters.findIndex((c) => c.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const newChapters = [...data.chapters];
    const [moved] = newChapters.splice(oldIndex, 1);
    newChapters.splice(newIndex, 0, moved);
    onUpdateData({
      ...data,
      chapters: newChapters.map((c, i) => ({ ...c, order: i })),
      lastSaved: new Date().toISOString(),
    });
  }, [data, onUpdateData]);

  // Scene operations
  const handleAddScene = useCallback((chapterId: string, scene: Omit<Scene, 'id' | 'chapterId' | 'order' | 'dateCreated' | 'dateModified'>) => {
    const chapterScenes = data.scenes.filter((s) => s.chapterId === chapterId);
    const newScene: Scene = {
      ...scene,
      id: `sc-${Date.now()}`,
      chapterId,
      order: chapterScenes.length,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    onUpdateData({
      ...data,
      scenes: [...data.scenes, newScene],
      lastSaved: new Date().toISOString(),
    });
    setIsAddingScene(null);
  }, [data, onUpdateData]);

  const handleUpdateScene = useCallback((updated: Scene) => {
    onUpdateData({
      ...data,
      scenes: data.scenes.map((s) =>
        s.id === updated.id ? { ...updated, dateModified: new Date().toISOString() } : s
      ),
      lastSaved: new Date().toISOString(),
    });
    setEditingScene(null);
  }, [data, onUpdateData]);

  const handleDeleteScene = useCallback((sceneId: string) => {
    onUpdateData({
      ...data,
      scenes: data.scenes.filter((s) => s.id !== sceneId),
      lastSaved: new Date().toISOString(),
    });
  }, [data, onUpdateData]);

  const handleReorderScenes = useCallback((chapterId: string, activeId: string, overId: string) => {
    const chapterScenes = data.scenes
      .filter((s) => s.chapterId === chapterId)
      .sort((a, b) => a.order - b.order);
    const oldIndex = chapterScenes.findIndex((s) => s.id === activeId);
    const newIndex = chapterScenes.findIndex((s) => s.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...chapterScenes];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    const otherScenes = data.scenes.filter((s) => s.chapterId !== chapterId);
    onUpdateData({
      ...data,
      scenes: [...otherScenes, ...reordered.map((s, i) => ({ ...s, order: i }))],
      lastSaved: new Date().toISOString(),
    });
  }, [data, onUpdateData]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <PenTool className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Script Studio</h2>
          <p className="text-sm text-gray-400">
            Documentary script with {data.chapters.length} acts and {data.scenes.length} scenes
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Sparkles className="w-4 h-4" />
          AI Assist
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="p-3 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] text-gray-500 uppercase">Duration</span>
          </div>
          <p className="text-lg font-bold text-gray-200">{formatDuration(totalDuration)}</p>
        </div>
        <div className="p-3 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
            <span className="text-[10px] text-gray-500 uppercase">Draft</span>
          </div>
          <p className="text-lg font-bold text-gray-200">{scenesByStatus.draft}</p>
        </div>
        <div className="p-3 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[10px] text-gray-500 uppercase">Review</span>
          </div>
          <p className="text-lg font-bold text-gray-200">{scenesByStatus.review}</p>
        </div>
        <div className="p-3 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] text-gray-500 uppercase">Approved</span>
          </div>
          <p className="text-lg font-bold text-gray-200">{scenesByStatus.approved}</p>
        </div>
        <div className="p-3 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] text-gray-500 uppercase">Saved</span>
          </div>
          <p className="text-xs font-medium text-gray-300">
            {new Date(lastSaved).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Unsupported Claims Warning */}
      {unsupportedScenes.length > 0 && (
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              {unsupportedScenes.length} scene{unsupportedScenes.length !== 1 ? 's' : ''} with unsupported claims
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              These scenes reference historical claims that have no supporting sources. Consider adding sources in the Research workspace.
            </p>
          </div>
        </div>
      )}

      {/* View Toggle + Search/Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1 border-b border-[#2a2b3d]">
          <button
            onClick={() => setView('outline')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              view === 'outline'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
            aria-label="Outline view"
          >
            <PenTool className="w-4 h-4" />
            Outline
          </button>
          <button
            onClick={() => setView('preview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              view === 'preview'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
            aria-label="Preview mode"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {view === 'outline' && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search script..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 w-48"
              aria-label="Search script"
            />
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value ? e.target.value as SceneStatus : null)}
              className="px-3 py-1.5 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
            </select>
            <button
              onClick={() => setIsAddingChapter(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              + Act
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {view === 'outline' ? (
        <ScriptOutline
          data={data}
          researchData={researchData}
          onAddChapter={() => setIsAddingChapter(true)}
          onEditChapter={setEditingChapter}
          onDeleteChapter={handleDeleteChapter}
          onReorderChapters={handleReorderChapters}
          onAddScene={(chapterId: string) => setIsAddingScene(chapterId)}
          onEditScene={setEditingScene}
          onDeleteScene={handleDeleteScene}
          onReorderScenes={handleReorderScenes}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
        />
      ) : (
        <ScriptPreview
          data={data}
          researchData={researchData}
          onEditScene={setEditingScene}
        />
      )}

      {/* Editors */}
      {editingScene && (
        <SceneEditor
          scene={editingScene}
          chapterId={editingScene.chapterId}
          researchData={researchData}
          onSave={(partial) => handleUpdateScene({ ...editingScene, ...partial })}
          onClose={() => setEditingScene(null)}
        />
      )}

      {isAddingScene && (
        <SceneEditor
          scene={null}
          chapterId={isAddingScene}
          researchData={researchData}
          onSave={(scene: Omit<Scene, 'id' | 'chapterId' | 'order' | 'dateCreated' | 'dateModified'>) => handleAddScene(isAddingScene, scene)}
          onClose={() => setIsAddingScene(null)}
        />
      )}

      {editingChapter && (
        <ChapterEditor
          chapter={editingChapter}
          onSave={handleUpdateChapter}
          onClose={() => setEditingChapter(null)}
        />
      )}

      {isAddingChapter && (
        <ChapterEditor
          chapter={null}
          onSave={handleAddChapter}
          onClose={() => setIsAddingChapter(false)}
        />
      )}
    </div>
  );
}
