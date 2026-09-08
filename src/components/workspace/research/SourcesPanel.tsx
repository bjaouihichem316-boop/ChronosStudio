import { useState } from 'react';
import { ResearchSource, HistoricalClaim, SourceType, SourceReliability } from '../../../types/research';
import { Plus, Search, Trash2, ExternalLink, BookOpen, FileText, Layers } from 'lucide-react';

interface SourcesPanelProps {
  sources: ResearchSource[];
  claims: HistoricalClaim[];
  onAddSource: (source: Omit<ResearchSource, 'id' | 'dateAdded'>) => void;
  onDeleteSource: (sourceId: string) => void;
  isAdding: boolean;
  setIsAdding: (val: boolean) => void;
}

const typeConfig: Record<SourceType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  primary: { label: 'Primary', icon: BookOpen, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  secondary: { label: 'Secondary', icon: FileText, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  tertiary: { label: 'Tertiary', icon: Layers, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

const reliabilityConfig: Record<SourceReliability, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low: { label: 'Low', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  unverified: { label: 'Unverified', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

export default function SourcesPanel({
  sources,
  claims,
  onAddSource,
  onDeleteSource,
  isAdding,
  setIsAdding,
}: SourcesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SourceType | null>(null);
  const [reliabilityFilter, setReliabilityFilter] = useState<SourceReliability | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formType, setFormType] = useState<SourceType>('secondary');
  const [formReliability, setFormReliability] = useState<SourceReliability>('medium');
  const [formYear, setFormYear] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filteredSources = sources.filter((source) => {
    const matchesSearch =
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || source.type === typeFilter;
    const matchesReliability = !reliabilityFilter || source.reliability === reliabilityFilter;
    return matchesSearch && matchesType && matchesReliability;
  });

  const startAdding = () => {
    setFormTitle('');
    setFormAuthor('');
    setFormType('secondary');
    setFormReliability('medium');
    setFormYear('');
    setFormUrl('');
    setFormNotes('');
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formTitle.trim() || !formAuthor.trim()) return;
    onAddSource({
      title: formTitle,
      author: formAuthor,
      type: formType,
      reliability: formReliability,
      year: formYear,
      url: formUrl,
      notes: formNotes,
    });
    setIsAdding(false);
  };

  const handleDelete = (sourceId: string) => {
    if (deleteConfirm === sourceId) {
      onDeleteSource(sourceId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(sourceId);
    }
  };

  const getAssociatedClaims = (sourceId: string) => {
    return claims.filter((c) => c.sourceIds.includes(sourceId));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search sources..."
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
          Add Source
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Type:</span>
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              !typeFilter
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
            }`}
          >
            All
          </button>
          {(Object.keys(typeConfig) as SourceType[]).map((type) => {
            const config = typeConfig[type];
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  typeFilter === type
                    ? config.color
                    : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Reliability:</span>
          <button
            onClick={() => setReliabilityFilter(null)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              !reliabilityFilter
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
            }`}
          >
            All
          </button>
          {(Object.keys(reliabilityConfig) as SourceReliability[]).map((rel) => {
            const config = reliabilityConfig[rel];
            return (
              <button
                key={rel}
                onClick={() => setReliabilityFilter(reliabilityFilter === rel ? null : rel)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  reliabilityFilter === rel
                    ? config.color
                    : 'bg-[#1a1b2e] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Source Form */}
      {isAdding && (
        <div className="bg-[#1a1b2e] border border-indigo-500/30 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">Add New Source</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Source title..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
              <input
                type="text"
                placeholder="Author..."
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Year..."
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
              <input
                type="url"
                placeholder="URL (optional)..."
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
              <div className="flex items-center gap-2">
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as SourceType)}
                  className="flex-1 px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="tertiary">Tertiary</option>
                </select>
              </div>
            </div>
            {/* Reliability */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Reliability</label>
              <div className="flex items-center gap-2 flex-wrap">
                {(Object.keys(reliabilityConfig) as SourceReliability[]).map((rel) => {
                  const config = reliabilityConfig[rel];
                  return (
                    <button
                      key={rel}
                      onClick={() => setFormReliability(rel)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        formReliability === rel
                          ? config.color
                          : 'bg-[#12132a] text-gray-400 border-[#2a2b3d] hover:border-gray-500'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <textarea
              placeholder="Notes about this source..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={!formTitle.trim() || !formAuthor.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add Source
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sources List */}
      <div className="space-y-3">
        {filteredSources.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
            <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {searchQuery || typeFilter || reliabilityFilter
                ? 'No sources match your filters.'
                : 'No sources added yet.'}
            </p>
          </div>
        ) : (
          filteredSources.map((source) => {
            const typeConf = typeConfig[source.type];
            const relConf = reliabilityConfig[source.reliability];
            const TypeIcon = typeConf.icon;
            const associatedClaims = getAssociatedClaims(source.id);

            return (
              <div
                key={source.id}
                className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4 hover:border-[#3a3b5d] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${typeConf.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        {typeConf.label}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${relConf.color}`}>
                        {relConf.label}
                      </span>
                      {source.year && (
                        <span className="text-[10px] text-gray-600">{source.year}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-200">{source.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">by {source.author}</p>
                    {source.notes && (
                      <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-2">
                        {source.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View source
                        </a>
                      )}
                      {associatedClaims.length > 0 && (
                        <span className="text-[10px] text-gray-600">
                          Used in {associatedClaims.length} claim{associatedClaims.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600 ml-auto">
                        Added {formatDate(source.dateAdded)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                      deleteConfirm === source.id
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-gray-500 hover:text-red-400 hover:bg-[#22234a]'
                    }`}
                    title={deleteConfirm === source.id ? 'Click again to confirm' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
