"use client";

import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Loader2,
  Video,
  FileVideo,
  Clock,
  Check,
  Upload,
  AlertCircle,
  Trash2,
  Eye,
  Lock,
  FolderPlus,
  BookOpen,
  ListVideo,
  Layers3,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { useAddLecture } from "@/service/dashboard/courseCrud.service";
import {
  useCreateSection,
  useUpdateSection,
  useRemoveSection,
  useAddLectureToSection,
  useRemoveLectureFromSection,
  useReorderSections,
  useReorderLectures,
} from "@/service/dashboard/section.service";
import type { Course, Lecture, Section } from "@/types/course.types";
import SectionCard from "./SectionCard";

interface ManageLecturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

interface LectureForm {
  uploadItemId: string;
  videoUrl: string;
  fileName: string;
  title: string;
  description: string;
  duration: string;
  freePreview: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getInitialLectureTitle(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ManageLecturesModal({
  isOpen,
  onClose,
  course,
}: ManageLecturesModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [lectureForms, setLectureForms] = useState<LectureForm[]>([]);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [activeSectionForUpload, setActiveSectionForUpload] = useState<
    string | null
  >(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(
    null,
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [createdLectureIds, setCreatedLectureIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const videoUpload = useVideoUpload();
  const addLectureMutation = useAddLecture();
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const removeSectionMutation = useRemoveSection();
  const addLectureToSectionMutation = useAddLectureToSection();
  const removeLectureFromSectionMutation = useRemoveLectureFromSection();
  const reorderSectionsMutation = useReorderSections();
  const reorderLecturesMutation = useReorderLectures();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const sections: Section[] = (course.sections || [])
    .slice()
    .sort((a, b) => a.order - b.order);

  const sectionedLectureIds = new Set(
    sections.flatMap(
      (section) =>
        section.lectures?.map((lecture) => lecture._id).filter(Boolean) || [],
    ),
  );

  const unsectionedLectures: Lecture[] = (course.lectures || []).filter(
    (lecture) => lecture._id && !sectionedLectureIds.has(lecture._id),
  );

  const allLectureIds = Array.from(
    new Set([
      ...(course.lectures || []).map((lecture) => lecture._id).filter(Boolean),
      ...sections.flatMap(
        (section) =>
          section.lectures?.map((lecture) => lecture._id).filter(Boolean) || [],
      ),
    ] as string[]),
  );

  const totalLectures = new Set([...allLectureIds, ...createdLectureIds]).size;
  const selectedSection = activeSectionForUpload
    ? sections.find((section) => section._id === activeSectionForUpload)
    : null;

  const sectionSortableIds = sections
    .map((section) => section._id)
    .filter(Boolean) as string[];

  const activeDragSection = activeDragId
    ? sections.find((section) => section._id === activeDragId)
    : null;

  useEffect(() => {
    setCreatedLectureIds([]);
  }, [course._id]);

  const resetForm = () => {
    setShowAddForm(false);
    setLectureForms([]);
    setActiveSectionForUpload(null);
    setFormError(null);
    videoUpload.reset();
  };

  const startStandaloneUpload = () => {
    setActiveSectionForUpload(null);
    setFormError(null);
    setShowAddForm(true);
  };

  const handleAddLectureToSection = (sectionId: string) => {
    setActiveSectionForUpload(sectionId);
    setFormError(null);
    setShowAddForm(true);
  };

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim() || !course._id) return;

    setFormError(null);
    setIsAddingSection(true);
    try {
      await createSectionMutation.mutateAsync({
        courseId: course._id,
        title: newSectionTitle.trim(),
      });
      toast.success(`Section "${newSectionTitle.trim()}" created`);
      setNewSectionTitle("");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create section");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsAddingSection(false);
    }
  };

  const handleUpdateSection = async (sectionId: string, title: string) => {
    setFormError(null);
    try {
      await updateSectionMutation.mutateAsync({ id: sectionId, title });
      toast.success("Section updated");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to update section");
      setFormError(message);
      toast.error(message);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!course._id) return;

    setFormError(null);
    setDeletingSectionId(sectionId);
    try {
      await removeSectionMutation.mutateAsync({
        id: sectionId,
        courseId: course._id,
      });
      toast.success("Section deleted");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to delete section");
      setFormError(message);
      toast.error(message);
    } finally {
      setDeletingSectionId(null);
    }
  };

  const handleRemoveLectureFromSection = async (
    sectionId: string,
    lectureId: string,
  ) => {
    setFormError(null);
    try {
      await removeLectureFromSectionMutation.mutateAsync({
        sectionId,
        lectureId,
      });
      toast.success("Lecture removed from section");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to remove lecture");
      setFormError(message);
      toast.error(message);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      videoUpload.addFiles(files);
    }
    e.target.value = "";
  };

  const handleUploadAll = async () => {
    setFormError(null);
    await videoUpload.uploadAll();
  };

  useEffect(() => {
    const successItems = videoUpload.items.filter(
      (item) => item.status === "success" && item.url,
    );

    setLectureForms((prev) =>
      prev.map((form) => {
        const matchingItem = successItems.find(
          (item) => item.id === form.uploadItemId,
        );

        if (!matchingItem) return form;

        return {
          ...form,
          duration: matchingItem.durationLabel || form.duration,
          error: matchingItem.durationError || form.error,
        };
      }),
    );

    const existingIds = new Set(lectureForms.map((form) => form.uploadItemId));
    const newForms: LectureForm[] = successItems
      .filter((item) => !existingIds.has(item.id))
      .map((item) => ({
        uploadItemId: item.id,
        videoUrl: item.url!,
        fileName: item.file.name,
        title: getInitialLectureTitle(item.file.name),
        description: "",
        duration: item.durationLabel || "",
        freePreview: false,
        error: item.durationError,
      }));

    if (newForms.length > 0) {
      setLectureForms((prev) => [...prev, ...newForms]);
      toast.success(
        `${newForms.length} video${newForms.length > 1 ? "s" : ""} uploaded`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUpload.items]);

  const updateLectureForm = (
    index: number,
    field: keyof LectureForm,
    value: string,
  ) => {
    setLectureForms((prev) =>
      prev.map((form, i) => (i === index ? { ...form, [field]: value } : form)),
    );
  };

  const handleSaveLecture = async (index: number) => {
    const form = lectureForms[index];
    if (!course._id) return;

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle || !form.duration || !form.videoUrl) {
      const message =
        "Lecture needs a title, uploaded video, and detected duration before saving.";
      setLectureForms((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, error: message } : item,
        ),
      );
      toast.error(message);
      return;
    }

    setFormError(null);
    setSavingIndex(index);
    try {
      const existingLectureIds = Array.from(
        new Set([...allLectureIds, ...createdLectureIds]),
      );

      const lecture = await addLectureMutation.mutateAsync({
        courseId: course._id,
        existingLectureIds,
        title: trimmedTitle,
        description: form.description.trim() || trimmedTitle,
        duration: form.duration,
        videoUrl: form.videoUrl,
        freePreview: form.freePreview,
      });

      if (!lecture?._id) {
        throw new Error("Lecture was created without an ID.");
      }

      if (activeSectionForUpload) {
        await addLectureToSectionMutation.mutateAsync({
          sectionId: activeSectionForUpload,
          lectureId: lecture._id,
        });
      }

      setCreatedLectureIds((prev) => Array.from(new Set([...prev, lecture._id])));
      toast.success(`Lecture "${trimmedTitle}" added`);
      setLectureForms((prev) => prev.filter((_, i) => i !== index));
      videoUpload.removeFile(form.uploadItemId);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to add lecture");
      setFormError(message);
      setLectureForms((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, error: message } : item,
        ),
      );
      toast.error(message);
    } finally {
      setSavingIndex(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !course._id) return;

    const sectionIds = sections
      .map((section) => section._id)
      .filter(Boolean) as string[];
    const isSection =
      sectionIds.includes(active.id as string) &&
      sectionIds.includes(over.id as string);

    if (isSection) {
      const oldIndex = sectionIds.indexOf(active.id as string);
      const newIndex = sectionIds.indexOf(over.id as string);
      reorderSectionsMutation.mutate({
        courseId: course._id,
        sectionIds: arrayMove(sectionIds, oldIndex, newIndex),
      });
      return;
    }

    for (const section of sections) {
      const lectureIds = (section.lectures || [])
        .map((lecture) => lecture._id)
        .filter(Boolean) as string[];

      if (
        lectureIds.includes(active.id as string) &&
        lectureIds.includes(over.id as string) &&
        section._id
      ) {
        const oldIndex = lectureIds.indexOf(active.id as string);
        const newIndex = lectureIds.indexOf(over.id as string);
        reorderLecturesMutation.mutate({
          sectionId: section._id,
          lectureIds: arrayMove(lectureIds, oldIndex, newIndex),
        });
        return;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative mx-4 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Curriculum
              </h2>
            </div>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{course.title}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Layers3 className="h-3.5 w-3.5" />
              {sections.length} sections
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <ListVideo className="h-3.5 w-3.5" />
              {totalLectures} lectures
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {formError && (
          <div className="mx-6 mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <section className="min-h-0 overflow-y-auto border-b border-slate-100 dark:border-slate-800 px-6 py-5 lg:border-b-0 lg:border-r lg:border-slate-100 lg:dark:border-slate-800">
            <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Sections
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={startStandaloneUpload}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 ring-1 ring-slate-200 dark:ring-slate-700 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Standalone
                </button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateSection()}
                  placeholder="Section title"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800"
                />
                <button
                  type="button"
                  onClick={handleCreateSection}
                  disabled={!newSectionTitle.trim() || isAddingSection}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                >
                  {isAddingSection ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FolderPlus className="h-4 w-4" />
                  )}
                  Add
                </button>
              </div>
            </div>

            {sections.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sectionSortableIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sections.map((section, index) => (
                      <SectionCard
                        key={section._id || index}
                        section={section}
                        sectionIndex={index}
                        onDeleteSection={handleDeleteSection}
                        onUpdateSection={handleUpdateSection}
                        onAddLecture={handleAddLectureToSection}
                        onDeleteLecture={handleRemoveLectureFromSection}
                        isDeleting={deletingSectionId === section._id}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeDragSection ? (
                    <SectionCard
                      section={activeDragSection}
                      sectionIndex={sections.indexOf(activeDragSection)}
                      onDeleteSection={() => {}}
                      onUpdateSection={() => {}}
                      onAddLecture={() => {}}
                      isDragOverlay
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 py-8 text-center">
                <Video className="mx-auto mb-3 h-6 w-6 text-slate-400 dark:text-slate-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No sections yet
                </p>
              </div>
            )}

            {unsectionedLectures.length > 0 && (
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Standalone lectures
                  </h3>
                  <button
                    type="button"
                    onClick={startStandaloneUpload}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>

                {unsectionedLectures.map((lecture, index) => (
                  <div
                    key={lecture._id || index}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <FileVideo className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                        {index + 1}. {lecture.title}
                      </p>
                      {lecture.duration && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <Clock className="h-3 w-3" />
                          {lecture.duration}
                        </p>
                      )}
                    </div>
                    {lecture.freePreview ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <Eye className="h-3 w-3" />
                        Free
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-850 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="min-h-0 overflow-y-auto bg-slate-50 dark:bg-slate-950 px-6 py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Add Lecture
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedSection ? selectedSection.title : "Standalone"}
                </p>
              </div>
              {showAddForm && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={videoUpload.isUploading}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {!showAddForm ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={startStandaloneUpload}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left transition-colors hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-800 text-white">
                    <Plus className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Add standalone lecture
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      Not assigned to a section
                    </span>
                  </span>
                </button>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Use a section button
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Each section has its own Add Lecture action.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-colors hover:border-slate-400 dark:hover:border-slate-700">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Video className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Select video files
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      Duration is detected automatically
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/msvideo,video/matroska,video/webm,video/VLC,video/mkv"
                    multiple
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                </label>

                {videoUpload.items.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-450">
                        Upload Queue
                      </p>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {videoUpload.items.length} file
                        {videoUpload.items.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {videoUpload.items.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-3 p-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              item.status === "success"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                                : item.status === "error"
                                  ? "bg-red-50 dark:bg-red-950/40 text-red-500"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {item.status === "success" ? (
                              <Check className="h-4 w-4" />
                            ) : item.status === "error" ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : item.status === "uploading" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileVideo className="h-4 w-4" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                              {item.file.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                              {item.durationLabel && ` | ${item.durationLabel}`}
                              {!item.durationLabel &&
                                !item.durationError &&
                                " | Reading duration"}
                              {item.status === "uploading" &&
                                ` | ${item.progress}%`}
                              {item.status === "success" && " | Uploaded"}
                              {item.status === "error" &&
                                ` | ${item.error || "Failed"}`}
                              {item.durationError &&
                                ` | ${item.durationError}`}
                            </p>
                          </div>
                          {(item.status === "idle" ||
                            item.status === "error") && (
                            <button
                              type="button"
                              onClick={() => videoUpload.removeFile(item.id)}
                              className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {(item.status === "uploading" ||
                          item.status === "success") && (
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
                            <div
                              className={`h-full transition-all duration-300 ${
                                item.status === "success"
                                  ? "bg-emerald-500"
                                  : "bg-slate-900 dark:bg-slate-600"
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {videoUpload.hasIdle && (
                      <button
                        type="button"
                        onClick={handleUploadAll}
                        disabled={videoUpload.isUploading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                      >
                        {videoUpload.isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Videos
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {lectureForms.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Lecture Details
                    </p>

                    {lectureForms.map((form, index) => (
                      <div
                        key={form.uploadItemId}
                        className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <FileVideo className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="min-w-0 flex-1 truncate text-xs text-slate-500 dark:text-slate-400">
                            {form.fileName}
                          </span>
                          {form.duration ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-350">
                              <Clock className="h-3 w-3" />
                              {form.duration}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Duration
                            </span>
                          )}
                        </div>

                        {form.error && (
                          <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{form.error}</span>
                          </div>
                        )}

                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) =>
                            updateLectureForm(index, "title", e.target.value)
                          }
                          placeholder="Lecture title"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800"
                        />

                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            updateLectureForm(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Description"
                          rows={2}
                          className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800"
                        />

                        <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-950 p-3">
                          <span className="flex items-center gap-2">
                            {form.freePreview ? (
                              <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            )}
                            <span>
                              <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                                {form.freePreview ? "Free Preview" : "Locked"}
                              </span>
                              <span className="block text-xs text-slate-500 dark:text-slate-400">
                                {form.freePreview ? "Public" : "Enrolled only"}
                              </span>
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setLectureForms((prev) =>
                                prev.map((lectureForm, i) =>
                                  i === index
                                    ? {
                                        ...lectureForm,
                                        freePreview: !lectureForm.freePreview,
                                      }
                                    : lectureForm,
                                ),
                              )
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                              form.freePreview ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                                form.freePreview
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveLecture(index)}
                          disabled={
                            !form.title.trim() ||
                            !form.duration ||
                            savingIndex === index
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                        >
                          {savingIndex === index ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Add Lecture
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>

        <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 dark:bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
