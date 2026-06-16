export interface CourseStatusInfo {
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  percentage: number;
  viewedCount: number;
  completedCount: number;
  totalLectures: number;
}

export interface CourseStatusResponse {
  data: {
    courseStatus: CourseStatusInfo;
  };
}

export interface AllCoursesStatusResponse {
  data: {
    allMyCoursesStatus: CourseStatusInfo[];
  };
}
