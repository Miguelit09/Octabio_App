export type Role = "estudiante" | "docente" | "admin";

export type ContentType = "video" | "pdf" | "image" | "richtext" | "steam";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ContentItem {
  id: string;
  courseId: string;
  title: string;
  type: ContentType;
  description: string;
  durationLabel?: string;
  body?: string;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  teacherId: string;
  active: boolean;
  coverLabel: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  completedContentIds: string[];
}

export interface Group {
  id: string;
  name: string;
  courseId: string;
  teacherId: string;
  studentIds: string[];
}

export interface AppData {
  users: User[];
  categories: Category[];
  courses: Course[];
  contents: ContentItem[];
  enrollments: Enrollment[];
  groups: Group[];
}

export interface AppState {
  data: AppData;
  sessionUserId: string | null;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
