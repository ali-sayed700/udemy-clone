export const All_Courses_Status = `query AllMyCoursesStatus {
        allMyCoursesStatus {
          courseId
          status
          percentage
          viewedCount
          completedCount
          totalLectures
        }
      }`;

export const MARK_LECTURE_VIEWED_MUTATION = `mutation MarkLectureViewed($courseId: ID!, $lectureId: ID!) {
        markLectureViewed(courseId: $courseId, lectureId: $lectureId) {
          _id
          viewed
          viewedDate
          completed
          completedDate
          lecture { _id title }
        }
      }`;

export const MARK_LECTURE_COMPLETED_MUTATION = `mutation MarkLectureCompleted($courseId: ID!, $lectureId: ID!) {
        markLectureCompleted(courseId: $courseId, lectureId: $lectureId) {
          _id
          viewed
          viewedDate
          completed
          completedDate
          lecture { _id title }
        }
      }`;

export const GET_MY_COURSE_PROGRESS = `query MyCourseProgress($courseId: ID!) {
        myCourseProgress(courseId: $courseId) {
          _id
          lecture {
            _id
            title
          }
          viewed
          viewedDate
          completed
          completedDate
        }
      }`;
