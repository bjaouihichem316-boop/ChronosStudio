import { useState } from 'react';
import { ResearchNote } from '../../../types/research';
import { Plus, Pencil, Trash2, Tag, Search, X, Calendar, BookOpen } from 'lucide-react';

interface ResearchNotesPanelProps {
  notes: ResearchNote[];
  onAddNote: (note: Omit<ResearchNote, 'id' | 'dateAdded' | 'dateModified'>) => void;
  onUpdateNote: (note: ResearchNote) => void;
  onDeleteNote: (noteId: string) => void;
  editingNote: ResearchNote | null;
  setEditingNote: (note: ResearchNote | null) => void;
  isAdding: boolean;
  setIsAdding: (val: boolean) => void;
}

export default function ResearchNotesPanel({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  editingNote,
  setEditingNote,
  isAdding,
  setIsAdding,
}: ResearchNotesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state for add/edit
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // All unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  // Filtered notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const startAdding = () => {
    setFormTitle('');
    setFormContent('');
    setFormTags([]);
    setTagInput('');
    setIsAdding(true);
    setEditingNote(null);
  };

  const startEditing = (note: ResearchNote) => {
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormTags([...note.tags]);
    setTagInput('');
    setEditingNote(note);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setFormTags([]);
    setTagInput('');
  };

  const handleSave = () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    if (editingNote) {
      onUpdateNote({ ...editingNote, title: formTitle, content: formContent, tags: formTags });
    } else {
      onAddNote({ title: formTitle, content: formContent, tags: formTags });
    }
    cancelForm();
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formTags.includes(tag)) {
      setFormTags([...formTags, tag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormTags(formTags.filter((t) => t !== tag));
  };

  const handleDelete = (noteId: string) => {
    if (deleteConfirm === noteId) {
      onDeleteNote(noteId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(noteId);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isFormOpen = isAdding || editingNote !== null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>
        <button
          onClick={startAdding}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-500">Filter:</span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              !selectedTag
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                selectedTag === tag
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <div className="bg-[#1a1b2e] border border-indigo-500/30 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">
            {editingNote ? 'Edit Note' : 'New Research Note'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Note title..."
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            />
            <textarea
              placeholder="Write your research note..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
            />
            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {formTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600/20 text-indigo-300 text-xs rounded-full border border-indigo-500/30"
                  >
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Add tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={!formTitle.trim() || !formContent.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {editingNote ? 'Save Changes' : 'Add Note'}
              </button>
              <button
                onClick={cancelForm}
                className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {searchQuery || selectedTag ? 'No notes match your filters.' : 'No research notes yet.'}
            </p>
            {!searchQuery && !selectedTag && !isFormOpen && (
              <button
                onClick={startAdding}
                className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
              >
                Add your first note →
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4 hover:border-[#3a3b5d] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-200">{note.title}</h3>
                <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => startEditing(note)}
            className="p-1.5 text-gray-500 hover:text-indigo-400 rounded-lg hover:bg-[#22234a] transition-colors"
            title="Edit"
            aria-label={`Edit note: ${note.title}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(note.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              deleteConfirm === note.id
                ? 'text-red-400 bg-red-500/10'
                : 'text-gray-500 hover:text-red-400 hover:bg-[#22234a]'
            }`}
            title={deleteConfirm === note.id ? 'Click again to confirm' : 'Delete'}
            aria-label={deleteConfirm === note.id ? `Confirm delete: ${note.title}` : `Delete note: ${note.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mt-2 whitespace-pre-wrap">
                {note.content.length > 300 ? note.content.slice(0, 300) + '...' : note.content}
              </p>
              {note.content.length > 300 && (
                <p className="text-xs text-indigo-400 mt-1">Click to expand</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-[#22234a] text-gray-400 text-[10px] rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <span className="flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
                  <Calendar className="w-3 h-3" />
                  {formatDate(note.dateModified)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
