import { GenerationRequest } from '../../../types/ai';
import { Eye, FileText, BookOpen, Film, Users, MapPin } from 'lucide-react';

interface ContextInspectorProps {
  request: GenerationRequest | null;
  onSelectRequest: (request: GenerationRequest) => void;
  requests: GenerationRequest[];
}

export default function ContextInspector({
  request,
  onSelectRequest,
  requests,
}: ContextInspectorProps) {
  if (!request) {
    return (
      <div className="space-y-4">
        <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Select a Request to Inspect</h3>
          {requests.length === 0 ? (
            <p className="text-sm text-gray-400">No requests available. Create a request first.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className="w-full flex items-center justify-between p-3 bg-[#12132a] hover:bg-[#1a1b2e] rounded-lg transition-colors text-left"
                >
                  <div>
                    <p className="text-sm text-gray-200">{req.prompt.subject || 'No subject'}</p>
                    <p className="text-xs text-gray-500">{req.type} • {req.source.kind}</p>
                  </div>
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { context, prompt } = request;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#1a1b2e] border border-indigo-500/30 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Eye className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Context Inspector</h2>
        </div>
        <p className="text-sm text-gray-400">
          Inspecting request for <span className="text-indigo-400">{request.type}</span> generation
          from <span className="text-indigo-400">{request.source.kind}</span>
        </p>
      </div>

      {/* Project Context */}
      <ContextSection icon={FileText} title="Project">
        <div className="space-y-1">
          <p className="text-sm text-gray-200">{context.project.title}</p>
          <p className="text-xs text-gray-500">Year: {context.project.year}</p>
          <p className="text-xs text-gray-500">{context.project.description}</p>
        </div>
      </ContextSection>

      {/* Research Context */}
      <ContextSection icon={BookOpen} title="Research">
        {context.research.claims.length === 0 ? (
          <p className="text-xs text-gray-500">No research claims linked</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">
              {context.research.claims.length} claim{context.research.claims.length !== 1 ? 's' : ''},
              {' '}{context.research.sources.length} source{context.research.sources.length !== 1 ? 's' : ''}
            </p>
            {context.research.claims.map((claim) => (
              <div key={claim.id} className="p-2 bg-[#12132a] rounded-lg">
                <p className="text-xs text-gray-200">{claim.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{claim.description}</p>
              </div>
            ))}
          </div>
        )}
      </ContextSection>

      {/* Script Context */}
      <ContextSection icon={FileText} title="Script">
        {context.script.scene ? (
          <div className="space-y-2">
            {context.script.chapter && (
              <p className="text-xs text-gray-400">Chapter: {context.script.chapter.title}</p>
            )}
            <p className="text-sm text-gray-200">{context.script.scene.title}</p>
            <p className="text-xs text-gray-500">Period: {context.script.scene.timePeriod}</p>
            <p className="text-xs text-gray-500">Purpose: {context.script.scene.purpose}</p>
            {context.script.scene.narration && (
              <div className="mt-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Narration</p>
                <p className="text-xs text-gray-300 italic">{context.script.scene.narration}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No script scene linked</p>
        )}
      </ContextSection>

      {/* Production Context */}
      <ContextSection icon={Film} title="Production">
        {context.production.shot ? (
          <div className="space-y-2">
            {context.production.scene && (
              <p className="text-xs text-gray-400">Scene: {context.production.scene.title}</p>
            )}
            <p className="text-sm text-gray-200">{context.production.shot.subject}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <span>Type: {context.production.shot.shotType}</span>
              <span>Angle: {context.production.shot.cameraAngle}</span>
              <span>Movement: {context.production.shot.cameraMovement}</span>
              <span>Framing: {context.production.shot.framing}</span>
              <span>Duration: {context.production.shot.duration}s</span>
              <span>Mood: {context.production.shot.mood}</span>
            </div>
            {context.production.shot.visualDescription && (
              <div className="mt-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Visual Description</p>
                <p className="text-xs text-gray-300">{context.production.shot.visualDescription}</p>
              </div>
            )}
          </div>
        ) : context.production.scene ? (
          <div>
            <p className="text-sm text-gray-200">{context.production.scene.title}</p>
            <p className="text-xs text-gray-500">{context.production.scene.notes}</p>
          </div>
        ) : (
          <p className="text-xs text-gray-500">No production shot or scene linked</p>
        )}
      </ContextSection>

      {/* Characters */}
      <ContextSection icon={Users} title="Characters">
        {context.characters.length === 0 ? (
          <p className="text-xs text-gray-500">No characters specified</p>
        ) : (
          <div className="space-y-2">
            {context.characters.map((char) => (
              <div key={char.id} className="p-2 bg-[#12132a] rounded-lg">
                <p className="text-xs text-gray-200 font-medium">{char.name}</p>
                <p className="text-[10px] text-gray-500">{char.historicalRole} • {char.era}</p>
                <p className="text-[10px] text-gray-400 mt-1">{char.appearance}</p>
              </div>
            ))}
          </div>
        )}
      </ContextSection>

      {/* Location */}
      <ContextSection icon={MapPin} title="Location">
        {context.location ? (
          <div className="space-y-1">
            <p className="text-sm text-gray-200">{context.location.name}</p>
            <p className="text-xs text-gray-500">Era: {context.location.era}</p>
            <p className="text-xs text-gray-400 mt-1">{context.location.visualDescription}</p>
            {context.location.atmosphere && (
              <p className="text-xs text-gray-500">Atmosphere: {context.location.atmosphere}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No location specified</p>
        )}
      </ContextSection>

      {/* Prompt Preview */}
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Generated Prompt
        </h3>
        <div className="bg-[#12132a] rounded-lg p-3 font-mono text-xs text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
          {prompt.finalPrompt || 'No prompt generated yet.'}
        </div>

        {/* Historical Constraints */}
        {prompt.historicalConstraints.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-amber-400 mb-2">
              Historical Constraints ({prompt.historicalConstraints.length})
            </h4>
            <div className="space-y-1">
              {prompt.historicalConstraints.map((constraint) => (
                <div key={constraint.claimId} className="p-2 bg-amber-500/5 border border-amber-500/20 rounded text-xs">
                  <p className="text-amber-300">{constraint.claimTitle}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{constraint.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContextSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-indigo-400" />
        {title}
      </h3>
      {children}
    </div>
  );
}
