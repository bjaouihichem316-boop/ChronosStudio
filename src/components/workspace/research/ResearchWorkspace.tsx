import { useState } from 'react';
import { ResearchData, ResearchNote, HistoricalClaim, ResearchSource } from '../../../types/research';
import { BookOpen, Flag, FileText, Sparkles } from 'lucide-react';
import ResearchNotesPanel from './ResearchNotesPanel';
import ClaimsPanel from './ClaimsPanel';
import SourcesPanel from './SourcesPanel';
import ClaimDetailView from './ClaimDetailView';

type ResearchTab = 'notes' | 'claims' | 'sources';

interface ResearchWorkspaceProps {
  data: ResearchData;
  onUpdateData: (data: ResearchData) => void;
}

export default function ResearchWorkspace({ data, onUpdateData }: ResearchWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ResearchTab>('notes');
  const [selectedClaim, setSelectedClaim] = useState<HistoricalClaim | null>(null);
  const [editingNote, setEditingNote] = useState<ResearchNote | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isAddingClaim, setIsAddingClaim] = useState(false);

  const handleAddNote = (note: Omit<ResearchNote, 'id' | 'dateAdded' | 'dateModified'>) => {
    const newNote: ResearchNote = {
      ...note,
      id: `note-${Date.now()}`,
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    onUpdateData({ ...data, notes: [newNote, ...data.notes] });
    setIsAddingNote(false);
  };

  const handleUpdateNote = (updatedNote: ResearchNote) => {
    onUpdateData({
      ...data,
      notes: data.notes.map((n) =>
        n.id === updatedNote.id ? { ...updatedNote, dateModified: new Date().toISOString() } : n
      ),
    });
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateData({ ...data, notes: data.notes.filter((n) => n.id !== noteId) });
  };

  const handleAddSource = (source: Omit<ResearchSource, 'id' | 'dateAdded'>) => {
    const newSource: ResearchSource = {
      ...source,
      id: `src-${Date.now()}`,
      dateAdded: new Date().toISOString(),
    };
    onUpdateData({ ...data, sources: [...data.sources, newSource] });
    setIsAddingSource(false);
  };

  const handleDeleteSource = (sourceId: string) => {
    onUpdateData({
      ...data,
      sources: data.sources.filter((s) => s.id !== sourceId),
      claims: data.claims.map((c) => ({
        ...c,
        sourceIds: c.sourceIds.filter((id) => id !== sourceId),
      })),
    });
  };

  const handleAddClaim = (claim: Omit<HistoricalClaim, 'id' | 'dateAdded' | 'dateModified'>) => {
    const newClaim: HistoricalClaim = {
      ...claim,
      id: `claim-${Date.now()}`,
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    onUpdateData({ ...data, claims: [newClaim, ...data.claims] });
    setIsAddingClaim(false);
  };

  const handleUpdateClaim = (updatedClaim: HistoricalClaim) => {
    const updatedClaimWithDate = { ...updatedClaim, dateModified: new Date().toISOString() };
    onUpdateData({
      ...data,
      claims: data.claims.map((c) =>
        c.id === updatedClaimWithDate.id ? updatedClaimWithDate : c
      ),
    });
    // Update selectedClaim if it's the one being edited
    if (selectedClaim?.id === updatedClaimWithDate.id) {
      setSelectedClaim(updatedClaimWithDate);
    }
  };

  const handleDeleteClaim = (claimId: string) => {
    onUpdateData({ ...data, claims: data.claims.filter((c) => c.id !== claimId) });
    if (selectedClaim?.id === claimId) setSelectedClaim(null);
  };

  const handleSelectClaim = (claim: HistoricalClaim) => {
    setSelectedClaim(claim);
  };

  const tabs = [
    { id: 'notes' as const, label: 'Research Notes', icon: BookOpen, count: data.notes.length },
    { id: 'claims' as const, label: 'Historical Claims', icon: Flag, count: data.claims.length },
    { id: 'sources' as const, label: 'Sources', icon: FileText, count: data.sources.length },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Research</h2>
          <p className="text-sm text-gray-400">Historical research, claims, and source materials</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Sparkles className="w-4 h-4" />
          AI Research
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#2a2b3d] mb-6" role="tablist" aria-label="Research sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedClaim(null);
                setEditingNote(null);
                setIsAddingNote(false);
                setIsAddingSource(false);
                setIsAddingClaim(false);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-[#22234a] text-gray-400">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'notes' && (
        <div role="tabpanel" id="panel-notes" aria-labelledby="tab-notes">
          <ResearchNotesPanel
            notes={data.notes}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            editingNote={editingNote}
            setEditingNote={setEditingNote}
            isAdding={isAddingNote}
            setIsAdding={setIsAddingNote}
          />
        </div>
      )}

      {activeTab === 'claims' && !selectedClaim && (
        <div role="tabpanel" id="panel-claims" aria-labelledby="tab-claims">
          <ClaimsPanel
            claims={data.claims}
            sources={data.sources}
            onSelectClaim={handleSelectClaim}
            onAddClaim={handleAddClaim}
            onDeleteClaim={handleDeleteClaim}
            isAdding={isAddingClaim}
            setIsAdding={setIsAddingClaim}
          />
        </div>
      )}

      {activeTab === 'claims' && selectedClaim && (
        <div role="tabpanel" id="panel-claims">
          <ClaimDetailView
            key={selectedClaim.id}
            claim={selectedClaim}
            sources={data.sources.filter((s) => selectedClaim.sourceIds.includes(s.id))}
            onBack={() => setSelectedClaim(null)}
            onUpdateClaim={handleUpdateClaim}
          />
        </div>
      )}

      {activeTab === 'sources' && (
        <div role="tabpanel" id="panel-sources" aria-labelledby="tab-sources">
          <SourcesPanel
            sources={data.sources}
            claims={data.claims}
            onAddSource={handleAddSource}
            onDeleteSource={handleDeleteSource}
            isAdding={isAddingSource}
            setIsAdding={setIsAddingSource}
          />
        </div>
      )}
    </div>
  );
}
