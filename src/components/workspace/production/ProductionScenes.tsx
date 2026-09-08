import { useState } from 'react';
import { ProductionScene, Shot, ProductionCharacter, ProductionLocation, ProductionSceneStatus } from '../../../types/production';
import { ScriptData } from '../../../types/script';
import { Plus, Search, Pencil, Trash2, Film, ExternalLink, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';

interface ProductionScenesProps {
  scenes: ProductionScene[];
  shots: Shot[];
  characters: ProductionCharacter[];
  locations: ProductionLocation[];
  scriptData: ScriptData | null;
  onAddScene: (scene: Omit<ProductionScene, 'id' | 'dateCreated' | 'dateModified'>) => void;
  onUpdateScene: (scene: ProductionScene) => void;
  onDeleteScene: (sceneId: string) => void;
  onAddShot: (shot: Omit<Shot, 'id' | 'dateCreated' | 'dateModified'>) => void;
  onUpdateShot: (shot: Shot) => void;
  onDeleteShot: (shotId: string) => void;
  onReorderShots: (sceneId: string, shotIds: string[]) => void;
}

export default function ProductionScenes({
  scenes,
  shots,
  characters,
  locations,
  scriptData,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onAddShot,
  onUpdateShot,
  onDeleteShot,
  onReorderShots,
}: ProductionScenesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductionSceneStatus | null>(null);
  const [expandedScene, setExpandedScene] = useState<string | null>(null);
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [addingShotScene, setAddingShotScene] = useState<string | null>(null);
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Scene form state
  const [formTitle, setFormTitle] = useState('');
  const [formScriptSceneId, setFormScriptSceneId] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formCharacterIds, setFormCharacterIds] = useState<string[]>([]);
  const [formLocationId, setFormLocationId] = useState('');
  const [formStatus, setFormStatus] = useState<ProductionSceneStatus>('planning');
  const [formNotes, setFormNotes] = useState('');

  // Shot form state
  const [shotFormShotType, setShotFormShotType] = useState<Shot['shotType']>('wide');
  const [shotFormSubject, setShotFormSubject] = useState('');
  const [shotFormVisualDescription, setShotFormVisualDescription] = useState('');
  const [shotFormDuration, setShotFormDuration] = useState(15);
  const [shotFormLocationId, setShotFormLocationId] = useState('');
  const [shotFormCharacterIds, setShotFormCharacterIds] = useState<string[]>([]);
  const [shotFormStatus, setShotFormStatus] = useState<Shot['status']>('draft');

  const filteredScenes = scenes.filter((scene) => {
    const matchesSearch = scene.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || scene.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getScriptScene = (scriptSceneId: string) => {
    return scriptData?.scenes.find((s) => s.id === scriptSceneId);
  };

  const getScriptChapter = (chapterId: string) => {
    return scriptData?.chapters.find((c) => c.id === chapterId);
  };

  const startAddingScene = () => {
    setFormTitle('');
    setFormScriptSceneId('');
    setFormChapterId('');
    setFormCharacterIds([]);
    setFormLocationId('');
    setFormStatus('planning');
    setFormNotes('');
    setIsAddingScene(true);
  };

  const handleSaveScene = () => {
    if (!formTitle.trim()) return;
    onAddScene({
      scriptSceneId: formScriptSceneId,
      chapterId: formChapterId,
      title: formTitle,
      status: formStatus,
      characterIds: formCharacterIds,
      locationId: formLocationId,
      shotIds: [],
      assetIds: [],
      continuity: {
        timeOfDay: 'morning',
        weather: 'clear',
        characterAppearance: '',
        clothing: '',
        props: [],
        locationState: '',
        notes: '',
      },
      notes: formNotes,
    });
    setIsAddingScene(false);
  };

  const startAddingShot = (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    setShotFormShotType('wide');
    setShotFormSubject('');
    setShotFormVisualDescription('');
    setShotFormDuration(15);
    setShotFormLocationId(scene?.locationId || '');
    setShotFormCharacterIds(scene?.characterIds || []);
    setShotFormStatus('draft');
    setAddingShotScene(sceneId);
    setEditingShot(null);
  };

  const startEditingShot = (shot: Shot) => {
    setShotFormShotType(shot.shotType);
    setShotFormSubject(shot.subject);
    setShotFormVisualDescription(shot.visualDescription);
    setShotFormDuration(shot.duration);
    setShotFormLocationId(shot.locationId);
    setShotFormCharacterIds(shot.characterIds);
    setShotFormStatus(shot.status);
    setEditingShot(shot);
    setAddingShotScene(shot.sceneId);
  };

  const handleSaveShot = () => {
    if (!shotFormSubject.trim() || !addingShotScene) return;
    if (editingShot) {
      onUpdateShot({
        ...editingShot,
        shotType: shotFormShotType,
        subject: shotFormSubject,
        visualDescription: shotFormVisualDescription,
        duration: shotFormDuration,
        locationId: shotFormLocationId,
        characterIds: shotFormCharacterIds,
        status: shotFormStatus,
      });
    } else {
      const sceneShots = shots.filter((s) => s.sceneId === addingShotScene);
      onAddShot({
        sceneId: addingShotScene,
        order: sceneShots.length,
        shotType: shotFormShotType,
        cameraAngle: 'Eye level',
        cameraMovement: 'static',
        framing: 'Medium',
        subject: shotFormSubject,
        action: '',
        environment: '',
        lighting: '',
        mood: '',
        visualDescription: shotFormVisualDescription,
        duration: shotFormDuration,
        characterIds: shotFormCharacterIds,
        locationId: shotFormLocationId,
        continuity: {
          timeOfDay: 'morning',
          weather: 'clear',
          characterAppearance: '',
          clothing: '',
          props: [],
          locationState: '',
          notes: '',
        },
        status: shotFormStatus,
      });
    }
    setAddingShotScene(null);
    setEditingShot(null);
  };

  const handleDeleteShot = (shotId: string) => {
    if (deleteConfirm === shotId) {
      onDeleteShot(shotId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(shotId);
    }
  };

  const moveShot = (sceneId: string, shotId: string, direction: 'up' | 'down') => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    const sceneShots = shots
      .filter((s) => s.sceneId === sceneId)
      .sort((a, b) => a.order - b.order);
    const index = sceneShots.findIndex((s) => s.id === shotId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sceneShots.length - 1) return;
    const newOrder = [...sceneShots];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    onReorderShots(sceneId, newOrder.map((s) => s.id));
  };

  const statusColors: Record<ProductionSceneStatus, string> = {
    planning: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    'in-progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    complete: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const shotStatusColors: Record<Shot['status'], string> = {
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const isAddingShotOpen = addingShotScene !== null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search production scenes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>
        <button
          onClick={startAddingScene}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          aria-label="Add production scene"
        >
          <Plus className="w-4 h-4" />
          Add Scene
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-gray-500">Status:</span>
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
            !statusFilter ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
          }`}
        >
          All
        </button>
        {(['planning', 'in-progress', 'complete'] as ProductionSceneStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? null : status)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              statusFilter === status ? statusColors[status] : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
            }`}
          >
            {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Scene Form */}
      {isAddingScene && (
        <div className="bg-[#1a1b2e] border border-indigo-500/30 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">New Production Scene</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Scene title..."
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              aria-label="Scene title"
            />
            <select
              value={formScriptSceneId}
              onChange={(e) => setFormScriptSceneId(e.target.value)}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              aria-label="Link to script scene"
            >
              <option value="">Link to script scene (optional)...</option>
              {scriptData?.scenes.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <select
              value={formLocationId}
              onChange={(e) => setFormLocationId(e.target.value)}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              aria-label="Location"
            >
              <option value="">Select location...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as ProductionSceneStatus)}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              aria-label="Status"
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          <div className="mt-3">
            <label className="text-xs text-gray-400 mb-1.5 block">Characters</label>
            <div className="flex flex-wrap gap-1.5">
              {characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFormCharacterIds((prev) =>
                    prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                  )}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    formCharacterIds.includes(c.id)
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-[#12132a] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <textarea
            placeholder="Notes..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            rows={2}
            className="w-full mt-3 px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
            aria-label="Notes"
          />
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleSaveScene}
              disabled={!formTitle.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Scene
            </button>
            <button
              onClick={() => setIsAddingScene(false)}
              className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scenes List */}
      <div className="space-y-3">
        {filteredScenes.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
            <Film className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {searchQuery || statusFilter ? 'No scenes match your filters.' : 'No production scenes yet.'}
            </p>
          </div>
        ) : (
          filteredScenes.map((scene) => {
            const sceneShots = shots
              .filter((s) => s.sceneId === scene.id)
              .sort((a, b) => a.order - b.order);
            const scriptScene = getScriptScene(scene.scriptSceneId);
            const location = locations.find((l) => l.id === scene.locationId);
            const isExpanded = expandedScene === scene.id;

            return (
              <div key={scene.id} className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl overflow-hidden">
                {/* Scene Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusColors[scene.status]}`}>
                          {scene.status === 'in-progress' ? 'In Progress' : scene.status.charAt(0).toUpperCase() + scene.status.slice(1)}
                        </span>
                        {scriptScene && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <ExternalLink className="w-3 h-3" />
                            Script: {scriptScene.title}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-200">{scene.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                        {location && <span>📍 {location.name}</span>}
                        <span>🎬 {sceneShots.length} shots</span>
                        <span>⏱ {sceneShots.reduce((sum, s) => sum + s.duration, 0)}s</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setExpandedScene(isExpanded ? null : scene.id)}
                        className="p-1.5 text-gray-500 hover:text-indigo-400 rounded-lg hover:bg-[#22234a] transition-colors"
                        aria-label={isExpanded ? 'Collapse scene' : 'Expand scene'}
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDeleteScene(scene.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          deleteConfirm === scene.id ? 'text-red-400 bg-red-500/10' : 'text-gray-500 hover:text-red-400 hover:bg-[#22234a]'
                        }`}
                        aria-label={deleteConfirm === scene.id ? 'Confirm delete' : 'Delete scene'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Add Shot Button */}
                  <button
                    onClick={() => startAddingShot(scene.id)}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-lg transition-colors"
                    aria-label="Add shot to scene"
                  >
                    <Plus className="w-3 h-3" />
                    Add Shot
                  </button>
                </div>

                {/* Expanded: Shots */}
                {isExpanded && (
                  <div className="border-t border-[#2a2b3d] bg-[#12132a]/30 p-4">
                    {/* Add/Edit Shot Form */}
                    {isAddingShotOpen && addingShotScene === scene.id && (
                      <div className="bg-[#1a1b2e] border border-indigo-500/30 rounded-xl p-4 mb-3">
                        <h4 className="text-xs font-semibold text-white mb-3">
                          {editingShot ? 'Edit Shot' : 'New Shot'}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <select
                            value={shotFormShotType}
                            onChange={(e) => setShotFormShotType(e.target.value as Shot['shotType'])}
                            className="px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                            aria-label="Shot type"
                          >
                            {['establishing', 'wide', 'medium', 'close-up', 'extreme-close-up', 'over-the-shoulder', 'tracking', 'aerial', 'pov'].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Subject..."
                            value={shotFormSubject}
                            onChange={(e) => setShotFormSubject(e.target.value)}
                            className="px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            aria-label="Subject"
                          />
                          <input
                            type="number"
                            placeholder="Duration (s)"
                            value={shotFormDuration}
                            onChange={(e) => setShotFormDuration(parseInt(e.target.value) || 0)}
                            className="px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            aria-label="Duration"
                          />
                        </div>
                        <textarea
                          placeholder="Visual description..."
                          value={shotFormVisualDescription}
                          onChange={(e) => setShotFormVisualDescription(e.target.value)}
                          rows={2}
                          className="w-full mt-2 px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                          aria-label="Visual description"
                        />
                        <div className="flex items-center gap-2 mt-3">
                          <select
                            value={shotFormStatus}
                            onChange={(e) => setShotFormStatus(e.target.value as Shot['status'])}
                            className="px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                            aria-label="Shot status"
                          >
                            <option value="draft">Draft</option>
                            <option value="review">Review</option>
                            <option value="approved">Approved</option>
                          </select>
                          <button
                            onClick={handleSaveShot}
                            disabled={!shotFormSubject.trim()}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            {editingShot ? 'Save' : 'Add Shot'}
                          </button>
                          <button
                            onClick={() => { setAddingShotScene(null); setEditingShot(null); }}
                            className="px-3 py-1.5 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-xs rounded-lg border border-[#2a2b3d] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Shot List */}
                    {sceneShots.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">No shots yet. Add your first shot.</p>
                    ) : (
                      <div className="space-y-2">
                        {sceneShots.map((shot, index) => {
                          const shotLocation = locations.find((l) => l.id === shot.locationId);
                          return (
                            <div
                              key={shot.id}
                              className="flex items-start gap-3 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg p-3"
                            >
                              <div className="flex flex-col items-center gap-1 pt-1">
                                <GripVertical className="w-3 h-3 text-gray-600" />
                                <span className="text-[10px] text-gray-500 font-mono">#{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                                    {shot.shotType}
                                  </span>
                                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${shotStatusColors[shot.status]}`}>
                                    {shot.status}
                                  </span>
                                  <span className="text-[10px] text-gray-500">{shot.duration}s</span>
                                </div>
                                <p className="text-xs text-gray-300 font-medium">{shot.subject}</p>
                                {shot.visualDescription && (
                                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{shot.visualDescription}</p>
                                )}
                                {shotLocation && (
                                  <p className="text-[10px] text-gray-600 mt-1">📍 {shotLocation.name}</p>
                                )}
                              </div>
                              <div className="flex flex-col gap-1 shrink-0">
                                <button
                                  onClick={() => moveShot(scene.id, shot.id, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-30 rounded transition-colors text-[10px]"
                                  aria-label="Move shot up"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => moveShot(scene.id, shot.id, 'down')}
                                  disabled={index === sceneShots.length - 1}
                                  className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-30 rounded transition-colors text-[10px]"
                                  aria-label="Move shot down"
                                >
                                  ↓
                                </button>
                                <button
                                  onClick={() => startEditingShot(shot)}
                                  className="p-1 text-gray-500 hover:text-indigo-400 rounded transition-colors"
                                  aria-label="Edit shot"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteShot(shot.id)}
                                  className={`p-1 rounded transition-colors ${
                                    deleteConfirm === shot.id ? 'text-red-400 bg-red-500/10' : 'text-gray-500 hover:text-red-400'
                                  }`}
                                  aria-label={deleteConfirm === shot.id ? 'Confirm delete shot' : 'Delete shot'}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
