import { useState } from 'react';
import { ProductionLocation } from '../../../types/production';
import { Plus, Search, Pencil, Trash2, MapPin, Image as ImageIcon } from 'lucide-react';

interface LocationLibraryProps {
  locations: ProductionLocation[];
  onAddLocation: (location: Omit<ProductionLocation, 'id' | 'dateCreated' | 'dateModified'>) => void;
  onUpdateLocation: (location: ProductionLocation) => void;
  onDeleteLocation: (locationId: string) => void;
}

export default function LocationLibrary({
  locations,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
}: LocationLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<ProductionLocation | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHistoricalContext, setFormHistoricalContext] = useState('');
  const [formEra, setFormEra] = useState('');
  const [formVisualDescription, setFormVisualDescription] = useState('');
  const [formArchitecture, setFormArchitecture] = useState('');
  const [formAtmosphere, setFormAtmosphere] = useState('');
  const [formContinuityNotes, setFormContinuityNotes] = useState('');

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.historicalContext.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const startAdding = () => {
    setFormName('');
    setFormDescription('');
    setFormHistoricalContext('');
    setFormEra('');
    setFormVisualDescription('');
    setFormArchitecture('');
    setFormAtmosphere('');
    setFormContinuityNotes('');
    setIsAdding(true);
    setSelectedLocation(null);
  };

  const startEditing = (location: ProductionLocation) => {
    setFormName(location.name);
    setFormDescription(location.description);
    setFormHistoricalContext(location.historicalContext);
    setFormEra(location.era);
    setFormVisualDescription(location.visualDescription);
    setFormArchitecture(location.architecture);
    setFormAtmosphere(location.atmosphere);
    setFormContinuityNotes(location.continuityNotes);
    setSelectedLocation(location);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setSelectedLocation(null);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (selectedLocation) {
      onUpdateLocation({
        ...selectedLocation,
        name: formName,
        description: formDescription,
        historicalContext: formHistoricalContext,
        era: formEra,
        visualDescription: formVisualDescription,
        architecture: formArchitecture,
        atmosphere: formAtmosphere,
        continuityNotes: formContinuityNotes,
      });
    } else {
      onAddLocation({
        name: formName,
        description: formDescription,
        historicalContext: formHistoricalContext,
        era: formEra,
        visualDescription: formVisualDescription,
        architecture: formArchitecture,
        atmosphere: formAtmosphere,
        continuityNotes: formContinuityNotes,
        referenceImages: [],
      });
    }
    cancelForm();
  };

  const handleDelete = (locationId: string) => {
    if (deleteConfirm === locationId) {
      onDeleteLocation(locationId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(locationId);
    }
  };

  const isFormOpen = isAdding || selectedLocation !== null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>
        <button
          onClick={startAdding}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          aria-label="Add new location"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="bg-[#1a1b2e] border border-indigo-500/30 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">
            {selectedLocation ? 'Edit Location' : 'New Location'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Location name..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              aria-label="Location name"
            />
            <input
              type="text"
              placeholder="Era..."
              value={formEra}
              onChange={(e) => setFormEra(e.target.value)}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              aria-label="Era"
            />
          </div>
          <textarea
            placeholder="Description..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={2}
            className="w-full mt-3 px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
            aria-label="Description"
          />
          <textarea
            placeholder="Historical context..."
            value={formHistoricalContext}
            onChange={(e) => setFormHistoricalContext(e.target.value)}
            rows={2}
            className="w-full mt-3 px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
            aria-label="Historical context"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <textarea
              placeholder="Visual description..."
              value={formVisualDescription}
              onChange={(e) => setFormVisualDescription(e.target.value)}
              rows={2}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
              aria-label="Visual description"
            />
            <textarea
              placeholder="Architecture..."
              value={formArchitecture}
              onChange={(e) => setFormArchitecture(e.target.value)}
              rows={2}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
              aria-label="Architecture"
            />
            <textarea
              placeholder="Atmosphere..."
              value={formAtmosphere}
              onChange={(e) => setFormAtmosphere(e.target.value)}
              rows={2}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
              aria-label="Atmosphere"
            />
            <textarea
              placeholder="Continuity notes..."
              value={formContinuityNotes}
              onChange={(e) => setFormContinuityNotes(e.target.value)}
              rows={2}
              className="px-3 py-2 bg-[#12132a] border border-[#2a2b3d] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-y"
              aria-label="Continuity notes"
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={!formName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {selectedLocation ? 'Save Changes' : 'Add Location'}
            </button>
            <button
              onClick={cancelForm}
              className="px-4 py-2 bg-[#22234a] hover:bg-[#2a2b3d] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2b3d] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Location Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
            <MapPin className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {searchQuery ? 'No locations match your search.' : 'No locations yet.'}
            </p>
            {!searchQuery && !isFormOpen && (
              <button onClick={startAdding} className="mt-3 text-sm text-indigo-400 hover:text-indigo-300">
                Add your first location →
              </button>
            )}
          </div>
        ) : (
          filteredLocations.map((location) => (
            <div
              key={location.id}
              className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4 hover:border-[#3a3b5d] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-gray-200 flex-1">{location.name}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{location.description}</p>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500">
                <span>{location.era}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {location.referenceImages.length} refs
                </span>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[#2a2b3d]">
                <button
                  onClick={() => startEditing(location)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-indigo-400 rounded-lg hover:bg-[#22234a] transition-colors"
                  aria-label={`Edit ${location.name}`}
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    deleteConfirm === location.id
                      ? 'text-red-400 bg-red-500/10'
                      : 'text-gray-400 hover:text-red-400 hover:bg-[#22234a]'
                  }`}
                  aria-label={deleteConfirm === location.id ? `Confirm delete ${location.name}` : `Delete ${location.name}`}
                >
                  <Trash2 className="w-3 h-3" />
                  {deleteConfirm === location.id ? 'Confirm' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
