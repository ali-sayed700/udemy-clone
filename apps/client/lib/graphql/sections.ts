export const CREATE_SECTION_MUTATION = `
  mutation createSection($courseId: ID!, $input: CreateSectionInput!) {
    createSection(courseId: $courseId, input: $input) {
      _id
      title
      order
      lectures {
        _id
        title
        videoUrl
        duration
        freePreview
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SECTION_MUTATION = `
  mutation updateSection($input: UpdateSectionInput!) {
    updateSection(input: $input) {
      _id
      title
      order
      lectures {
        _id
        title
        videoUrl
        duration
        freePreview
        createdAt
      }
    }
  }
`;

export const REMOVE_SECTION_MUTATION = `
  mutation removeSection($id: ID!, $courseId: ID!) {
    removeSection(id: $id, courseId: $courseId) {
      _id
      title
    }
  }
`;

export const ADD_LECTURE_TO_SECTION_MUTATION = `
  mutation addLectureToSection($sectionId: ID!, $lectureId: ID!) {
    addLectureToSection(sectionId: $sectionId, lectureId: $lectureId) {
      _id
      title
      order
      lectures {
        _id
        title
        videoUrl
        duration
        freePreview
        createdAt
      }
    }
  }
`;

export const REMOVE_LECTURE_FROM_SECTION_MUTATION = `
  mutation removeLectureFromSection($sectionId: ID!, $lectureId: ID!) {
    removeLectureFromSection(sectionId: $sectionId, lectureId: $lectureId) {
      _id
      title
      order
      lectures {
        _id
        title
        videoUrl
        duration
        freePreview
        createdAt
      }
    }
  }
`;

export const REORDER_SECTIONS_MUTATION = `
  mutation reorderSections($courseId: ID!, $sectionIds: [ID!]!) {
    reorderSections(courseId: $courseId, sectionIds: $sectionIds) {
      _id
      title
      order
      lectures {
        _id
        title
        videoUrl
        duration
        freePreview
      }
    }
  }
`;

export const REORDER_LECTURES_MUTATION = `
  mutation reorderLectures($sectionId: ID!, $lectureIds: [ID!]!) {
    reorderLectures(sectionId: $sectionId, lectureIds: $lectureIds) {
      _id
      title
      order
      lectures {
        _id
        title
        videoUrl
        duration
        freePreview
      }
    }
  }
`;
