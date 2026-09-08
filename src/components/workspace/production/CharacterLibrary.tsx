import { useState } from 'react';
import { ProductionCharacter, CharacterStatus } from '../../../types/production';
import { Plus, Search, Pencil, Trash2, X, User, Image as ImageIcon } from 'lucide-react';

interface CharacterLibraryProps {
  characters: ProductionCharacter[];
  onAddCharacter: (character: Omit<ProductionCharacter, 'id' | 'dateCreated' | 'dateModified'>) => void;
  onUpdateCharacter: (character: ProductionCharacter) => void;
  onDeleteCharacter: (characterId: string) => void;
}

export default function CharacterLibrary({
  characters,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
}: CharacterLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CharacterStatus | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<ProductionCharacter | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHistoricalRole, setFormHistoricalRole] = useState('');
  const [formEra, setFormEra] = useState('');
  const [formAppearance, setFormAppearance] = useState('');
  const [formClothing, setFormClothing] = useState('');
  const [formPersonality, setFormPersonality] = useState('');
  const [formVoiceNotes, setFormVoiceNotes] = useState('');
  const [formContinuityNotes, setFormContinuityNotes] = useState('');
  const [formStatus, setFormStatus] = useState<CharacterStatus>('active');

  const filteredCharacters = characters.filter((char) => {
    const matchesSearch =
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.historicalRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || char.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const startAdding = () => {
    setFormName('');
    setFormDescription('');
    setFormHistoricalRole('');
    setFormEra('');
    setFormAppearance('');
    setFormClothing('');
    setFormPersonality('');
    setFormVoiceNotes('');
    setFormContinuityNotes('');
    setFormStatus('active');
    setIsAdding(true);
    setSelectedCharacter(null);
  };

  const startEditing = (character: ProductionCharacter) => {
    setFormName(character.name);
    setFormDescription(character.description);
    setFormHistoricalRole(character.historicalRole);
    setFormEra(character.era);
    setFormAppearance(character.appearance);
    setFormClothing(character.clothing);
    setFormPersonality(character.personality);
    setFormVoiceNotes(character.voiceNotes);
    setFormContinuityNotes(character.continuityNotes);
    setFormStatus(character.status);
    setSelectedCharacter(character);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setSelectedCharacter(null);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (selectedCharacter) {
      onUpdateCharacter({
        ...selectedCharacter,
        name: formName,
        description: formDescription,
        historicalRole: formHistoricalRole,
        era: formEra,
        appearance: formAppearance,
        clothing: formClothing,
        personality: formPersonality,
        voiceNotes: formVoiceNotes,
        continuityNotes: formContinuityNotes,
        status: formStatus,
      });
    } else {
      onAddCharacter({
        name: formName,
        description: formDescription,
        historicalRole: formHistoricalRole,
        era: formEra,
        appearance: formAppearance,
        clothing: formClothing,
        personality: formPersonality,
        voiceNotes: formVoiceNotes,
        continuityNotes: formContinuityNotes,
        referenceImages: [],
        status: formStatus,
      });
    }
    cancelForm();
  };

  const handleDelete = (characterId: string) => {
    if (deleteConfirm === characterId) {
      onDeleteCharacter(characterId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(characterId);
    }
  };

  const statusColors: Record<CharacterStatus, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const isFormOpen = isAdding || selectedCharacter !== null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>
        <button
          onClick={startAdding}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          aria-label="Add new character"
        >
          <Plus className="w-4 h-4" />
          Add Character
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
        {(['active', 'draft', 'archived'] as CharacterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? null : status)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              statusFilter === status
                ? statusColors[status]
                : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="bg-[#1a1b2e] border border-indigo-500/30 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">
            {selectedCharacter ? 'Edit Character' : 'New Character'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Character name..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              aria-label="Character name"
            />
            <input
              type="text"
              placeholder="Historical role..."
              value={formHistoricalRole}
              onChange={(e) => setFormHistoricalRole(e.target.value)}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              aria-label="Historical role"
            />
            <input
              type="text"
              placeholder="Era (e.g., 1432-1481)..."
              value={formEra}
              onChange={(e) => setFormEra(e.target.value)}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              aria-label="Era"
            />
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as CharacterStatus)}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              aria-label="Status"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <textarea
            placeholder="Description..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            className="w-full mt-3 px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
            aria-label="Description"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <textarea
              placeholder="Appearance..."
              value={formAppearance}
              onChange={(e) => setFormAppearance(e.target.value)}
              rows={2}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
              aria-label="Appearance"
            />
            <textarea
              placeholder="Clothing..."
              value={formClothing}
              onChange={(e) => setFormClothing(e.target.value)}
              rows={2}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
              aria-label="Clothing"
            />
            <textarea
              placeholder="Personality..."
              value={formPersonality}
              onChange={(e) => setFormPersonality(e.target.value)}
              rows={2}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
              aria-label="Personality"
            />
            <textarea
              placeholder="Voice notes..."
              value={formVoiceNotes}
              onChange={(e) => setFormVoiceNotes(e.target.value)}
              rows={2}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
              aria-label="Voice notes"
            />
          </div>
          <textarea
            placeholder="Continuity notes..."
            value={formContinuityNotes}
            onChange={(e) => setFormContinuityNotes(e.target.value)}
            rows={2}
            className="w-full mt-3 px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
            aria-label="Continuity notes"
          />
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={!formName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {selectedCharacter ? 'Save Changes' : 'Add Character'}
            </button>
            <button
              onClick={cancelForm}
              className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Character Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCharacters.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
            <User className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {searchQuery || statusFilter ? 'No characters match your filters.' : 'No characters yet.'}
            </p>
            {!searchQuery && !statusFilter && !isFormOpen && (
              <button onClick={startAdding} className="mt-3 text-sm text-indigo-400 hover:text-indigo-300">
                Add your first character →
              </button>
            )}
          </div>
        ) : (
          filteredCharacters.map((character) => (
            <div
              key={character.id}
              className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4 hover:border-[#3a3b5d] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-200 truncate">{character.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{character.historicalRole}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusColors[character.status]}`}>
                  {character.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{character.description}</p>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500">
                <span>{character.era}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {character.referenceImages.length} refs
                </span>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[#2a2b3d]">
                <button
                  onClick={() => startEditing(character)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-indigo-400 rounded-lg hover:bg-[#22234a] transition-colors"
                  aria-label={`Edit ${character.name}`}
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(character.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    deleteConfirm === character.id
                      ? 'text-red-400 bg-red-500/10'
                      : 'text-gray-400 hover:text-red-400 hover:bg-[#22234a]'
                  }`}
                  aria-label={deleteConfirm === character.id ? `Confirm delete ${character.name}` : `Delete ${character.name}`}
                >
                  <Trash2 className="w-3 h-3" />
                  {deleteConfirm === character.id ? 'Confirm' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
