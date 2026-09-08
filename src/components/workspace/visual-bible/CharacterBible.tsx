import { useState } from 'react';
import { CharacterCanon } from '../../../types/visual-bible';
import { ProductionCharacter } from '../../../types/production';
import { ResearchData } from '../../../types/research';
import { Plus, Edit2, Trash2, Search, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';

interface CharacterBibleProps {
  characterCanons: CharacterCanon[];
  productionCharacters: ProductionCharacter[];
  researchData: ResearchData;
  onUpdateCanon: (canon: CharacterCanon) => void;
  onAddCanon: (canon: Omit<CharacterCanon, 'id' | 'dateCreated' | 'dateModified'>) => void;
  onDeleteCanon: (canonId: string) => void;
}

export default function CharacterBible({
  characterCanons,
  productionCharacters,
  researchData,
  onUpdateCanon,
  onAddCanon,
  onDeleteCanon,
}: CharacterBibleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCanon, setSelectedCanon] = useState<CharacterCanon | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredCanons = characterCanons.filter((canon) =>
    canon.canonicalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductionCharacter = (productionCharacterId: string) => {
    return productionCharacters.find((c) => c.id === productionCharacterId);
  };

  const calculateReadiness = (canon: CharacterCanon): number => {
    let score = 0;
    let total = 6;

    if (canon.canonicalName && canon.historicalRole) score++;
    if (canon.historicalReferences.length > 0) score++;
    if (canon.physicalDescription.ageRange) score++;
    if (canon.defaultClothing.description) score++;
    if (canon.visualStates.length > 0) score++;
    if (canon.continuityRules) score++;

    return Math.round((score / total) * 100);
  };

  const handleCreate = () => {
    const newCanon: Omit<CharacterCanon, 'id' | 'dateCreated' | 'dateModified'> = {
      productionCharacterId: '',
      canonicalName: '',
      aliases: [],
      historicalRole: '',
      era: '',
      historicalDescription: '',
      historicalReferences: [],
      uncertaintyNotes: '',
      physicalDescription: {
        ageRange: '',
        height: '',
        build: '',
        hair: '',
        facialFeatures: '',
        skinTone: '',
        distinguishingFeatures: '',
      },
      defaultClothing: {
        description: '',
        materials: '',
        colors: '',
        accessories: '',
        historicalAccuracy: 'unknown',
      },
      cinematicIdentity: {
        screenPresence: '',
        typicalExpressions: '',
        posture: '',
        movementStyle: '',
        emotionalRange: '',
        visualArchetype: '',
      },
      visualStates: [],
      continuityRules: '',
      referenceImageIds: [],
    };
    onAddCanon(newCanon);
    setIsCreating(false);
  };

  const handleDelete = (canonId: string) => {
    if (deleteConfirm === canonId) {
      onDeleteCanon(canonId);
      setDeleteConfirm(null);
      if (selectedCanon?.id === canonId) {
        setSelectedCanon(null);
      }
    } else {
      setDeleteConfirm(canonId);
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* List */}
      <div className="w-80 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            aria-label="Add character"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredCanons.map((canon) => {
            const prodChar = getProductionCharacter(canon.productionCharacterId);
            const readiness = calculateReadiness(canon);

            return (
              <div
                key={canon.id}
                onClick={() => setSelectedCanon(canon)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCanon?.id === canon.id
                    ? 'bg-indigo-600/20 border border-indigo-500/50'
                    : 'bg-[#1a1b2e] border border-[#2a2b3d] hover:border-[#3a3b5d]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-200 truncate">
                      {canon.canonicalName || 'Unnamed Character'}
                    </h3>
                    {prodChar && (
                      <p className="text-xs text-gray-500 truncate">
                        {prodChar.historicalRole}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(canon.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      deleteConfirm === canon.id
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                    }`}
                    aria-label={deleteConfirm === canon.id ? 'Confirm delete' : 'Delete'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#12132a] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        readiness >= 80 ? 'bg-emerald-500' : readiness >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${readiness}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{readiness}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto">
        {selectedCanon ? (
          <CharacterDetail
            canon={selectedCanon}
            productionCharacter={getProductionCharacter(selectedCanon.productionCharacterId)}
            researchData={researchData}
            onUpdate={onUpdateCanon}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a character to view details
          </div>
        )}
      </div>
    </div>
  );
}

function CharacterDetail({
  canon,
  productionCharacter,
  researchData,
  onUpdate,
}: {
  canon: CharacterCanon;
  productionCharacter: ProductionCharacter | undefined;
  researchData: ResearchData;
  onUpdate: (canon: CharacterCanon) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleFieldChange = (field: keyof CharacterCanon, value: any) => {
    onUpdate({
      ...canon,
      [field]: value,
      dateModified: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{canon.canonicalName || 'Unnamed Character'}</h2>
          {productionCharacter && (
            <p className="text-sm text-gray-400 mt-1">{productionCharacter.historicalRole}</p>
          )}
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Historical Identity */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Historical Identity
        </h3>
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Canonical name"
              value={canon.canonicalName}
              onChange={(e) => handleFieldChange('canonicalName', e.target.value)}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200"
            />
            <input
              type="text"
              placeholder="Historical role"
              value={canon.historicalRole}
              onChange={(e) => handleFieldChange('historicalRole', e.target.value)}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200"
            />
            <textarea
              placeholder="Historical description"
              value={canon.historicalDescription}
              onChange={(e) => handleFieldChange('historicalDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 resize-y"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-300">{canon.historicalDescription || 'No description'}</p>
            {canon.uncertaintyNotes && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                <p className="text-xs text-amber-300">{canon.uncertaintyNotes}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Visual Identity */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Visual Identity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Age Range</label>
            {isEditing ? (
              <input
                type="text"
                value={canon.physicalDescription.ageRange}
                onChange={(e) => handleFieldChange('physicalDescription', { ...canon.physicalDescription, ageRange: e.target.value })}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200"
              />
            ) : (
              <p className="text-sm text-gray-300">{canon.physicalDescription.ageRange || 'Not specified'}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Build</label>
            {isEditing ? (
              <input
                type="text"
                value={canon.physicalDescription.build}
                onChange={(e) => handleFieldChange('physicalDescription', { ...canon.physicalDescription, build: e.target.value })}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200"
              />
            ) : (
              <p className="text-sm text-gray-300">{canon.physicalDescription.build || 'Not specified'}</p>
            )}
          </div>
        </div>
      </section>

      {/* Visual States */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">
          Visual States ({canon.visualStates.length})
        </h3>
        {canon.visualStates.length === 0 ? (
          <p className="text-sm text-gray-500">No visual states defined</p>
        ) : (
          <div className="space-y-2">
            {canon.visualStates.map((state) => (
              <div key={state.id} className="p-3 bg-[#12132a] border border-[#2a2b3d] rounded-lg">
                <h4 className="text-sm font-medium text-gray-200">{state.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{state.period}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
