import { useState } from 'react';
import { ProductionData, ProductionCharacter, ProductionLocation, ProductionScene, Shot, Asset } from '../../../types/production';
import { ScriptData } from '../../../types/script';
import { Layout, Users, MapPin, Film, Image, Clapperboard, Sparkles } from 'lucide-react';
import ProductionOverview from './ProductionOverview';
import CharacterLibrary from './CharacterLibrary';
import LocationLibrary from './LocationLibrary';
import ProductionScenes from './ProductionScenes';
import StoryboardView from './StoryboardView';
import AssetLibrary from './AssetLibrary';

type ProductionTab = 'overview' | 'characters' | 'locations' | 'scenes' | 'storyboard' | 'assets';

interface ProductionWorkspaceProps {
  data: ProductionData;
  scriptData: ScriptData | null;
  onUpdateData: (data: ProductionData) => void;
}

export default function ProductionWorkspace({ data, scriptData, onUpdateData }: ProductionWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ProductionTab>('overview');

  // Character operations
  const handleAddCharacter = (character: Omit<ProductionCharacter, 'id' | 'dateCreated' | 'dateModified'>) => {
    const newCharacter: ProductionCharacter = {
      ...character,
      id: `char-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    onUpdateData({ ...data, characters: [...data.characters, newCharacter], lastSaved: new Date().toISOString() });
  };

  const handleUpdateCharacter = (updatedCharacter: ProductionCharacter) => {
    onUpdateData({
      ...data,
      characters: data.characters.map((c) =>
        c.id === updatedCharacter.id ? { ...updatedCharacter, dateModified: new Date().toISOString() } : c
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleDeleteCharacter = (characterId: string) => {
    onUpdateData({
      ...data,
      characters: data.characters.filter((c) => c.id !== characterId),
      // Remove character references from scenes and shots
      scenes: data.scenes.map((s) => ({
        ...s,
        characterIds: s.characterIds.filter((id) => id !== characterId),
      })),
      shots: data.shots.map((s) => ({
        ...s,
        characterIds: s.characterIds.filter((id) => id !== characterId),
      })),
      lastSaved: new Date().toISOString(),
    });
  };

  // Location operations
  const handleAddLocation = (location: Omit<ProductionLocation, 'id' | 'dateCreated' | 'dateModified'>) => {
    const newLocation: ProductionLocation = {
      ...location,
      id: `loc-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    onUpdateData({ ...data, locations: [...data.locations, newLocation], lastSaved: new Date().toISOString() });
  };

  const handleUpdateLocation = (updatedLocation: ProductionLocation) => {
    onUpdateData({
      ...data,
      locations: data.locations.map((l) =>
        l.id === updatedLocation.id ? { ...updatedLocation, dateModified: new Date().toISOString() } : l
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleDeleteLocation = (locationId: string) => {
    onUpdateData({
      ...data,
      locations: data.locations.filter((l) => l.id !== locationId),
      // Reset location references
      scenes: data.scenes.map((s) => (s.locationId === locationId ? { ...s, locationId: '' } : s)),
      shots: data.shots.map((s) => (s.locationId === locationId ? { ...s, locationId: '' } : s)),
      lastSaved: new Date().toISOString(),
    });
  };

  // Scene operations
  const handleAddScene = (scene: Omit<ProductionScene, 'id' | 'dateCreated' | 'dateModified'>) => {
    const newScene: ProductionScene = {
      ...scene,
      id: `ps-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    onUpdateData({ ...data, scenes: [...data.scenes, newScene], lastSaved: new Date().toISOString() });
  };

  const handleUpdateScene = (updatedScene: ProductionScene) => {
    onUpdateData({
      ...data,
      scenes: data.scenes.map((s) =>
        s.id === updatedScene.id ? { ...updatedScene, dateModified: new Date().toISOString() } : s
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleDeleteScene = (sceneId: string) => {
    const scene = data.scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    onUpdateData({
      ...data,
      scenes: data.scenes.filter((s) => s.id !== sceneId),
      shots: data.shots.filter((s) => s.sceneId !== sceneId),
      lastSaved: new Date().toISOString(),
    });
  };

  // Shot operations
  const handleAddShot = (shot: Omit<Shot, 'id' | 'dateCreated' | 'dateModified'>) => {
    const newShot: Shot = {
      ...shot,
      id: `shot-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    const scene = data.scenes.find((s) => s.id === shot.sceneId);
    onUpdateData({
      ...data,
      shots: [...data.shots, newShot],
      scenes: scene
        ? data.scenes.map((s) => (s.id === scene.id ? { ...s, shotIds: [...s.shotIds, newShot.id] } : s))
        : data.scenes,
      lastSaved: new Date().toISOString(),
    });
  };

  const handleUpdateShot = (updatedShot: Shot) => {
    onUpdateData({
      ...data,
      shots: data.shots.map((s) =>
        s.id === updatedShot.id ? { ...updatedShot, dateModified: new Date().toISOString() } : s
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleDeleteShot = (shotId: string) => {
    const shot = data.shots.find((s) => s.id === shotId);
    if (!shot) return;
    onUpdateData({
      ...data,
      shots: data.shots.filter((s) => s.id !== shotId),
      scenes: data.scenes.map((s) => ({
        ...s,
        shotIds: s.shotIds.filter((id) => id !== shotId),
      })),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleReorderShots = (sceneId: string, shotIds: string[]) => {
    onUpdateData({
      ...data,
      shots: data.shots.map((shot) => {
        const newIndex = shotIds.indexOf(shot.id);
        if (newIndex !== -1) {
          return { ...shot, order: newIndex };
        }
        return shot;
      }),
      scenes: data.scenes.map((s) => (s.id === sceneId ? { ...s, shotIds } : s)),
      lastSaved: new Date().toISOString(),
    });
  };

  // Asset operations
  const handleAddAsset = (asset: Omit<Asset, 'id' | 'dateCreated' | 'dateModified'>) => {
    const newAsset: Asset = {
      ...asset,
      id: `asset-${Date.now()}`,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    onUpdateData({ ...data, assets: [...data.assets, newAsset], lastSaved: new Date().toISOString() });
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
    onUpdateData({
      ...data,
      assets: data.assets.map((a) =>
        a.id === updatedAsset.id ? { ...updatedAsset, dateModified: new Date().toISOString() } : a
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleDeleteAsset = (assetId: string) => {
    onUpdateData({
      ...data,
      assets: data.assets.filter((a) => a.id !== assetId),
      scenes: data.scenes.map((s) => ({
        ...s,
        assetIds: s.assetIds.filter((id) => id !== assetId),
      })),
      lastSaved: new Date().toISOString(),
    });
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Layout },
    { id: 'characters' as const, label: 'Characters', icon: Users, count: data.characters.length },
    { id: 'locations' as const, label: 'Locations', icon: MapPin, count: data.locations.length },
    { id: 'scenes' as const, label: 'Scenes', icon: Film, count: data.scenes.length },
    { id: 'storyboard' as const, label: 'Storyboard', icon: Clapperboard, count: data.shots.length },
    { id: 'assets' as const, label: 'Assets', icon: Image, count: data.assets.length },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Clapperboard className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Production Studio</h2>
          <p className="text-sm text-gray-400">Production planning and visual pre-production</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Sparkles className="w-4 h-4" />
          AI Production
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#2a2b3d] mb-6 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Production sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-[#22234a] text-gray-400">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div role="tabpanel">
        {activeTab === 'overview' && <ProductionOverview data={data} />}
        {activeTab === 'characters' && (
          <CharacterLibrary
            characters={data.characters}
            onAddCharacter={handleAddCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onDeleteCharacter={handleDeleteCharacter}
          />
        )}
        {activeTab === 'locations' && (
          <LocationLibrary
            locations={data.locations}
            onAddLocation={handleAddLocation}
            onUpdateLocation={handleUpdateLocation}
            onDeleteLocation={handleDeleteLocation}
          />
        )}
        {activeTab === 'scenes' && (
          <ProductionScenes
            scenes={data.scenes}
            shots={data.shots}
            characters={data.characters}
            locations={data.locations}
            scriptData={scriptData}
            onAddScene={handleAddScene}
            onUpdateScene={handleUpdateScene}
            onDeleteScene={handleDeleteScene}
            onAddShot={handleAddShot}
            onUpdateShot={handleUpdateShot}
            onDeleteShot={handleDeleteShot}
            onReorderShots={handleReorderShots}
          />
        )}
        {activeTab === 'storyboard' && (
          <StoryboardView
            scenes={data.scenes}
            shots={data.shots}
            characters={data.characters}
            locations={data.locations}
            onUpdateShot={handleUpdateShot}
            onReorderShots={handleReorderShots}
          />
        )}
        {activeTab === 'assets' && (
          <AssetLibrary
            assets={data.assets}
            scenes={data.scenes}
            characters={data.characters}
            locations={data.locations}
            onAddAsset={handleAddAsset}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        )}
      </div>
    </div>
  );
}
