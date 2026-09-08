import { ProductionScene, Shot, ProductionCharacter, ProductionLocation } from '../../../types/production';
import { Clapperboard, Clock, MapPin, Users } from 'lucide-react';

/**
 * StoryboardView — Read-only visual representation of shots in sequence.
 * This component is intentionally read-only. Shot editing and reordering
 * are handled in the Production Scenes tab.
 */
interface StoryboardViewProps {
  scenes: ProductionScene[];
  shots: Shot[];
  characters: ProductionCharacter[];
  locations: ProductionLocation[];
}

export default function StoryboardView({
  scenes,
  shots,
  characters,
  locations,
}: StoryboardViewProps) {
  const sortedScenes = [...scenes].sort((a, b) => a.shotIds.length > 0 ? -1 : 1);

  return (
    <div className="space-y-8">
      {sortedScenes.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
          <Clapperboard className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No production scenes yet.</p>
          <p className="text-xs text-gray-500 mt-1">Create scenes and add shots to build your storyboard.</p>
        </div>
      ) : (
        sortedScenes.map((scene) => {
          const sceneShots = shots
            .filter((s) => s.sceneId === scene.id)
            .sort((a, b) => a.order - b.order);
          
          if (sceneShots.length === 0) return null;

          const location = locations.find((l) => l.id === scene.locationId);

          return (
            <div key={scene.id}>
              {/* Scene Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <Clapperboard className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-200">{scene.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    {location && <span>📍 {location.name}</span>}
                    <span>{sceneShots.length} shots</span>
                    <span>⏱ {sceneShots.reduce((sum, s) => sum + s.duration, 0)}s total</span>
                  </div>
                </div>
              </div>

              {/* Storyboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sceneShots.map((shot, index) => {
                  const shotLocation = locations.find((l) => l.id === shot.locationId);
                  const shotCharacters = characters.filter((c) => shot.characterIds.includes(c.id));

                  return (
                    <div
                      key={shot.id}
                      className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl overflow-hidden hover:border-[#3a3b5d] transition-colors"
                    >
                      {/* Thumbnail Placeholder */}
                      <div className="aspect-video bg-gradient-to-br from-[#22234a] to-[#1a1b2e] flex items-center justify-center relative">
                        <div className="text-center">
                          <Clapperboard className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                          <span className="text-[10px] text-gray-600">Shot {index + 1}</span>
                        </div>
                        {/* Shot Number Badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[10px] font-mono text-white">
                          #{index + 1}
                        </div>
                        {/* Duration Badge */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[10px] text-white flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {shot.duration}s
                        </div>
                        {/* Status Badge */}
                        <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium ${
                          shot.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          shot.status === 'review' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {shot.status}
                        </div>
                      </div>

                      {/* Shot Info */}
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                            {shot.shotType}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-gray-200 mb-1">{shot.subject}</h4>
                        {shot.visualDescription && (
                          <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">
                            {shot.visualDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                          {shotLocation && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {shotLocation.name}
                            </span>
                          )}
                          {shotCharacters.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {shotCharacters.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
