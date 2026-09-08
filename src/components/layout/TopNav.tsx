import { Project } from '../../types';
import {
  ChevronDown,
  Settings,
  Bell,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface TopNavProps {
  activeProject: Project | null;
  onToggleSidebar: () => void;
}

export default function TopNav({ activeProject, onToggleSidebar }: TopNavProps) {
  return (
    <header className="h-14 bg-[#12132a] border-b border-[#2a2b3d] flex items-center justify-between px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">
              Chronos Studio
            </h1>
            <p className="text-[10px] text-gray-500 -mt-0.5">AI Documentary Production</p>
          </div>
        </div>

        {/* Project Selector */}
        {activeProject && (
          <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-[#2a2b3d]">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1b2e] border border-[#2a2b3d] hover:border-indigo-500/50 transition-colors">
              <span className="text-sm text-gray-300 font-medium truncate max-w-[200px]">
                {activeProject.title}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1b2e] transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1b2e] transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
        </button>
        <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1b2e] transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <div className="ml-2 pl-2 border-l border-[#2a2b3d]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white">
            DS
          </div>
        </div>
      </div>
    </header>
  );
}
