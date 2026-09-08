import { useMemo } from 'react';
import { ScriptData, Scene, SceneStatus } from '../../../types/script';
import { ResearchData } from '../../../types/research';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Link2,
  ChevronDown,
  ChevronRight,
  PenTool,
} from 'lucide-react';
import { useState } from 'react';

interface ScriptOutlineProps {
  data: ScriptData;
  researchData: ResearchData | null;
  onAddChapter: () => void;
  onEditChapter: (chapter: ScriptData['chapters'][0]) => void;
  onDeleteChapter: (chapterId: string) => void;
  onReorderChapters: (activeId: string, overId: string) => void;
  onAddScene: (chapterId: string) => void;
  onEditScene: (scene: Scene) => void;
  onDeleteScene: (sceneId: string) => void;
  onReorderScenes: (chapterId: string, activeId: string, overId: string) => void;
  searchQuery: string;
  statusFilter: SceneStatus | null;
}

const statusConfig: Record<SceneStatus, { label: string; color: string; dot: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', dot: 'bg-gray-500' },
  review: { label: 'Review', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-500' },
  approved: { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500' },
};

function SortableChapter({
  chapter,
  scenes,
  researchData,
  onEdit,
  onDelete,
  onAddScene,
  onEditScene,
  onDeleteScene,
  onReorderScenes,
  searchQuery,
  statusFilter,
}: {
  chapter: ScriptData['chapters'][0];
  scenes: Scene[];
  researchData: ResearchData | null;
  onEdit: () => void;
  onDelete: () => void;
  onAddScene: () => void;
  onEditScene: (scene: Scene) => void;
  onDeleteScene: (sceneId: string) => void;
  onReorderScenes: (activeId: string, overId: string) => void;
  searchQuery: string;
  statusFilter: SceneStatus | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const filteredScenes = useMemo(() => {
    return scenes.filter((scene) => {
      const matchesSearch =
        !searchQuery ||
        scene.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scene.narration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scene.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || scene.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [scenes, searchQuery, statusFilter]);

  const totalDuration = scenes.reduce((sum, s) => sum + s.estimatedDuration, 0);
  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m` : `${s}s`;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && event.active.id !== event.over.id) {
      onReorderScenes(String(event.active.id), String(event.over.id));
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-6">
      {/* Chapter Header */}
      <div className="flex items-center gap-3 mb-3 group">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder act"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{chapter.title}</h3>
          {chapter.description && (
            <p className="text-xs text-gray-500 truncate">{chapter.description}</p>
          )}
        </div>
        <span className="text-xs text-gray-500 shrink-0">
          {scenes.length} scene{scenes.length !== 1 ? 's' : ''} · {formatDuration(totalDuration)}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onAddScene}
            className="p-1.5 text-gray-500 hover:text-indigo-400 rounded-lg hover:bg-[#22234a] transition-colors"
            title="Add scene"
            aria-label="Add scene to this act"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-500 hover:text-indigo-400 rounded-lg hover:bg-[#22234a] transition-colors"
            title="Edit act"
            aria-label="Edit this act"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (deleteConfirm) {
                onDelete();
                setDeleteConfirm(false);
              } else {
                setDeleteConfirm(true);
                setTimeout(() => setDeleteConfirm(false), 3000);
              }
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              deleteConfirm
                ? 'text-red-400 bg-red-500/10'
                : 'text-gray-500 hover:text-red-400 hover:bg-[#22234a]'
            }`}
            title={deleteConfirm ? 'Click again to confirm' : 'Delete act'}
            aria-label={deleteConfirm ? 'Confirm delete act' : 'Delete act'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scenes */}
      {!collapsed && (
        <DndContext
          sensors={useSensors(
            useSensor(PointerSensor),
            useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
          )}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredScenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="ml-8 space-y-2">
              {filteredScenes.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#2a2b3d] rounded-lg">
                  <p className="text-xs text-gray-600">
                    {searchQuery || statusFilter ? 'No scenes match filters.' : 'No scenes yet.'}
                  </p>
                  {!searchQuery && !statusFilter && (
                    <button
                      onClick={onAddScene}
                      className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      + Add first scene
                    </button>
                  )}
                </div>
              ) : (
                filteredScenes.map((scene) => (
                  <SortableScene
                    key={scene.id}
                    scene={scene}
                    researchData={researchData}
                    onEdit={() => onEditScene(scene)}
                    onDelete={() => onDeleteScene(scene.id)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableScene({
  scene,
  researchData,
  onEdit,
  onDelete,
}: {
  scene: Scene;
  researchData: ResearchData | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: scene.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const status = statusConfig[scene.status];

  // Check for unsupported claims
  const unsupportedClaims = useMemo(() => {
    if (!researchData || scene.linkedClaimIds.length === 0) return 0;
    return scene.linkedClaimIds.filter((claimId) => {
      const claim = researchData.claims.find((c) => c.id === claimId);
      return claim && claim.sourceIds.length === 0;
    }).length;
  }, [scene.linkedClaimIds, researchData]);

  const linkedClaims = useMemo(() => {
    if (!researchData) return [];
    return scene.linkedClaimIds
      .map((id) => researchData.claims.find((c) => c.id === id))
      .filter(Boolean);
  }, [scene.linkedClaimIds, researchData]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-lg p-3 hover:border-[#3a3b5d] transition-colors group"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing mt-0.5"
          aria-label="Drag to reorder scene"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded border ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
              {status.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-gray-500">
              <Clock className="w-3 h-3" />
              {formatDuration(scene.estimatedDuration)}
            </span>
            {scene.location && (
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <MapPin className="w-3 h-3" />
                {scene.location}
              </span>
            )}
            {scene.timePeriod && (
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <Calendar className="w-3 h-3" />
                {scene.timePeriod}
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium text-gray-200">{scene.title}</h4>
          {scene.narration && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">
              "{scene.narration}"
            </p>
          )}
          {/* Linked Claims */}
          {linkedClaims.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <Link2 className="w-3 h-3 text-indigo-400" />
              {linkedClaims.map((claim) => (
                <span
                  key={claim!.id}
                  className="px-1.5 py-0.5 text-[10px] bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20"
                  title={claim!.title}
                >
                  {claim!.title.slice(0, 40)}{claim!.title.length > 40 ? '...' : ''}
                </span>
              ))}
              {unsupportedClaims > 0 && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-amber-500/10 text-amber-400 rounded border border-amber-500/20" title="Some linked claims have no supporting sources">
                  <AlertTriangle className="w-3 h-3" />
                  {unsupportedClaims} unsupported
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-500 hover:text-indigo-400 rounded-lg hover:bg-[#22234a] transition-colors"
            title="Edit scene"
            aria-label={`Edit scene: ${scene.title}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (deleteConfirm) {
                onDelete();
              } else {
                setDeleteConfirm(true);
                setTimeout(() => setDeleteConfirm(false), 3000);
              }
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              deleteConfirm
                ? 'text-red-400 bg-red-500/10'
                : 'text-gray-500 hover:text-red-400 hover:bg-[#22234a]'
            }`}
            title={deleteConfirm ? 'Click again to confirm' : 'Delete scene'}
            aria-label={deleteConfirm ? `Confirm delete: ${scene.title}` : `Delete scene: ${scene.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScriptOutline({
  data,
  researchData,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onReorderChapters,
  onAddScene,
  onEditScene,
  onDeleteScene,
  onReorderScenes,
  searchQuery,
  statusFilter,
}: ScriptOutlineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleChapterDragEnd = (event: DragEndEvent) => {
    if (event.over && event.active.id !== event.over.id) {
      onReorderChapters(String(event.active.id), String(event.over.id));
    }
  };

  const sortedChapters = [...data.chapters].sort((a, b) => a.order - b.order);

  return (
    <div>
      {sortedChapters.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#22234a] flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No acts yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            Start building your documentary script by creating acts and scenes.
          </p>
          <button
            onClick={onAddChapter}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create First Act
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleChapterDragEnd}
        >
          <SortableContext items={sortedChapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {sortedChapters.map((chapter) => {
              const scenes = data.scenes
                .filter((s) => s.chapterId === chapter.id)
                .sort((a, b) => a.order - b.order);
              return (
                <SortableChapter
                  key={chapter.id}
                  chapter={chapter}
                  scenes={scenes}
                  researchData={researchData}
                  onEdit={() => onEditChapter(chapter)}
                  onDelete={() => onDeleteChapter(chapter.id)}
                  onAddScene={() => onAddScene(chapter.id)}
                  onEditScene={onEditScene}
                  onDeleteScene={onDeleteScene}
                  onReorderScenes={(activeId, overId) => onReorderScenes(chapter.id, activeId, overId)}
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}


