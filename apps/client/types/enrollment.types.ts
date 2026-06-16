export type PaymentMethod = 'stripe' | 'paypal';
export type EnrollmentStatus = 'active' | 'refunded';

export interface Enrollment {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email?: string;
  };
  course: {
    _id: string;
    title: string;
    image?: string;
  };
  paymentMethod: PaymentMethod;
  paymentId: string;
  amount: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgress {
  _id: string;
  user: {
    _id: string;
    userName: string;
  };
  course: {
    _id: string;
    title: string;
  };
  lecture: {
    _id: string;
    title: string;
    videoUrl: string;
    duration?: string;
  };
  viewed: boolean;
  viewedDate: string | null;
  completed: boolean;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentsResponse {
  data: {
    myEnrollments: Enrollment[];
  };
}

export interface IsEnrolledResponse {
  data: {
    isEnrolled: {
      enrolled: boolean;
    };
  };
}

export interface CourseProgressResponse {
  data: {
    myCourseProgress: CourseProgress[];
  };
}

export interface CompletionStatsResponse {
  data: {
    courseCompletionStats: {
      percentage: number;
    };
  };
}

export interface CourseEnrollmentsResponse {
  data: {
    courseEnrollments: Enrollment[];
  };
}
