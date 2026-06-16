export interface DashboardStat {
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface RevenueData {
  monthly: ChartDataPoint[];
  total: number;
  growth: number;
}

export interface EnrollmentData {
  byCourse: {
    courseTitle: string;
    count: number;
    color: string;
  }[];
  total: number;
}

export interface ActivityItem {
  id: string;
  type: 'enrollment' | 'review' | 'course_update' | 'milestone';
  title: string;
  description: string;
  time: string;
  avatar?: string;
}

export interface DashboardData {
  stats: DashboardStat[];
  revenue: RevenueData;
  enrollment: EnrollmentData;
  recentActivity: ActivityItem[];
}

// ---- CRUD Form Types ----

export interface LectureFormData {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  freePreview?: boolean;
  /** Holds the File object in memory before upload */
  videoFile?: File;
}

export interface CreateCourseFormData {
  title: string;
  description: string;
  price: number;
  categories: string;
  level: string;
  primaryLanguage: string;
  objectives: string;
  welcomeMessage: string;
  isPublished: boolean;
  image?: string;
}

export interface UpdateCourseFormData {
  _id: string;
  title?: string;
  description?: string;
  price?: number;
  categories?: string;
  level?: string;
  primaryLanguage?: string;
  objectives?: string;
  welcomeMessage?: string;
  isPublished?: boolean;
  image?: string;
  lectures?: string[];
}
