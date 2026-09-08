import { useState } from 'react';
import { ProductionScene, Shot, ProductionCharacter, ProductionLocation, ProductionSceneStatus } from '../../../types/production';
import { ScriptData } from '../../../types/script';
import { Plus, Search, Pencil, Trash2, Film, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import ShotList from './ShotList';
import ShotEditor from './ShotEditor';

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
  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [editingScene, setEditingScene] = useState<ProductionScene | null>(null);
  const [addingShotSceneId, setAddingShotSceneId] = useState<string | null>(null);
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Scene form state
  const [formTitle, setFormTitle] = useState('');
  const [formScriptSceneId, setFormScriptSceneId] = useState('');
  const [formCharacterIds, setFormCharacterIds] = useState<string[]>([]);
  const [formLocationId, setFormLocationId] = useState('');
  const [formStatus, setFormStatus] = useState<ProductionSceneStatus>('planning');
  const [formNotes, setFormNotes] = useState('');

  // Filter scenes
  const filteredScenes = scenes.filter((scene) => {
    const matchesSearch = scene.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || scene.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get script scene info
  const getScriptScene = (scriptSceneId: string) => {
    return scriptData?.scenes.find((s) => s.id === scriptSceneId);
  };

  // Scene CRUD handlers
  const handleStartAddScene = () => {
    setFormTitle('');
    setFormScriptSceneId('');
    setFormCharacterIds([]);
    setFormLocationId('');
    setFormStatus('planning');
    setFormNotes('');
    setIsAddingScene(true);
    setEditingScene(null);
  };

  const handleStartEditScene = (scene: ProductionScene) => {
    setFormTitle(scene.title);
    setFormScriptSceneId(scene.scriptSceneId);
    setFormCharacterIds(scene.characterIds);
    setFormLocationId(scene.locationId);
    setFormStatus(scene.status);
    setFormNotes(scene.notes);
    setEditingScene(scene);
    setIsAddingScene(false);
  };

  const handleCancelSceneForm = () => {
    setIsAddingScene(false);
    setEditingScene(null);
  };

  const handleSaveScene = () => {
    if (!formTitle.trim()) return;

    if (editingScene) {
      onUpdateScene({
        ...editingScene,
        title: formTitle,
        scriptSceneId: formScriptSceneId,
        characterIds: formCharacterIds,
        locationId: formLocationId,
        status: formStatus,
        notes: formNotes,
      });
    } else {
      onAddScene({
        scriptSceneId: formScriptSceneId,
        chapterId: '',
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
    }
    handleCancelSceneForm();
  };

  const handleDeleteScene = (sceneId: string) => {
    if (deleteConfirmId === sceneId) {
      onDeleteScene(sceneId);
      setDeleteConfirmId(null);
      if (expandedSceneId === sceneId) {
        setExpandedSceneId(null);
      }
    } else {
      setDeleteConfirmId(sceneId);
    }
  };

  // Shot handlers
  const handleStartAddShot = (sceneId: string) => {
    setAddingShotSceneId(sceneId);
    setEditingShot(null);
  };

  const handleStartEditShot = (shot: Shot) => {
    setEditingShot(shot);
    setAddingShotSceneId(shot.sceneId);
  };

  const handleCancelShotEditor = () => {
    setAddingShotSceneId(null);
    setEditingShot(null);
  };

  const handleSaveShot = (shotData: Omit<Shot, 'id' | 'dateCreated' | 'dateModified'>) => {
    if (editingShot) {
      onUpdateShot({
        ...editingShot,
        ...shotData,
      });
    } else {
      onAddShot(shotData);
    }
    handleCancelShotEditor();
  };

  const handleReorderShot = (sceneId: string, shotId: string, direction: 'up' | 'down') => {
    const sceneShots = shots
      .filter((s) => s.sceneId === sceneId)
      .sort((a, b) => a.order - b.order);
    const currentIndex = sceneShots.findIndex((s) => s.id === shotId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sceneShots.length) return;

    const newOrder = [...sceneShots];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    onReorderShots(sceneId, newOrder.map((s) => s.id));
  };

  const statusColors: Record<ProductionSceneStatus, string> = {
    planning: 'bg-gray-500/20 text-gray-400',
    'in-progress': 'bg-amber-500/20 text-amber-400',
    complete: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scenes..."
            className="w-full pl-10 pr-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter((e.target.value || null) as ProductionSceneStatus | null)}
          className="px-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">All Status</option>
          <option value="planning">Planning</option>
          <option value="in-progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>
        <button
          onClick={handleStartAddScene}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Scene
        </button>
      </div>

      {/* Add/Edit Scene Form */}
      {(isAddingScene || editingScene) && (
        <div className="bg-[#1a1b2e] border border-indigo-500/30 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-200">
            {editingScene ? 'Edit Scene' : 'New Scene'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Scene title"
                className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Link to Script Scene</label>
              <select
                value={formScriptSceneId}
                onChange={(e) => setFormScriptSceneId(e.target.value)}
                className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">No script scene</option>
                {scriptData?.scenes.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Location</label>
              <select
                value={formLocationId}
                onChange={(e) => setFormLocationId(e.target.value)}
                className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">No location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as ProductionSceneStatus)}
                className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Characters</label>
            <div className="flex flex-wrap gap-1.5">
              {characters.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFormCharacterIds((prev) =>
                    prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                  )}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
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

          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Production notes..."
              rows={2}
              className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveScene}
              disabled={!formTitle.trim()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded transition-colors"
            >
              {editingScene ? 'Save Changes' : 'Add Scene'}
            </button>
            <button
              onClick={handleCancelSceneForm}
              className="px-3 py-1.5 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm rounded border border-[#2a2b3d] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scene List */}
      {filteredScenes.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
          <Film className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {searchQuery || statusFilter ? 'No scenes match your filters.' : 'No production scenes yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScenes.map((scene) => {
            const sceneShots = shots
              .filter((s) => s.sceneId === scene.id)
              .sort((a, b) => a.order - b.order);
            const scriptScene = scene.scriptSceneId ? getScriptScene(scene.scriptSceneId) : null;
            const location = locations.find((l) => l.id === scene.locationId);
            const sceneCharacters = characters.filter((c) => scene.characterIds.includes(c.id));
            const isExpanded = expandedSceneId === scene.id;
            const isAddingShot = addingShotSceneId === scene.id;

            return (
              <div key={scene.id} className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl overflow-hidden">
                {/* Scene Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setExpandedSceneId(isExpanded ? null : scene.id)}
                      className="mt-1 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                      aria-label={isExpanded ? 'Collapse scene' : 'Expand scene'}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-200">{scene.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[scene.status]}`}>
                          {scene.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        {scriptScene && (
                          <span className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Script: {scriptScene.title}
                          </span>
                        )}
                        {location && <span>📍 {location.name}</span>}
                        {sceneCharacters.length > 0 && (
                          <span>👥 {sceneCharacters.length} character{sceneCharacters.length !== 1 ? 's' : ''}</span>
                        )}
                        <span>🎬 {sceneShots.length} shot{sceneShots.length !== 1 ? 's' : ''}</span>
                        <span>⏱ {sceneShots.reduce((sum, s) => sum + s.duration, 0)}s</span>
                      </div>

                      {scene.notes && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{scene.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditScene(scene)}
                        className="p-1.5 text-gray-400 hover:text-indigo-400 transition-colors"
                        aria-label="Edit scene"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className={`p-1.5 transition-colors ${
                          deleteConfirmId === scene.id
                            ? 'text-red-400'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                        aria-label={deleteConfirmId === scene.id ? 'Confirm delete' : 'Delete scene'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded: Shots */}
                {isExpanded && (
                  <div className="border-t border-[#2a2b3d] bg-[#12132a]/30 p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Shots ({sceneShots.length})
                    </h4>

                    {/* Shot Editor */}
                    {isAddingShot && (
                      <ShotEditor
                        shot={editingShot || undefined}
                        sceneId={scene.id}
                        characters={characters}
                        locations={locations}
                        onSave={handleSaveShot}
                        onCancel={handleCancelShotEditor}
                      />
                    )}

                    {/* Shot List */}
                    <ShotList
                      shots={sceneShots}
                      characters={characters}
                      locations={locations}
                      onAddShot={() => handleStartAddShot(scene.id)}
                      onEditShot={handleStartEditShot}
                      onDeleteShot={onDeleteShot}
                      onReorderShot={(shotId, direction) => handleReorderShot(scene.id, shotId, direction)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
