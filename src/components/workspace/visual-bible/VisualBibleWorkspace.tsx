import { useState } from 'react';
import { VisualBibleData, CharacterCanon, LocationCanon } from '../../../types/visual-bible';
import { ProductionData } from '../../../types/production';
import { ResearchData } from '../../../types/research';
import { Users, MapPin, Palette, BookOpen } from 'lucide-react';
import CharacterBible from './CharacterBible';
import LocationBible from './LocationBible';
import VisualCanonEditor from './VisualCanonEditor';

type VisualBibleTab = 'characters' | 'locations' | 'canon';

interface VisualBibleWorkspaceProps {
  data: VisualBibleData;
  productionData: ProductionData;
  researchData: ResearchData;
  onUpdateData: (data: VisualBibleData) => void;
}

export default function VisualBibleWorkspace({
  data,
  productionData,
  researchData,
  onUpdateData,
}: VisualBibleWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<VisualBibleTab>('characters');

  const handleUpdateCharacterCanon = (updatedCanon: CharacterCanon) => {
    onUpdateData({
      ...data,
      characterCanons: data.characterCanons.map((c) =>
        c.id === updatedCanon.id ? updatedCanon : c
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleAddCharacterCanon = (canon: Omit<CharacterCanon, 'id' | 'dateCreated' | 'dateModified'>) => {
    const newCanon: CharacterCanon = {
      ...canon,
      id: `canon-char-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    onUpdateData({
      ...data,
      characterCanons: [...data.characterCanons, newCanon],
      lastSaved: new Date().toISOString(),
    });
  };

  const handleDeleteCharacterCanon = (canonId: string) => {
    onUpdateData({
      ...data,
      characterCanons: data.characterCanons.filter((c) => c.id !== canonId),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleUpdateLocationCanon = (updatedCanon: LocationCanon) => {
    onUpdateData({
      ...data,
      locationCanons: data.locationCanons.map((l) =>
        l.id === updatedCanon.id ? updatedCanon : l
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleAddLocationCanon = (canon: Omit<LocationCanon, 'id' | 'dateCreated' | 'dateModified'>) => {
    const newCanon: LocationCanon = {
      ...canon,
      id: `canon-loc-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    onUpdateData({
      ...data,
      locationCanons: [...data.locationCanons, newCanon],
      lastSaved: new Date().toISOString(),
    });
  };

  const handleDeleteLocationCanon = (canonId: string) => {
    onUpdateData({
      ...data,
      locationCanons: data.locationCanons.filter((l) => l.id !== canonId),
      lastSaved: new Date().toISOString(),
    });
  };

  const tabs = [
    { id: 'characters' as const, label: 'Characters', icon: Users, count: data.characterCanons.length },
    { id: 'locations' as const, label: 'Locations', icon: MapPin, count: data.locationCanons.length },
    { id: 'canon' as const, label: 'Visual Canon', icon: Palette, count: data.visualCanon ? 1 : 0 },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Visual Bible</h2>
          <p className="text-sm text-gray-400">Canonical visual identity and continuity</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#2a2b3d]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1a1b2e] text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b2e]/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs text-gray-500">({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'characters' && (
          <CharacterBible
            characterCanons={data.characterCanons}
            productionCharacters={productionData.characters}
            researchData={researchData}
            onUpdateCanon={handleUpdateCharacterCanon}
            onAddCanon={handleAddCharacterCanon}
            onDeleteCanon={handleDeleteCharacterCanon}
          />
        )}
        {activeTab === 'locations' && (
          <LocationBible
            locationCanons={data.locationCanons}
            productionLocations={productionData.locations}
            researchData={researchData}
            onUpdateCanon={handleUpdateLocationCanon}
            onAddCanon={handleAddLocationCanon}
            onDeleteCanon={handleDeleteLocationCanon}
          />
        )}
        {activeTab === 'canon' && (
          <VisualCanonEditor
            visualCanon={data.visualCanon}
            onUpdateCanon={(canon) => onUpdateData({ ...data, visualCanon: canon, lastSaved: new Date().toISOString() })}
          />
        )}
      </div>
    </div>
  );
}
