import { useState, useEffect } from 'react';
import { Shot, ProductionCharacter, ProductionLocation } from '../../../types/production';
import { X } from 'lucide-react';

interface ShotEditorProps {
  shot?: Shot; // undefined = creating new shot
  sceneId: string;
  characters: ProductionCharacter[];
  locations: ProductionLocation[];
  onSave: (shot: Omit<Shot, 'id' | 'dateCreated' | 'dateModified'>) => void;
  onCancel: () => void;
}

const SHOT_TYPES = [
  'establishing', 'wide', 'medium', 'close-up', 'extreme-close-up',
  'over-the-shoulder', 'tracking', 'aerial', 'pov',
] as const;

const CAMERA_MOVEMENTS = [
  'static', 'pan', 'tilt', 'dolly', 'tracking', 'crane', 'handheld',
] as const;

export default function ShotEditor({
  shot,
  sceneId,
  characters,
  locations,
  onSave,
  onCancel,
}: ShotEditorProps) {
  const [shotType, setShotType] = useState<Shot['shotType']>(shot?.shotType || 'wide');
  const [cameraAngle, setCameraAngle] = useState(shot?.cameraAngle || 'Eye level');
  const [cameraMovement, setCameraMovement] = useState<Shot['cameraMovement']>(shot?.cameraMovement || 'static');
  const [framing, setFraming] = useState(shot?.framing || 'Medium');
  const [subject, setSubject] = useState(shot?.subject || '');
  const [action, setAction] = useState(shot?.action || '');
  const [environment, setEnvironment] = useState(shot?.environment || '');
  const [lighting, setLighting] = useState(shot?.lighting || '');
  const [mood, setMood] = useState(shot?.mood || '');
  const [visualDescription, setVisualDescription] = useState(shot?.visualDescription || '');
  const [duration, setDuration] = useState(shot?.duration || 15);
  const [locationId, setLocationId] = useState(shot?.locationId || '');
  const [characterIds, setCharacterIds] = useState<string[]>(shot?.characterIds || []);
  const [status, setStatus] = useState<Shot['status']>(shot?.status || 'draft');

  // Reset form when shot prop changes
  useEffect(() => {
    if (shot) {
      setShotType(shot.shotType);
      setCameraAngle(shot.cameraAngle);
      setCameraMovement(shot.cameraMovement);
      setFraming(shot.framing);
      setSubject(shot.subject);
      setAction(shot.action);
      setEnvironment(shot.environment);
      setLighting(shot.lighting);
      setMood(shot.mood);
      setVisualDescription(shot.visualDescription);
      setDuration(shot.duration);
      setLocationId(shot.locationId);
      setCharacterIds(shot.characterIds);
      setStatus(shot.status);
    }
  }, [shot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    onSave({
      sceneId,
      order: shot?.order || 0,
      shotType,
      cameraAngle,
      cameraMovement,
      framing,
      subject,
      action,
      environment,
      lighting,
      mood,
      visualDescription,
      duration,
      locationId,
      characterIds,
      continuity: shot?.continuity || {
        timeOfDay: 'morning',
        weather: 'clear',
        characterAppearance: '',
        clothing: '',
        props: [],
        locationState: '',
        notes: '',
      },
      status,
    });
  };

  const toggleCharacter = (charId: string) => {
    setCharacterIds((prev) =>
      prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1b2e] border border-indigo-500/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-200">
          {shot ? 'Edit Shot' : 'New Shot'}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Close editor"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Row 1: Type, Movement, Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Shot Type</label>
          <select
            value={shotType}
            onChange={(e) => setShotType(e.target.value as Shot['shotType'])}
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {SHOT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Camera Movement</label>
          <select
            value={cameraMovement}
            onChange={(e) => setCameraMovement(e.target.value as Shot['cameraMovement'])}
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {CAMERA_MOVEMENTS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Duration (seconds)</label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Row 2: Subject, Camera Angle, Framing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-xs text-gray-400 mb-1">Subject *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What is the shot about?"
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Camera Angle</label>
          <input
            type="text"
            value={cameraAngle}
            onChange={(e) => setCameraAngle(e.target.value)}
            placeholder="Eye level, high angle..."
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Framing</label>
          <input
            type="text"
            value={framing}
            onChange={(e) => setFraming(e.target.value)}
            placeholder="Wide, medium, close-up..."
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Row 3: Visual Description */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Visual Description</label>
        <textarea
          value={visualDescription}
          onChange={(e) => setVisualDescription(e.target.value)}
          placeholder="Describe what the viewer will see..."
          rows={3}
          className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
        />
      </div>

      {/* Row 4: Action, Environment, Lighting, Mood */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Action</label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="What is happening?"
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Environment</label>
          <input
            type="text"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            placeholder="Setting details..."
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Lighting</label>
          <input
            type="text"
            value={lighting}
            onChange={(e) => setLighting(e.target.value)}
            placeholder="Lighting setup..."
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mood</label>
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="Emotional tone..."
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Row 5: Location, Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Location</label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
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
            value={status}
            onChange={(e) => setStatus(e.target.value as Shot['status'])}
            className="w-full px-2 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Characters */}
      {characters.length > 0 && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Characters</label>
          <div className="flex flex-wrap gap-1.5">
            {characters.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCharacter(c.id)}
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  characterIds.includes(c.id)
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-[#12132a] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#2a2b3d]">
        <button
          type="submit"
          disabled={!subject.trim()}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-medium rounded transition-colors"
        >
          {shot ? 'Save Changes' : 'Add Shot'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-xs rounded border border-[#2a2b3d] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
