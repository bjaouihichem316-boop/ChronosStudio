import { useState, useEffect, useCallback } from 'react';
import { Project } from './types';
import { ResearchData } from './types/research';
import { ScriptData } from './types/script';
import { ProductionData } from './types/production';
import { sampleProjects } from './data/sampleProject';
import { constantinopleResearchData } from './data/researchData';
import { constantinopleScriptData } from './data/scriptData';
import { constantinopleProductionData } from './data/productionData';
import {
  loadProjects,
  saveProjects,
  loadProjectData,
  saveResearchData,
  saveScriptData,
  saveProductionData,
  clearProjectData,
} from './utils/persistence';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import ProjectOverview from './components/workspace/ProjectOverview';
import EmptyState from './components/workspace/EmptyState';
import NewProjectModal from './components/modals/NewProjectModal';

// Default domain data for new projects
function emptyResearchData(): ResearchData {
  return { notes: [], claims: [], sources: [] };
}

function emptyScriptData(title: string): ScriptData {
  return { title, chapters: [], scenes: [], lastSaved: new Date().toISOString() };
}

function emptyProductionData(): ProductionData {
  return {
    characters: [],
    locations: [],
    scenes: [],
    shots: [],
    assets: [],
    lastSaved: new Date().toISOString(),
  };
}

/**
 * Initialize the data maps from localStorage, falling back to sample data
 * for the first project if nothing is persisted yet.
 */
function initializeDataMaps(projects: Project[]): {
  research: Record<string, ResearchData>;
  script: Record<string, ScriptData>;
  production: Record<string, ProductionData>;
} {
  const researchMap: Record<string, ResearchData> = {};
  const scriptMap: Record<string, ScriptData> = {};
  const productionMap: Record<string, ProductionData> = {};

  for (const project of projects) {
    const persisted = loadProjectData(project.id);

    // Research: persisted → sample (for proj-001) → empty
    if (persisted.research) {
      researchMap[project.id] = persisted.research;
    } else if (project.id === 'proj-001') {
      researchMap[project.id] = constantinopleResearchData;
    } else {
      researchMap[project.id] = emptyResearchData();
    }

    // Script: persisted → sample (for proj-001) → empty
    if (persisted.script) {
      scriptMap[project.id] = persisted.script;
    } else if (project.id === 'proj-001') {
      scriptMap[project.id] = constantinopleScriptData;
    } else {
      scriptMap[project.id] = emptyScriptData(project.title);
    }

    // Production: persisted → sample (for proj-001) → empty
    if (persisted.production) {
      productionMap[project.id] = persisted.production;
    } else if (project.id === 'proj-001') {
      productionMap[project.id] = constantinopleProductionData;
    } else {
      productionMap[project.id] = emptyProductionData();
    }
  }

  return { research: researchMap, script: scriptMap, production: productionMap };
}

export default function App() {
  // Initialize projects from localStorage or use sample data
  const [projects, setProjects] = useState<Project[]>(() => {
    const persisted = loadProjects();
    return persisted && persisted.length > 0 ? persisted : sampleProjects;
  });

  // Initialize domain data maps from localStorage
  const [initialData] = useState(() => initializeDataMaps(projects));

  const [researchDataMap, setResearchDataMap] = useState<Record<string, ResearchData>>(initialData.research);
  const [scriptDataMap, setScriptDataMap] = useState<Record<string, ScriptData>>(initialData.script);
  const [productionDataMap, setProductionDataMap] = useState<Record<string, ProductionData>>(initialData.production);

  const [activeProject, setActiveProject] = useState<Project | null>(projects[0] || null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // ─── Persist projects on change ──────────────────────────────────────────────
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleSelectProject = useCallback((project: Project) => {
    setActiveProject(project);
    setActiveSection(null);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleSelectSection = useCallback((sectionId: string) => {
    setActiveSection((prev) => (sectionId === prev ? null : sectionId));
  }, []);

  const handleNewProject = useCallback(() => {
    setIsNewProjectModalOpen(true);
  }, []);

  // Update handlers — persist on every change
  const handleUpdateResearchData = useCallback((projectId: string, data: ResearchData) => {
    setResearchDataMap((prev) => {
      const next = { ...prev, [projectId]: data };
      saveResearchData(projectId, data);
      return next;
    });
  }, []);

  const handleUpdateScriptData = useCallback((projectId: string, data: ScriptData) => {
    setScriptDataMap((prev) => {
      const next = { ...prev, [projectId]: data };
      saveScriptData(projectId, data);
      return next;
    });
  }, []);

  const handleUpdateProductionData = useCallback((projectId: string, data: ProductionData) => {
    setProductionDataMap((prev) => {
      const next = { ...prev, [projectId]: data };
      saveProductionData(projectId, data);
      return next;
    });
  }, []);

  const handleCreateProject = useCallback(
    (title: string, year: string, description: string) => {
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
          { id: 'research', name: 'Research', icon: 'BookOpen', description: 'Historical research, academic sources, and primary documents', status: 'empty' },
          { id: 'sources', name: 'Sources', icon: 'FileText', description: 'Primary and secondary source materials', status: 'empty' },
          { id: 'script', name: 'Script', icon: 'PenTool', description: 'Narrative script and scene descriptions', status: 'empty' },
          { id: 'production', name: 'Production', icon: 'Film', description: 'Production planning, characters, locations, and shots', status: 'empty' },
          { id: 'characters', name: 'Characters', icon: 'Users', description: 'Key historical figures and their roles', status: 'empty' },
          { id: 'scenes', name: 'Scenes', icon: 'Film', description: 'Scene breakdowns and visual storyboards', status: 'empty' },
          { id: 'voiceover', name: 'Voiceover', icon: 'Mic', description: 'Narration scripts and voice talent notes', status: 'empty' },
          { id: 'visuals', name: 'Visuals', icon: 'Image', description: 'Visual assets, maps, illustrations, and reconstructions', status: 'empty' },
          { id: 'timeline', name: 'Timeline', icon: 'Clock', description: 'Chronological timeline of events', status: 'empty' },
          { id: 'export', name: 'Export', icon: 'Download', description: 'Export settings and final output configuration', status: 'empty' },
        ],
      };

      // Initialize empty domain data for the new project
      const emptyResearch = emptyResearchData();
      const emptyScript = emptyScriptData(title);
      const emptyProduction = emptyProductionData();

      setProjects((prev) => [newProject, ...prev]);
      setResearchDataMap((prev) => {
        const next = { ...prev, [newProject.id]: emptyResearch };
        saveResearchData(newProject.id, emptyResearch);
        return next;
      });
      setScriptDataMap((prev) => {
        const next = { ...prev, [newProject.id]: emptyScript };
        saveScriptData(newProject.id, emptyScript);
        return next;
      });
      setProductionDataMap((prev) => {
        const next = { ...prev, [newProject.id]: emptyProduction };
        saveProductionData(newProject.id, emptyProduction);
        return next;
      });

      setActiveProject(newProject);
      setActiveSection(null);
    },
    []
  );

  // ─── Delete project handler ──────────────────────────────────────────────────
  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== projectId);
      // Clean up persisted data
      clearProjectData(projectId);
      return next;
    });
    setResearchDataMap((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
    setScriptDataMap((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
    setProductionDataMap((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
    // If the deleted project was active, switch to first remaining
    if (activeProject?.id === projectId) {
      setActiveProject(projects.find((p) => p.id !== projectId) || null);
      setActiveSection(null);
    }
  }, [activeProject, projects]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f1021] text-white overflow-hidden">
      <TopNav
        activeProject={activeProject}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block h-full`}>
          <Sidebar
            projects={projects}
            activeProject={activeProject}
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
          />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden bg-[#0f1021]" aria-label="Project workspace">
          {activeProject ? (
            <ProjectOverview
              project={activeProject}
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
              researchData={researchDataMap[activeProject.id] || null}
              onUpdateResearchData={(data) => handleUpdateResearchData(activeProject.id, data)}
              scriptData={scriptDataMap[activeProject.id] || null}
              onUpdateScriptData={(data: ScriptData) => handleUpdateScriptData(activeProject.id, data)}
              productionData={productionDataMap[activeProject.id] || null}
              onUpdateProductionData={(data: ProductionData) => handleUpdateProductionData(activeProject.id, data)}
            />
          ) : (
            <EmptyState onNewProject={handleNewProject} />
          )}
        </main>
      </div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
