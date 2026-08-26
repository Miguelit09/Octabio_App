import { createSeed } from "../data/seed";
import type {
  AppData,
  AppState,
  ContentItem,
  ContentType,
  Course,
  Role,
  SessionUser,
  User,
} from "./types";

const STORAGE_KEY = "octabio-demo-v1";

type Listener = () => void;

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function cloneSeed(): AppData {
  return structuredClone(createSeed());
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { data: cloneSeed(), sessionUserId: null };
    }
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed?.data?.users) {
      return { data: cloneSeed(), sessionUserId: null };
    }
    return parsed;
  } catch {
    return { data: cloneSeed(), sessionUserId: null };
  }
}

let state: AppState = loadState();
const listeners = new Set<Listener>();

function persist(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

function setData(mutator: (data: AppData) => void): void {
  mutator(state.data);
  persist();
}

export const store = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState(): AppState {
    return state;
  },

  getSession(): SessionUser | null {
    if (!state.sessionUserId) return null;
    const user = state.data.users.find((u) => u.id === state.sessionUserId);
    if (!user || !user.active) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },

  login(email: string, password: string): { ok: true; user: SessionUser } | { ok: false; error: string } {
    const normalized = email.trim().toLowerCase();
    const user = state.data.users.find((u) => u.email.toLowerCase() === normalized);
    if (!user || user.password !== password) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    if (!user.active) {
      return { ok: false, error: "Esta cuenta está desactivada." };
    }
    state.sessionUserId = user.id;
    persist();
    return {
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },

  logout(): void {
    state.sessionUserId = null;
    persist();
  },

  register(input: {
    name: string;
    email: string;
    password: string;
  }): { ok: true } | { ok: false; error: string } {
    const email = input.email.trim().toLowerCase();
    if (state.data.users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, error: "Este correo ya está registrado." };
    }
    const user: User = {
      id: uid("u"),
      name: input.name.trim(),
      email,
      password: input.password,
      role: "estudiante",
      active: true,
    };
    setData((d) => {
      d.users.push(user);
    });
    return { ok: true };
  },

  updateProfile(name: string): { ok: true } | { ok: false; error: string } {
    const session = store.getSession();
    if (!session) return { ok: false, error: "Sin sesión." };
    setData((d) => {
      const u = d.users.find((x) => x.id === session.id);
      if (u) u.name = name.trim();
    });
    return { ok: true };
  },

  changePassword(
    current: string,
    next: string,
  ): { ok: true } | { ok: false; error: string } {
    const session = store.getSession();
    if (!session) return { ok: false, error: "Sin sesión." };
    const user = state.data.users.find((u) => u.id === session.id);
    if (!user) return { ok: false, error: "Usuario no encontrado." };
    if (user.password !== current) {
      return { ok: false, error: "La contraseña actual no es correcta." };
    }
    setData((d) => {
      const u = d.users.find((x) => x.id === session.id);
      if (u) u.password = next;
    });
    return { ok: true };
  },

  enroll(courseId: string): { ok: true } | { ok: false; error: string } {
    const session = store.getSession();
    if (!session || session.role !== "estudiante") {
      return { ok: false, error: "Solo estudiantes pueden inscribirse." };
    }
    const exists = state.data.enrollments.some(
      (e) => e.userId === session.id && e.courseId === courseId,
    );
    if (exists) return { ok: true };
    setData((d) => {
      d.enrollments.push({
        id: uid("e"),
        userId: session.id,
        courseId,
        completedContentIds: [],
      });
    });
    return { ok: true };
  },

  completeContent(
    courseId: string,
    contentId: string,
  ): { ok: true } | { ok: false; error: string } {
    const session = store.getSession();
    if (!session) return { ok: false, error: "Sin sesión." };
    const enrollment = state.data.enrollments.find(
      (e) => e.userId === session.id && e.courseId === courseId,
    );
    if (!enrollment) return { ok: false, error: "No estás inscrito en este curso." };
    if (enrollment.completedContentIds.includes(contentId)) return { ok: true };
    setData((d) => {
      const e = d.enrollments.find((x) => x.id === enrollment.id);
      if (e) e.completedContentIds.push(contentId);
    });
    return { ok: true };
  },

  courseProgress(userId: string, courseId: string): number {
    const contents = state.data.contents.filter((c) => c.courseId === courseId);
    if (contents.length === 0) return 0;
    const enrollment = state.data.enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId,
    );
    if (!enrollment) return 0;
    const done = contents.filter((c) => enrollment.completedContentIds.includes(c.id)).length;
    return Math.round((done / contents.length) * 100);
  },

  isEnrolled(userId: string, courseId: string): boolean {
    return state.data.enrollments.some((e) => e.userId === userId && e.courseId === courseId);
  },

  saveCourse(input: {
    id?: string;
    title: string;
    description: string;
    categoryId: string;
    teacherId: string;
    active: boolean;
    coverLabel: string;
  }): Course {
    if (input.id) {
      setData((d) => {
        const c = d.courses.find((x) => x.id === input.id);
        if (c) {
          c.title = input.title;
          c.description = input.description;
          c.categoryId = input.categoryId;
          c.teacherId = input.teacherId;
          c.active = input.active;
          c.coverLabel = input.coverLabel;
        }
      });
      return state.data.courses.find((c) => c.id === input.id)!;
    }
    const course: Course = {
      id: uid("c"),
      title: input.title,
      description: input.description,
      categoryId: input.categoryId,
      teacherId: input.teacherId,
      active: input.active,
      coverLabel: input.coverLabel || input.title.slice(0, 12),
    };
    setData((d) => d.courses.push(course));
    return course;
  },

  deleteCourse(courseId: string): void {
    setData((d) => {
      d.courses = d.courses.filter((c) => c.id !== courseId);
      d.contents = d.contents.filter((c) => c.courseId !== courseId);
      d.enrollments = d.enrollments.filter((e) => e.courseId !== courseId);
      d.groups = d.groups.filter((g) => g.courseId !== courseId);
    });
  },

  addContent(input: {
    courseId: string;
    title: string;
    type: ContentType;
    description: string;
  }): ContentItem {
    const order =
      state.data.contents.filter((c) => c.courseId === input.courseId).length + 1;
    const item: ContentItem = {
      id: uid("ct"),
      courseId: input.courseId,
      title: input.title,
      type: input.type,
      description: input.description,
      order,
      body: input.type === "richtext" ? "Contenido de ejemplo." : undefined,
      durationLabel: input.type === "video" ? "5 min" : undefined,
    };
    setData((d) => d.contents.push(item));
    return item;
  },

  removeContent(contentId: string): void {
    setData((d) => {
      d.contents = d.contents.filter((c) => c.id !== contentId);
      d.enrollments.forEach((e) => {
        e.completedContentIds = e.completedContentIds.filter((id) => id !== contentId);
      });
    });
  },

  saveUser(input: {
    id?: string;
    name: string;
    email: string;
    role: Role;
    active: boolean;
    password?: string;
  }): { ok: true; user: User } | { ok: false; error: string } {
    const email = input.email.trim().toLowerCase();
    const conflict = state.data.users.find(
      (u) => u.email.toLowerCase() === email && u.id !== input.id,
    );
    if (conflict) return { ok: false, error: "El correo ya está en uso." };

    if (input.id) {
      setData((d) => {
        const u = d.users.find((x) => x.id === input.id);
        if (u) {
          u.name = input.name.trim();
          u.email = email;
          u.role = input.role;
          u.active = input.active;
          if (input.password) u.password = input.password;
        }
      });
      return { ok: true, user: state.data.users.find((u) => u.id === input.id)! };
    }

    const user: User = {
      id: uid("u"),
      name: input.name.trim(),
      email,
      password: input.password || "octabio",
      role: input.role,
      active: input.active,
    };
    setData((d) => d.users.push(user));
    return { ok: true, user };
  },

  deleteUser(userId: string): void {
    setData((d) => {
      d.users = d.users.filter((u) => u.id !== userId);
      d.enrollments = d.enrollments.filter((e) => e.userId !== userId);
      d.groups.forEach((g) => {
        g.studentIds = g.studentIds.filter((id) => id !== userId);
      });
    });
    if (state.sessionUserId === userId) {
      state.sessionUserId = null;
      persist();
    }
  },

  saveCategory(input: {
    id?: string;
    name: string;
    description: string;
  }): void {
    if (input.id) {
      setData((d) => {
        const c = d.categories.find((x) => x.id === input.id);
        if (c) {
          c.name = input.name.trim();
          c.description = input.description.trim();
        }
      });
      return;
    }
    setData((d) => {
      d.categories.push({
        id: uid("cat"),
        name: input.name.trim(),
        description: input.description.trim(),
      });
    });
  },

  deleteCategory(categoryId: string): void {
    setData((d) => {
      d.categories = d.categories.filter((c) => c.id !== categoryId);
    });
  },

  resetDemo(): void {
    state = { data: cloneSeed(), sessionUserId: null };
    persist();
  },
};

export function homeForRole(role: Role): string {
  if (role === "estudiante") return "#/app/inicio";
  if (role === "docente") return "#/doc/inicio";
  return "#/admin";
}
