export interface ProjectSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'empty' | 'in-progress' | 'complete';
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  sections: ProjectSection[];
  status: 'active' | 'archived' | 'draft';
}

export type ActiveSection = string | null;
