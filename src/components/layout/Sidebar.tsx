import { useState } from 'react';
import { Project } from '../../types';
import {
  Plus,
  Search,
  Archive,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
}

export default function Sidebar({
  projects,
  activeProject,
  onSelectProject,
  onNewProject,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    active: true,
    draft: true,
    archived: false,
  });

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProjects = filteredProjects.filter((p) => p.status === 'active');
  const draftProjects = filteredProjects.filter((p) => p.status === 'draft');
  const archivedProjects = filteredProjects.filter((p) => p.status === 'archived');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="w-72 bg-[#1a1b2e] border-r border-[#2a2b3d] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2b3d]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Projects
          </h2>
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => toggleSection('active')}
              className="flex items-center gap-2 px-4 py-1.5 w-full text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
            >
              {expandedSections.active ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              Active
            </button>
            {expandedSections.active &&
              activeProjects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  isActive={activeProject?.id === project.id}
                  onClick={() => onSelectProject(project)}
                />
              ))}
          </div>
        )}

        {/* Draft Projects */}
        {draftProjects.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => toggleSection('draft')}
              className="flex items-center gap-2 px-4 py-1.5 w-full text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
            >
              {expandedSections.draft ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              Drafts
            </button>
            {expandedSections.draft &&
              draftProjects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  isActive={activeProject?.id === project.id}
                  onClick={() => onSelectProject(project)}
                />
              ))}
          </div>
        )}

        {/* Archived Projects */}
        {archivedProjects.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => toggleSection('archived')}
              className="flex items-center gap-2 px-4 py-1.5 w-full text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
            >
              {expandedSections.archived ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              Archived
            </button>
            {expandedSections.archived &&
              archivedProjects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  isActive={activeProject?.id === project.id}
                  onClick={() => onSelectProject(project)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#2a2b3d]">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
      </div>
    </aside>
  );
}

function ProjectItem({
  project,
  isActive,
  onClick,
}: {
  project: Project;
  isActive: boolean;
  onClick: () => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'archived':
        return <Archive className="w-3 h-3" />;
      case 'draft':
        return <FileText className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
        isActive
          ? 'bg-indigo-600/15 border-r-2 border-indigo-500'
          : 'hover:bg-[#22234a]'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
          isActive
            ? 'bg-indigo-600/30 text-indigo-300'
            : 'bg-[#2a2b3d] text-gray-400'
        }`}
      >
        {project.title.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isActive ? 'text-indigo-200' : 'text-gray-300'
          }`}
        >
          {project.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{project.year}</p>
      </div>
      <div className="text-gray-500">{getStatusIcon(project.status)}</div>
    </button>
  );
}
