"use server";

import { authFetchGraphQL } from "@/lib/api/fetchGraphqlServer";
import {
  CREATE_SECTION_MUTATION,
  UPDATE_SECTION_MUTATION,
  REMOVE_SECTION_MUTATION,
  ADD_LECTURE_TO_SECTION_MUTATION,
  REMOVE_LECTURE_FROM_SECTION_MUTATION,
  REORDER_SECTIONS_MUTATION,
  REORDER_LECTURES_MUTATION,
} from "@/lib/graphql/sections";

export async function createSectionAction(data: {
  courseId: string;
  title: string;
  order?: number;
}) {
  const result = await authFetchGraphQL(CREATE_SECTION_MUTATION, {
    courseId: data.courseId,
    input: {
      title: data.title,
      order: data.order ?? 0,
    },
  });
  return result.createSection;
}

export async function updateSectionAction(data: {
  id: string;
  title?: string;
  order?: number;
}) {
  const result = await authFetchGraphQL(UPDATE_SECTION_MUTATION, {
    input: data,
  });
  return result.updateSection;
}

export async function removeSectionAction(id: string, courseId: string) {
  const result = await authFetchGraphQL(REMOVE_SECTION_MUTATION, {
    id,
    courseId,
  });
  return result.removeSection;
}

export async function addLectureToSectionAction(
  sectionId: string,
  lectureId: string,
) {
  const result = await authFetchGraphQL(ADD_LECTURE_TO_SECTION_MUTATION, {
    sectionId,
    lectureId,
  });

  return result.addLectureToSection;
}

export async function removeLectureFromSectionAction(
  sectionId: string,
  lectureId: string,
) {
  const result = await authFetchGraphQL(REMOVE_LECTURE_FROM_SECTION_MUTATION, {
    sectionId,
    lectureId,
  });
  return result.removeLectureFromSection;
}

export async function reorderSectionsAction(
  courseId: string,
  sectionIds: string[],
) {
  const result = await authFetchGraphQL(REORDER_SECTIONS_MUTATION, {
    courseId,
    sectionIds,
  });
  return result.reorderSections;
}

export async function reorderLecturesAction(
  sectionId: string,
  lectureIds: string[],
) {
  const result = await authFetchGraphQL(REORDER_LECTURES_MUTATION, {
    sectionId,
    lectureIds,
  });
  return result.reorderLectures;
}
