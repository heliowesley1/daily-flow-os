/** Domain model for Focal — Daily Life OS. */

export type Priority = "baixa" | "media" | "alta" | "urgente";

export type TaskStatus = "inbox" | "todo" | "doing" | "done";

export type Recurrence =
  | { kind: "none" }
  | { kind: "daily" }
  | { kind: "weekdays" }
  | { kind: "weekly" }
  | { kind: "monthly" }
  | { kind: "custom"; days: number[] };

export interface Category {
  id: string;
  name: string;
  /** design-system token name, e.g. "primary" | "success" | "warning" */
  tone: CategoryTone;
}

export type CategoryTone = "primary" | "success" | "warning" | "chart-4" | "chart-5" | "muted";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  /** ISO yyyy-MM-dd; null = inbox / sem data */
  date: string | null;
  /** HH:mm */
  time: string | null;
  priority: Priority;
  categoryId: string | null;
  projectId: string | null;
  tags: string[];
  status: TaskStatus;
  recurrence: Recurrence;
  /** marca como uma das prioridades do dia */
  focus: boolean;
  order: number;
  subtasks: Subtask[];
  createdAt: string;
  completedAt: string | null;
}

export type HabitFrequency =
  | { kind: "daily" }
  | { kind: "weekdays" }
  | { kind: "weekly"; times: number }
  | { kind: "custom"; days: number[] };

export interface Habit {
  id: string;
  name: string;
  goal?: string;
  frequency: HabitFrequency;
  categoryId: string | null;
  /** ISO dates (yyyy-MM-dd) em que o hábito foi concluído */
  history: string[];
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime: string | null;
  categoryId: string | null;
  location?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  favorite: boolean;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuickNote {
  id: string;
  content: string;
  updatedAt: string;
}

export type ProjectStatus = "ativo" | "pausado" | "concluido";

export interface Project {
  id: string;
  name: string;
  description: string;
  tone: CategoryTone;
  status: ProjectStatus;
  deadline: string | null;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  note?: string;
  bought: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
}

export type ThemeMode = "light" | "dark" | "system";

export type AccentKey = "frost" | "sage" | "amber" | "rose" | "violet" | "graphite";

export interface Preferences {
  theme: ThemeMode;
  accent: AccentKey;
  firstDayOfWeek: 0 | 1;
  dateFormat: "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";
  timeFormat: "24h" | "12h";
  notifications: boolean;
  hideCompleted: boolean;
}

/** SaaS-ready shape: user → workspace → plan → subscription. */
export type PlanId = "free" | "pro" | "premium";

export interface Plan {
  id: PlanId;
  name: string;
  limits: { tasksPerMonth: number | null; projects: number | null; ai: boolean };
}

export interface Subscription {
  planId: PlanId;
  status: "trial" | "active" | "canceled";
  renewsAt: string | null;
  usage: { tasksThisMonth: number };
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  /** áreas da vida escolhidas no onboarding */
  focusAreas: string[];
}

export interface AppState {
  version: number;
  onboarded: boolean;
  profile: Profile;
  workspace: Workspace;
  subscription: Subscription;
  preferences: Preferences;
  categories: Category[];
  tasks: Task[];
  habits: Habit[];
  events: CalendarEvent[];
  notes: Note[];
  quickNotes: QuickNote[];
  projects: Project[];
  shoppingLists: ShoppingList[];
}
