import { Project, ProjectSection } from '../../types';
import { ResearchData } from '../../types/research';
import { ScriptData } from '../../types/script';
import { ProductionData } from '../../types/production';
import { AIData } from '../../types/ai';
import { VisualBibleData } from '../../types/visual-bible';
import { PipelineData } from '../../types/pipeline';
import { MediaData } from '../../types/media';
import {
  BookOpen,
  FileText,
  PenTool,
  Users,
  Film,
  Mic,
  Image,
  Clock,
  Download,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import ResearchWorkspace from './research/ResearchWorkspace';
import ResearchProgressIndicator from './research/ResearchProgressIndicator';
import ScriptWorkspace from './script/ScriptWorkspace';
import ProductionWorkspace from './production/ProductionWorkspace';
import AIWorkspace from './ai/AIWorkspace';
import VisualBibleWorkspace from './visual-bible/VisualBibleWorkspace';
import PipelineWorkspace from './pipeline/PipelineWorkspace';
import MediaWorkspace from './media/MediaWorkspace';

interface ProjectOverviewProps {
  project: Project;
  activeSection: string | null;
  onSelectSection: (sectionId: string) => void;
  researchData: ResearchData | null;
  onUpdateResearchData: (data: ResearchData) => void;
  scriptData: ScriptData | null;
  onUpdateScriptData: (data: ScriptData) => void;
  productionData: ProductionData | null;
  onUpdateProductionData: (data: ProductionData) => void;
  aiData: AIData | null;
  onUpdateAIData: (data: AIData) => void;
  visualBibleData: VisualBibleData | null;
  onUpdateVisualBibleData: (data: VisualBibleData) => void;
  pipelineData: PipelineData | null;
  onUpdatePipelineData: (data: PipelineData) => void;
  mediaData: MediaData | null;
  onUpdateMediaData: (data: MediaData) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  FileText,
  PenTool,
  Users,
  Film,
  Mic,
  Image,
  Clock,
  Download,
};

export default function ProjectOverview({
  project,
  activeSection,
  onSelectSection,
  researchData,
  onUpdateResearchData,
  scriptData,
  onUpdateScriptData,
  productionData,
  onUpdateProductionData,
  aiData,
  onUpdateAIData,
  visualBibleData,
  onUpdateVisualBibleData,
  pipelineData,
  onUpdatePipelineData,
  mediaData,
  onUpdateMediaData,
}: ProjectOverviewProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Section Navigation */}
      <nav className="border-b border-[#2a2b3d] bg-[#12132a]/50" aria-label="Project sections">
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
          {project.sections.map((section) => {
            const Icon = iconMap[section.icon] || FileText;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b2e]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {section.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSection ? (
          activeSection === 'research' ? (
            researchData ? (
              <ResearchWorkspace
                data={researchData}
                onUpdateData={onUpdateResearchData}
              />
            ) : (
              <EmptyResearchSection projectTitle={project.title} />
            )
          ) : activeSection === 'script' ? (
            scriptData ? (
              <ScriptWorkspace
                data={scriptData}
                researchData={researchData}
                onUpdateData={onUpdateScriptData}
              />
            ) : (
              <EmptyScriptSection projectTitle={project.title} />
            )
          ) : activeSection === 'production' ? (
            productionData ? (
              <ProductionWorkspace
                data={productionData}
                scriptData={scriptData}
                onUpdateData={onUpdateProductionData}
              />
            ) : (
              <EmptyProductionSection projectTitle={project.title} />
            )
          ) : activeSection === 'ai' ? (
            aiData ? (
              <AIWorkspace
                data={aiData}
                project={project}
                researchData={researchData!}
                scriptData={scriptData!}
                productionData={productionData!}
                visualBibleData={visualBibleData!}
                onUpdateData={onUpdateAIData}
              />
            ) : (
              <EmptyAISection projectTitle={project.title} />
            )
          ) : activeSection === 'visual-bible' ? (
            visualBibleData ? (
              <VisualBibleWorkspace
                data={visualBibleData}
                productionData={productionData!}
                researchData={researchData!}
                onUpdateData={onUpdateVisualBibleData}
              />
            ) : (
              <EmptyVisualBibleSection projectTitle={project.title} />
            )
          ) : activeSection === 'pipeline' ? (
            pipelineData ? (
              <PipelineWorkspace
                pipelineData={pipelineData}
                aiData={aiData!}
                productionData={productionData!}
                visualBibleData={visualBibleData!}
                researchData={researchData!}
                scriptData={scriptData!}
                onUpdateData={onUpdatePipelineData}
              />
            ) : (
              <EmptyPipelineSection projectTitle={project.title} />
            )
          ) : activeSection === 'media' ? (
            mediaData ? (
              <MediaWorkspace
                mediaData={mediaData}
                pipelineData={pipelineData!}
                onUpdateMediaData={onUpdateMediaData}
              />
            ) : (
              <EmptyMediaSection projectTitle={project.title} />
            )
          ) : (
            <SectionContent
              section={project.sections.find((s) => s.id === activeSection) || project.sections[0]}
              project={project}
            />
          )
        ) : (
          <ProjectDashboard
            project={project}
            onSelectSection={onSelectSection}
            researchData={researchData}
          />
        )}
      </div>
    </div>
  );
}

function ProjectDashboard({
  project,
  onSelectSection,
  researchData,
}: {
  project: Project;
  onSelectSection: (id: string) => void;
  researchData: ResearchData | null;
}) {
  const completedSections = project.sections.filter(
    (s) => s.status === 'complete'
  ).length;
  const inProgressSections = project.sections.filter(
    (s) => s.status === 'in-progress'
  ).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">
                {project.title}
              </h2>
              <span className="px-2.5 py-0.5 bg-indigo-600/20 text-indigo-300 text-xs font-medium rounded-full border border-indigo-500/30">
                {project.year}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{project.subtitle}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </button>
        </div>
        <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-3xl">
          {project.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Sections"
          value={project.sections.length.toString()}
          color="indigo"
        />
        <StatCard
          label="In Progress"
          value={inProgressSections.toString()}
          color="amber"
        />
        <StatCard
          label="Completed"
          value={completedSections.toString()}
          color="emerald"
        />
      </div>

      {/* Research Progress Indicator */}
      {researchData && (
        <div className="mb-8">
          <ResearchProgressIndicator data={researchData} />
        </div>
      )}

      {/* Section Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            onClick={() => onSelectSection(section.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  onClick,
}: {
  section: ProjectSection;
  onClick: () => void;
}) {
  const Icon = iconMap[section.icon] || FileText;

  const statusColors = {
    empty: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    'in-progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    complete: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const statusLabels = {
    empty: 'Not Started',
    'in-progress': 'In Progress',
    complete: 'Complete',
  };

  return (
    <button
      onClick={onClick}
      className="group p-4 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl hover:border-indigo-500/40 hover:bg-[#1e1f3a] transition-all text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#22234a] flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
          <Icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
        </div>
        <span
          className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusColors[section.status]}`}
        >
          {statusLabels[section.status]}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gray-200 mb-1 group-hover:text-white transition-colors">
        {section.name}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed">
        {section.description}
      </p>
      <div className="mt-3 flex items-center gap-1 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Open section <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}

function SectionContent({
  section,
  project,
}: {
  section: ProjectSection;
  project: Project;
}) {
  const Icon = iconMap[section.icon] || FileText;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{section.name}</h2>
          <p className="text-sm text-gray-400">{section.description}</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            {section.name} Section
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            This section is ready to be populated with content for{' '}
            <span className="text-gray-400">{project.title}</span>.
            {section.status === 'in-progress'
              ? ' Work is currently in progress.'
              : ' Click below to start adding content or use AI assistance.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
            <button className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors">
              Add Manually
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <QuickAction
          icon="📄"
          title="Import Documents"
          description="Upload research papers, articles, or source materials"
        />
        <QuickAction
          icon="🔍"
          title="AI Research"
          description="Let AI gather and organize relevant information"
        />
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <button className="flex items-center gap-3 p-3 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg hover:border-indigo-500/30 transition-colors text-left">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-gray-300">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </button>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'indigo' | 'amber' | 'emerald';
}) {
  const colorClasses = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/20',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20',
  };

  const textColors = {
    indigo: 'text-indigo-300',
    amber: 'text-amber-300',
    emerald: 'text-emerald-300',
  };

  return (
    <div
      className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}
    >
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
    </div>
  );
}

function EmptyResearchSection({ projectTitle }: { projectTitle: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Research</h2>
          <p className="text-sm text-gray-400">Historical research, claims, and source materials</p>
        </div>
      </div>
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Research Workspace
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            The research workspace for <span className="text-gray-400">{projectTitle}</span> is ready to be initialized.
            Start adding research notes, historical claims, and sources to build your documentary foundation.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Sparkles className="w-4 h-4" />
              Initialize with AI
            </button>
            <button className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors">
              Start Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyPipelineSection({ projectTitle }: { projectTitle: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <Clock className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Generation Pipeline</h2>
          <p className="text-sm text-gray-400">AI generation task management and execution</p>
        </div>
      </div>
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Generation Pipeline
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            The generation pipeline for <span className="text-gray-400">{projectTitle}</span> is ready.
            Create generation requests in the AI workspace to start building your pipeline.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Sparkles className="w-4 h-4" />
              Go to AI Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyMediaSection({ projectTitle }: { projectTitle: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
          <Image className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Media Assets</h2>
          <p className="text-sm text-gray-400">Generated and imported media management</p>
        </div>
      </div>
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Media Assets
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            The media asset library for <span className="text-gray-400">{projectTitle}</span> is ready.
            Complete generation tasks to create media assets.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Sparkles className="w-4 h-4" />
              Go to Pipeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyAISection({ projectTitle }: { projectTitle: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Generation Center</h2>
          <p className="text-sm text-gray-400">AI-powered generation for your documentary</p>
        </div>
      </div>
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            AI Generation Center
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            The AI generation center for <span className="text-gray-400">{projectTitle}</span> is ready.
            Create generation requests from your production shots, scenes, characters, and locations.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Sparkles className="w-4 h-4" />
              Initialize AI Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyVisualBibleSection({ projectTitle }: { projectTitle: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Visual Bible</h2>
          <p className="text-sm text-gray-400">Canonical visual identity and continuity</p>
        </div>
      </div>
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Visual Bible
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            The visual bible for <span className="text-gray-400">{projectTitle}</span> is ready.
            Define canonical visual identity for characters and locations, and establish continuity rules.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors">
              <BookOpen className="w-4 h-4" />
              Initialize Visual Bible
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyProductionSection({ projectTitle }: { projectTitle: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Film className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Production Studio</h2>
          <p className="text-sm text-gray-400">Production planning and visual pre-production</p>
        </div>
      </div>
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Production Studio
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            The production studio for <span className="text-gray-400">{projectTitle}</span> is ready to be initialized.
            Start by creating characters, locations, and production scenes to plan your documentary.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
            <button className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors">
              Start Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyScriptSection({ projectTitle }: { projectTitle: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <PenTool className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Script Studio</h2>
          <p className="text-sm text-gray-400">Documentary script with acts and scenes</p>
        </div>
      </div>
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Script Studio
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            The script studio for <span className="text-gray-400">{projectTitle}</span> is ready to be initialized.
            Start creating acts and scenes to build your documentary narrative.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
            <button className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors">
              Start Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
