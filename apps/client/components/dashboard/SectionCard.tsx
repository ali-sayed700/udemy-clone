"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileVideo,
  Clock,
  Eye,
  Lock,
  Trash2,
  Pencil,
  Check,
  X,
  GripVertical,
  Plus,
} from "lucide-react";
import type { Section, Lecture } from "@/types/course.types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface SectionCardProps {
  section: Section;
  sectionIndex: number;
  onDeleteSection: (sectionId: string) => void;
  onUpdateSection: (sectionId: string, title: string) => void;
  onAddLecture: (sectionId: string) => void;
  onDeleteLecture?: (sectionId: string, lectureId: string) => void;
  isDeleting?: boolean;
  isDragOverlay?: boolean;
}

// ---- Sortable Lecture Item ----

function SortableLectureItem({
  lecture,
  index,
  sectionId,
  onDeleteLecture,
}: {
  lecture: Lecture;
  index: number;
  sectionId: string;
  onDeleteLecture?: (sectionId: string, lectureId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lecture._id || `lecture-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors group"
    >
      <button
        className="shrink-0 cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950/40 rounded-md flex items-center justify-center shrink-0">
        <FileVideo className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
          {index + 1}. {lecture.title}
        </p>
        {lecture.duration && (
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {lecture.duration}
          </p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {lecture.freePreview ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
            <Eye className="w-3 h-3" /> Free
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <Lock className="w-3 h-3" /> Locked
          </span>
        )}
        {onDeleteLecture && lecture._id && (
          <button
            onClick={() => onDeleteLecture(sectionId, lecture._id!)}
            className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-300 dark:text-slate-550 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Section Card ----

export default function SectionCard({
  section,
  sectionIndex,
  onDeleteSection,
  onUpdateSection,
  onAddLecture,
  onDeleteLecture,
  isDeleting,
  isDragOverlay,
}: SectionCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section._id || `section-${sectionIndex}`,
    disabled: isDragOverlay,
  });

  const style = isDragOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  const handleSaveTitle = () => {
    if (editTitle.trim() && section._id) {
      onUpdateSection(section._id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const lectureIds = section.lectures?.map(
    (l, i) => l._id || `lecture-${i}`,
  ) || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-50 dark:bg-slate-950 rounded-xl border transition-all ${
        isDragOverlay
          ? "border-indigo-300 dark:border-indigo-800 shadow-xl ring-2 ring-indigo-200 dark:ring-indigo-950"
          : isDeleting
            ? "border-red-200 dark:border-red-900/50 opacity-50"
            : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          className="shrink-0 cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-650 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          )}
        </button>

        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setEditTitle(section.title);
                  setIsEditing(false);
                }
              }}
              className="flex-1 px-2 py-1 rounded-md border border-indigo-300 dark:border-indigo-700 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-800"
              autoFocus
            />
            <button
              onClick={handleSaveTitle}
              className="p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditTitle(section.title);
                setIsEditing(false);
              }}
              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              Section {sectionIndex + 1}: {section.title}
            </h4>
            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
              ({section.lectures?.length || 0}{" "}
              {(section.lectures?.length || 0) === 1 ? "lecture" : "lectures"})
            </span>
          </div>
        )}

        {!isEditing && (
          <div className="shrink-0 flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => section._id && onDeleteSection(section._id)}
              disabled={isDeleting}
              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Section Content (Lectures) */}
      {!isCollapsed && (
        <div className="px-4 pb-3 space-y-1.5">
          {section.lectures && section.lectures.length > 0 ? (
            <SortableContext
              items={lectureIds}
              strategy={verticalListSortingStrategy}
            >
              {section.lectures.map((lecture, index) => (
                <SortableLectureItem
                  key={lecture._id || index}
                  lecture={lecture}
                  index={index}
                  sectionId={section._id || ""}
                  onDeleteLecture={onDeleteLecture}
                />
              ))}
            </SortableContext>
          ) : (
            <div className="text-center py-4 text-xs text-slate-400">
              No lectures in this section yet
            </div>
          )}

          {/* Add Lecture Button */}
          <button
            onClick={() => section._id && onAddLecture(section._id)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Lecture to this Section
          </button>
        </div>
      )}
    </div>
  );
}
