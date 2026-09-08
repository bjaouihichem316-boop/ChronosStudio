import { Plus, Film, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onNewProject: () => void;
}

export default function EmptyState({ onNewProject }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
          <Film className="w-10 h-10 text-indigo-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-2">
          Welcome to Chronos Studio
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-8">
          Your AI-powered documentary production workspace. Create compelling
          historical documentaries with the help of artificial intelligence.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Project
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1b2e] hover:bg-[#22234a] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors">
            <Sparkles className="w-4 h-4" />
            AI Quick Start
          </button>
        </div>

        {/* Features */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <Feature
            emoji="📚"
            title="Research"
            description="AI-assisted historical research and source gathering"
          />
          <Feature
            emoji="🎬"
            title="Production"
            description="Script writing, scene planning, and visual storyboarding"
          />
          <Feature
            emoji="🎙️"
            title="Post-Production"
            description="Voiceover, timeline editing, and export management"
          />
        </div>
      </div>
    </div>
  );
}

function Feature({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-[#1a1b2e] border border-[#2a2b3d]">
      <span className="text-lg">{emoji}</span>
      <h3 className="text-sm font-medium text-gray-300 mt-2">{title}</h3>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}
