import { useState, useMemo } from 'react';
import {
  GenerationRequest,
  GenerationSource,
  GenerationType,
  Priority,
  PromptSpec,
  GenerationParameters,
  GenerationContext,
} from '../../../types/ai';
import { ResearchData } from '../../../types/research';
import { ScriptData } from '../../../types/script';
import { ProductionData } from '../../../types/production';
import { VisualBibleData } from '../../../types/visual-bible';
import { Project } from '../../../types';
import { buildGenerationContext, buildPromptSpec } from '../../../utils/ai-context';
import { validateGenerationRequest } from '../../../utils/ai-validation';
import { builtInPresets } from '../../../data/aiPresets';
import { X, Sparkles, AlertTriangle, CheckCircle, Film, Users, MapPin, Clapperboard } from 'lucide-react';

interface RequestCreatorProps {
  project: Project;
  researchData: ResearchData;
  scriptData: ScriptData;
  productionData: ProductionData;
  visualBibleData?: VisualBibleData;
  onCreateRequest: (request: GenerationRequest) => void;
  onCancel: () => void;
}

export default function RequestCreator({
  project,
  researchData,
  scriptData,
  productionData,
  visualBibleData,
  onCreateRequest,
  onCancel,
}: RequestCreatorProps) {
  const [sourceKind, setSourceKind] = useState<GenerationSource['kind']>('shot');
  const [sourceId, setSourceId] = useState('');
  const [generationType, setGenerationType] = useState<GenerationType>('image');
  const [priority, setPriority] = useState<Priority>('normal');
  const [presetId, setPresetId] = useState('');
  const [quality, setQuality] = useState<GenerationParameters['quality']>('standard');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(15);
  const [notes, setNotes] = useState('');

  // Build context from source
  const source: GenerationSource = useMemo(() => ({ kind: sourceKind, id: sourceId }), [sourceKind, sourceId]);

  const context: GenerationContext | null = useMemo(() => {
    if (!sourceId) return null;
    try {
      return buildGenerationContext({
        project,
        source,
        researchData,
        scriptData,
        productionData,
        visualBibleData,
      });
    } catch {
      return null;
    }
  }, [project, source, researchData, scriptData, productionData, visualBibleData, sourceId]);

  // Build prompt from context
  const prompt: PromptSpec | null = useMemo(() => {
    if (!context) return null;
    return buildPromptSpec(context);
  }, [context]);

  // Validate
  const validation = useMemo(() => {
    if (!prompt || !context) return null;
    return validateGenerationRequest({
      request: {
        projectId: project.id,
        type: generationType,
        source,
        context,
        prompt,
        parameters: {
          quality,
          aspectRatio,
          duration,
          presetId: presetId || undefined,
          extra: {},
        },
        priority,
        status: 'draft',
        notes,
      },
      researchData,
      scriptData,
      productionData,
    });
  }, [prompt, context, project.id, generationType, source, quality, aspectRatio, duration, presetId, priority, notes, researchData, scriptData, productionData]);

  const getSourceOptions = () => {
    switch (sourceKind) {
      case 'shot':
        return productionData.shots.map((s) => ({ id: s.id, label: `#${s.order + 1} ${s.subject}` }));
      case 'scene':
        return productionData.scenes.map((s) => ({ id: s.id, label: s.title }));
      case 'character':
        return productionData.characters.map((c) => ({ id: c.id, label: c.name }));
      case 'location':
        return productionData.locations.map((l) => ({ id: l.id, label: l.name }));
      case 'script-scene':
        return scriptData.scenes.map((s) => ({ id: s.id, label: s.title }));
    }
  };

  const handleCreate = () => {
    if (!prompt || !context || !validation?.valid) return;

    const request: GenerationRequest = {
      id: `req-${Date.now()}`,
      projectId: project.id,
      type: generationType,
      source,
      context,
      prompt,
      parameters: {
        quality,
        aspectRatio,
        duration,
        presetId: presetId || undefined,
        extra: {},
      },
      priority,
      status: 'draft',
      jobIds: [],
      notes,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };

    onCreateRequest(request);
  };

  const canCreate = validation?.valid && prompt && context;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2b3d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Generation Request</h2>
              <p className="text-xs text-gray-400">Define what you want to generate</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-[#22234a] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Source Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Source Type</label>
              <select
                value={sourceKind}
                onChange={(e) => {
                  setSourceKind(e.target.value as GenerationSource['kind']);
                  setSourceId('');
                }}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="shot">Shot</option>
                <option value="scene">Production Scene</option>
                <option value="character">Character</option>
                <option value="location">Location</option>
                <option value="script-scene">Script Scene</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Source Entity</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select {sourceKind}...</option>
                {getSourceOptions().map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generation Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Generation Type</label>
              <select
                value={generationType}
                onChange={(e) => setGenerationType(e.target.value as GenerationType)}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="voice">Voice</option>
                <option value="music">Music</option>
                <option value="thumbnail">Thumbnail</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as GenerationParameters['quality'])}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="standard">Standard</option>
                <option value="high">High</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="16:9">16:9</option>
                <option value="21:9">21:9</option>
                <option value="4:3">4:3</option>
                <option value="3:4">3:4</option>
                <option value="1:1">1:1</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Duration (for video/voice) */}
          {(generationType === 'video' || generationType === 'voice') && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Duration (seconds)</label>
              <input
                type="number"
                min={1}
                max={300}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                className="w-32 px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          {/* Preset */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Preset (optional)</label>
            <select
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">No preset</option>
              {builtInPresets
                .filter((p) => p.type === generationType || p.type === 'image')
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.description}</option>
                ))}
            </select>
          </div>

          {/* Context Preview */}
          {context && (
            <div className="bg-[#12132a] border border-[#2a2b3d] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Resolved Context
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <ContextBadge
                  icon={Film}
                  label="Production"
                  value={context.production.shot ? 'Shot' : context.production.scene ? 'Scene' : 'None'}
                />
                <ContextBadge
                  icon={Film}
                  label="Script"
                  value={context.script.scene ? context.script.scene.title.slice(0, 20) : 'None'}
                />
                <ContextBadge
                  icon={Users}
                  label="Characters"
                  value={String(context.characters.length)}
                />
                <ContextBadge
                  icon={MapPin}
                  label="Location"
                  value={context.location ? context.location.name.slice(0, 20) : 'None'}
                />
              </div>
              {context.research.claims.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#2a2b3d]">
                  <p className="text-xs text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {context.research.claims.length} historical claim{context.research.claims.length !== 1 ? 's' : ''} will be enforced
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Validation */}
          {validation && !validation.valid && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Validation Errors
              </h3>
              <ul className="space-y-1">
                {validation.errors.map((err, i) => (
                  <li key={i} className="text-xs text-red-300">
                    {err.field}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prompt Preview */}
          {prompt && (
            <div className="bg-[#12132a] border border-[#2a2b3d] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Generated Prompt Preview
              </h3>
              <div className="font-mono text-xs text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {prompt.finalPrompt || 'No prompt generated.'}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this request..."
              rows={2}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-[#2a2b3d]">
          <div className="flex items-center gap-2">
            {validation?.valid && (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            )}
            <span className="text-xs text-gray-400">
              {validation?.valid
                ? 'Request is valid and ready to create'
                : sourceId
                ? 'Fix validation errors before creating'
                : 'Select a source entity to begin'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContextBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="p-2 bg-[#1a1b2e] rounded-lg">
      <div className="flex items-center gap-1 text-gray-500 mb-0.5">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-gray-200 truncate">{value}</p>
    </div>
  );
}
