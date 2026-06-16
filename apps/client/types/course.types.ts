export interface Instructor {
  _id: string;
  userName: string;
  email?: string;
}

export interface Lecture {
  _id?: string;
  title: string;
  videoUrl: string;
  duration?: string;
  freePreview?: boolean;
  createdAt?: string;
}

export interface Section {
  _id?: string;
  title: string;
  order: number;
  lectures: Lecture[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  _id: string;

  userName: string;
  email?: string;
}

export interface Course {
  _id?: string;
  title: string;
  description: string;
  price: number;
  objectives: string;
  welcomeMessage?: string;
  instructor: Instructor;
  students?: Student[];
  categories: string;
  level: string;
  primaryLanguage: string;
  lectures?: Lecture[];
  sections?: Section[];
  image?: string;
  isPublished: boolean;
  studentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  data: {
    courses?: Course[];
  };
}

export interface CourseResponse {
  data: {
    course: Course;
  };
}

export interface GETCoursesByInstructorID {
  data: {
    coursesByInstructor?: Course[];
  };
}
