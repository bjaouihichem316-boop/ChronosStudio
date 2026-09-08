import { useState } from 'react';
import { Chapter } from '../../../types/script';
import { X } from 'lucide-react';

interface ChapterEditorProps {
  chapter: Chapter | null;
  onSave: (chapter: Chapter) => void;
  onClose: () => void;
}

export default function ChapterEditor({ chapter, onSave, onClose }: ChapterEditorProps) {
  const [title, setTitle] = useState(chapter?.title || '');
  const [description, setDescription] = useState(chapter?.description || '');

  const handleSave = () => {
    if (!title.trim()) return;
    const updatedChapter: Chapter = {
      id: chapter?.id || `ch-${Date.now()}`,
      title,
      description,
      order: chapter?.order || 0,
      dateCreated: chapter?.dateCreated || new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    onSave(updatedChapter);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {chapter ? 'Edit Act' : 'New Act'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#22234a] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Act Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Act I — The Beginning"
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this act..."
              rows={3}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {chapter ? 'Save Changes' : 'Create Act'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
