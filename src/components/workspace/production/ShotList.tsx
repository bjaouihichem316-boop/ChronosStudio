import { useState } from 'react';
import { Shot, ProductionCharacter, ProductionLocation } from '../../../types/production';
import { Plus, Pencil, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

interface ShotListProps {
  shots: Shot[];
  characters: ProductionCharacter[];
  locations: ProductionLocation[];
  onAddShot: () => void;
  onEditShot: (shot: Shot) => void;
  onDeleteShot: (shotId: string) => void;
  onReorderShot: (shotId: string, direction: 'up' | 'down') => void;
}

export default function ShotList({
  shots,
  characters,
  locations,
  onAddShot,
  onEditShot,
  onDeleteShot,
  onReorderShot,
}: ShotListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (shotId: string) => {
    if (deleteConfirmId === shotId) {
      onDeleteShot(shotId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(shotId);
    }
  };

  if (shots.length === 0) {
    return (
      <div className="px-4 py-3 text-center text-sm text-gray-500">
        No shots yet. Click "Add Shot" to create the first shot for this scene.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {shots.map((shot, index) => {
        const location = locations.find((l) => l.id === shot.locationId);
        const shotCharacters = characters.filter((c) => shot.characterIds.includes(c.id));

        return (
          <div
            key={shot.id}
            className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg p-3 hover:border-[#3a3b5d] transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Reorder controls */}
              <div className="flex flex-col gap-1 pt-1">
                <GripVertical className="w-4 h-4 text-gray-600" />
                <button
                  onClick={() => onReorderShot(shot.id, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Move shot up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onReorderShot(shot.id, 'down')}
                  disabled={index === shots.length - 1}
                  className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Move shot down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Shot content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-500">#{index + 1}</span>
                  <span className="text-xs font-medium text-gray-300">{shot.shotType}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{shot.duration}s</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    shot.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : shot.status === 'review'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {shot.status}
                  </span>
                </div>

                <p className="text-sm text-gray-200 mb-1">{shot.subject}</p>

                {shot.visualDescription && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{shot.visualDescription}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {location && (
                    <span>📍 {location.name}</span>
                  )}
                  {shotCharacters.length > 0 && (
                    <span>👥 {shotCharacters.length} character{shotCharacters.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditShot(shot)}
                  className="p-1.5 text-gray-400 hover:text-indigo-400 transition-colors"
                  aria-label="Edit shot"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(shot.id)}
                  className={`p-1.5 transition-colors ${
                    deleteConfirmId === shot.id
                      ? 'text-red-400'
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                  aria-label={deleteConfirmId === shot.id ? 'Confirm delete' : 'Delete shot'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={onAddShot}
        className="w-full py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-[#1a1b2e] border border-dashed border-[#2a2b3d] hover:border-indigo-500/50 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Shot
      </button>
    </div>
  );
}
