import { useState } from 'react';
import { VisualCanon } from '../../../types/visual-bible';
import { Edit2, Save } from 'lucide-react';

interface VisualCanonEditorProps {
  visualCanon: VisualCanon | null;
  onUpdateCanon: (canon: VisualCanon) => void;
}

export default function VisualCanonEditor({
  visualCanon,
  onUpdateCanon,
}: VisualCanonEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<VisualCanon | null>(visualCanon);

  const handleStartEdit = () => {
    if (!visualCanon) {
      // Create new visual canon
      const newCanon: VisualCanon = {
        id: `canon-visual-${Date.now()}`,
        projectId: '',
        cinematography: {
          visualStyle: '',
          lensLanguage: '',
          framingPrinciples: '',
          cameraMovement: '',
          depthOfField: '',
          compositionRules: '',
        },
        lighting: {
          philosophy: '',
          contrast: '',
          naturalLightRules: '',
          artificialLightRules: '',
          interiorRules: '',
          exteriorRules: '',
          timeOfDayRules: '',
        },
        color: {
          palette: '',
          saturation: '',
          contrast: '',
          historicalTreatment: '',
          reconstructionTreatment: '',
        },
        texture: {
          filmGrain: '',
          realismLevel: '',
          environmentalTexture: '',
          archivalTreatment: '',
        },
        motion: {
          documentaryRealism: '',
          cameraMovementPhilosophy: '',
          pacing: '',
        },
        historicalAccuracy: 'moderate',
        modernObjectsPolicy: 'minimized',
        generalNotes: '',
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      };
      setEditData(newCanon);
    } else {
      setEditData({ ...visualCanon });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editData) {
      onUpdateCanon({
        ...editData,
        dateModified: new Date().toISOString(),
      });
      setIsEditing(false);
      setEditData(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const currentData = editData || visualCanon;

  if (!currentData && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mb-4">
          <Edit2 className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No Visual Canon</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          Create a visual canon to define the global visual language, cinematography rules, and historical treatment for this documentary.
        </p>
        <button
          onClick={handleStartEdit}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Create Visual Canon
        </button>
      </div>
    );
  }

  if (!currentData) {
    return null;
  }

  return (
    <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Visual Canon</h2>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {/* Cinematography */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Cinematography</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Visual Style</label>
            {isEditing ? (
              <input
                type="text"
                value={currentData.cinematography.visualStyle}
                onChange={(e) => setEditData({
                  ...currentData,
                  cinematography: {
                    visualStyle: e.target.value,
                    lensLanguage: currentData.cinematography.lensLanguage,
                    framingPrinciples: currentData.cinematography.framingPrinciples,
                    cameraMovement: currentData.cinematography.cameraMovement,
                    depthOfField: currentData.cinematography.depthOfField,
                    compositionRules: currentData.cinematography.compositionRules,
                  },
                })}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200"
              />
            ) : (
              <p className="text-sm text-gray-300">{currentData.cinematography.visualStyle || 'Not specified'}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Camera Movement</label>
            {isEditing ? (
              <input
                type="text"
                value={currentData.cinematography.cameraMovement}
                onChange={(e) => setEditData({
                  ...currentData,
                  cinematography: { ...currentData.cinematography, cameraMovement: e.target.value },
                })}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200"
              />
            ) : (
              <p className="text-sm text-gray-300">{currentData.cinematography.cameraMovement || 'Not specified'}</p>
            )}
          </div>
        </div>
      </section>

      {/* Lighting */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Lighting</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Philosophy</label>
            {isEditing ? (
              <input
                type="text"
                value={currentData.lighting.philosophy}
                onChange={(e) => setEditData({
                  ...currentData,
                  lighting: { ...currentData.lighting, philosophy: e.target.value },
                })}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200"
              />
            ) : (
              <p className="text-sm text-gray-300">{currentData.lighting.philosophy || 'Not specified'}</p>
            )}
          </div>
        </div>
      </section>

      {/* Color */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Color</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Palette</label>
            {isEditing ? (
              <input
                type="text"
                value={currentData.color.palette}
                onChange={(e) => setEditData({
                  ...currentData,
                  color: { ...currentData.color, palette: e.target.value },
                })}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200"
              />
            ) : (
              <p className="text-sm text-gray-300">{currentData.color.palette || 'Not specified'}</p>
            )}
          </div>
        </div>
      </section>

      {/* Historical Treatment */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Historical Treatment</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Accuracy Level</label>
            {isEditing ? (
              <select
                value={currentData.historicalAccuracy}
                onChange={(e) => setEditData({
                  ...currentData,
                  historicalAccuracy: e.target.value as 'strict' | 'moderate' | 'liberal',
                })}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200"
              >
                <option value="strict">Strict</option>
                <option value="moderate">Moderate</option>
                <option value="liberal">Liberal</option>
              </select>
            ) : (
              <p className="text-sm text-gray-300 capitalize">{currentData.historicalAccuracy}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Modern Objects</label>
            {isEditing ? (
              <select
                value={currentData.modernObjectsPolicy}
                onChange={(e) => setEditData({
                  ...currentData,
                  modernObjectsPolicy: e.target.value as 'forbidden' | 'minimized' | 'contextual',
                })}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200"
              >
                <option value="forbidden">Forbidden</option>
                <option value="minimized">Minimized</option>
                <option value="contextual">Contextual</option>
              </select>
            ) : (
              <p className="text-sm text-gray-300 capitalize">{currentData.modernObjectsPolicy}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
