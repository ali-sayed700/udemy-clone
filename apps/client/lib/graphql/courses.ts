import gql from "graphql-tag";

export const GET_Courses = `
  query getAllCourses($queryReq: QueryArgs!) {
    courses(queryReq: $queryReq) {
      _id
      title
      description
      price
      image
      categories
      level
      primaryLanguage
      instructor { _id userName }
      isPublished
      createdAt
      updatedAt
    }
  }
`;

export const GET_Course = `
query getOneCourse($id: ID!) {
  course(id:$id) {
  _id
    title
    description
    price
    image
    categories
    level
    primaryLanguage
    isPublished
    objectives
students{userName}
instructor{userName}
lectures{
_id
title
videoUrl
duration
freePreview
createdAt
}
sections{
_id
title
order
lectures{
_id
title
videoUrl
duration
freePreview
createdAt
}
}
    createdAt
    updatedAt
  }
}
`;

export const GET_Courses_By_Instructor = `
  query getCoursesByInstructor {
    coursesByInstructor {
      _id
      title
      description
      price
      image
      categories
      level
      primaryLanguage
      isPublished
      objectives
      welcomeMessage
      studentCount
      students { _id userName }
      lectures {
        _id
        title
        duration
        freePreview
      }
      sections {
        _id
        title
        order
        lectures {
          _id
          title
          duration
          freePreview
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_INSTRUCTOR_COURSES = `
  query getAllCourses {
    courses(queryReq: {}) {
      _id
      title
      description
      price
      image
      categories
      level
      primaryLanguage
      isPublished
      objectives
      welcomeMessage
      studentCount
      students { _id userName }
      lectures {
        _id
        title
        duration
        freePreview
      }
      sections {
        _id
        title
        order
        lectures {
          _id
          title
          duration
          freePreview
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_COURSE_MUTATION = gql`
  mutation createCourse($createCourseInput: CreateCourseInput!) {
    createCourse(createCourseInput: $createCourseInput) {
      _id
      title
    }
  }
`;

export const UPDATE_COURSE_MUTATION = `
  mutation updateCourse($updateCourseInput: UpdateCourseInput!) {
    updateCourse(updateCourseInput: $updateCourseInput) {
      _id
      title
    }
  }
`;

export const DELETE_COURSE_MUTATION = `
  mutation removeCourse($id: ID!) {
    removeCourse(id: $id) {
      _id
    }
  }
`;

export const CREATE_LECTURE_MUTATION = `
  mutation createLecture($createLectureInput: CreateLectureInput!) {
    createLecture(createLectureInput: $createLectureInput) {
      _id
      title
      videoUrl
      duration
      freePreview
    }
  }
`;
