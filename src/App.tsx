import { useState } from 'react';
import { Project } from './types';
import { ResearchData } from './types/research';
import { sampleProjects } from './data/sampleProject';
import { constantinopleResearchData } from './data/researchData';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import ProjectOverview from './components/workspace/ProjectOverview';
import EmptyState from './components/workspace/EmptyState';
import NewProjectModal from './components/modals/NewProjectModal';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [activeProject, setActiveProject] = useState<Project | null>(
    sampleProjects[0]
  );
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Research data per project (keyed by project id)
  const [researchDataMap, setResearchDataMap] = useState<Record<string, ResearchData>>({
    'proj-001': constantinopleResearchData,
  });

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setActiveSection(null);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId === activeSection ? null : sectionId);
  };

  const handleNewProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleUpdateResearchData = (projectId: string, data: ResearchData) => {
    setResearchDataMap((prev) => ({ ...prev, [projectId]: data }));
  };

  const handleCreateProject = (
    title: string,
    year: string,
    description: string
  ) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title,
      subtitle: '',
      year: year || 'TBD',
      description: description || 'A new documentary project.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      sections: [
        {
          id: 'research',
          name: 'Research',
          icon: 'BookOpen',
          description: 'Historical research, academic sources, and primary documents',
          status: 'empty',
        },
        {
          id: 'sources',
          name: 'Sources',
          icon: 'FileText',
          description: 'Primary and secondary source materials',
          status: 'empty',
        },
        {
          id: 'script',
          name: 'Script',
          icon: 'PenTool',
          description: 'Narrative script and scene descriptions',
          status: 'empty',
        },
        {
          id: 'characters',
          name: 'Characters',
          icon: 'Users',
          description: 'Key historical figures and their roles',
          status: 'empty',
        },
        {
          id: 'scenes',
          name: 'Scenes',
          icon: 'Film',
          description: 'Scene breakdowns and visual storyboards',
          status: 'empty',
        },
        {
          id: 'voiceover',
          name: 'Voiceover',
          icon: 'Mic',
          description: 'Narration scripts and voice talent notes',
          status: 'empty',
        },
        {
          id: 'visuals',
          name: 'Visuals',
          icon: 'Image',
          description: 'Visual assets, maps, illustrations, and reconstructions',
          status: 'empty',
        },
        {
          id: 'timeline',
          name: 'Timeline',
          icon: 'Clock',
          description: 'Chronological timeline of events',
          status: 'empty',
        },
        {
          id: 'export',
          name: 'Export',
          icon: 'Download',
          description: 'Export settings and final output configuration',
          status: 'empty',
        },
      ],
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProject(newProject);
    setActiveSection(null);
    // Initialize empty research data for new project
    setResearchDataMap((prev) => ({
      ...prev,
      [newProject.id]: { notes: [], claims: [], sources: [] },
    }));
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f1021] text-white overflow-hidden">
      {/* Top Navigation */}
      <TopNav
        activeProject={activeProject}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:block h-full`}
        >
          <Sidebar
            projects={projects}
            activeProject={activeProject}
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
          />
        </div>

        {/* Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0f1021]" aria-label="Project workspace">
          {activeProject ? (
            <ProjectOverview
              project={activeProject}
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
              researchData={researchDataMap[activeProject.id] || null}
              onUpdateResearchData={(data) =>
                handleUpdateResearchData(activeProject.id, data)
              }
            />
          ) : (
            <EmptyState onNewProject={handleNewProject} />
          )}
        </main>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
