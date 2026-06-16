"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSectionAction,
  updateSectionAction,
  removeSectionAction,
  addLectureToSectionAction,
  removeLectureFromSectionAction,
  reorderSectionsAction,
  reorderLecturesAction,
} from "./section.actions";

const INVALIDATE_KEY = "instructor-courses-by-id";

// ---- Create Section ----

interface CreateSectionVars {
  courseId: string;
  title: string;
  order?: number;
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-section"],
    mutationFn: async (vars: CreateSectionVars) => {
      return createSectionAction(vars);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVALIDATE_KEY] });
    },
  });
}

// ---- Update Section ----

interface UpdateSectionVars {
  id: string;
  title?: string;
  order?: number;
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-section"],
    mutationFn: async (vars: UpdateSectionVars) => {
      return updateSectionAction(vars);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVALIDATE_KEY] });
    },
  });
}

// ---- Remove Section ----

interface RemoveSectionVars {
  id: string;
  courseId: string;
}

export function useRemoveSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["remove-section"],
    mutationFn: async (vars: RemoveSectionVars) => {
      return removeSectionAction(vars.id, vars.courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVALIDATE_KEY] });
    },
  });
}

// ---- Add Lecture to Section ----

interface AddLectureToSectionVars {
  sectionId: string;
  lectureId: string;
}

export function useAddLectureToSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["add-lecture-to-section"],
    mutationFn: async (vars: AddLectureToSectionVars) => {
      return addLectureToSectionAction(vars.sectionId, vars.lectureId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVALIDATE_KEY] });
    },
  });
}

// ---- Remove Lecture from Section ----

interface RemoveLectureFromSectionVars {
  sectionId: string;
  lectureId: string;
}

export function useRemoveLectureFromSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["remove-lecture-from-section"],
    mutationFn: async (vars: RemoveLectureFromSectionVars) => {
      return removeLectureFromSectionAction(vars.sectionId, vars.lectureId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVALIDATE_KEY] });
    },
  });
}

// ---- Reorder Sections ----

interface ReorderSectionsVars {
  courseId: string;
  sectionIds: string[];
}

export function useReorderSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["reorder-sections"],
    mutationFn: async (vars: ReorderSectionsVars) => {
      return reorderSectionsAction(vars.courseId, vars.sectionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVALIDATE_KEY] });
    },
  });
}

// ---- Reorder Lectures within Section ----

interface ReorderLecturesVars {
  sectionId: string;
  lectureIds: string[];
}

export function useReorderLectures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["reorder-lectures"],
    mutationFn: async (vars: ReorderLecturesVars) => {
      return reorderLecturesAction(vars.sectionId, vars.lectureIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVALIDATE_KEY] });
    },
  });
}
