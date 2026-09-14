import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createSeedState } from "@/data/seed";
import { toast } from "sonner";
import { transitionTask } from "@/lib/recurrence";
import { todayISO } from "@/lib/dates";
import { persistence, uid } from "@/services/persistence";
import type {
  AppState,
  CalendarEvent,
  Category,
  Habit,
  Note,
  Preferences,
  Project,
  ShoppingItem,
  ShoppingList,
  Task,
} from "@/types";

type NewTask = Partial<Task> & { title: string };

interface AppActions {
  // tasks
  addTask: (input: NewTask) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (ids: string[]) => void;
  moveTaskToDate: (id: string, date: string | null) => void;
  // habits
  addHabit: (input: Partial<Habit> & { name: string }) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDay: (id: string, iso?: string) => void;
  // events
  addEvent: (input: Partial<CalendarEvent> & { title: string }) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  // notes
  addNote: (input?: Partial<Note>) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleNoteFavorite: (id: string) => void;
  setQuickNote: (content: string, id?: string) => void;
  deleteQuickNote: (id: string) => void;
  // projects
  addProject: (input: Partial<Project> & { name: string }) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // shopping
  addShoppingList: (name: string) => void;
  deleteShoppingList: (id: string) => void;
  addShoppingItem: (listId: string, item: Partial<ShoppingItem> & { name: string }) => void;
  toggleShoppingItem: (listId: string, itemId: string) => void;
  deleteShoppingItem: (listId: string, itemId: string) => void;
  clearBought: (listId: string) => void;
  // categories & prefs
  addCategory: (input: Partial<Category> & { name: string }) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  updateProfile: (patch: Partial<AppState["profile"]>) => void;
  completeOnboarding: (data: { name: string; focusAreas: string[] }) => void;
  resetDemoData: () => void;
  startEmpty: () => void;
  replaceState: (state: AppState) => void;
}

interface AppContextValue extends AppActions {
  state: AppState;
  hydrated: boolean;
  storageBlocked: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createSeedState());
  const [hydrated, setHydrated] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);

  useEffect(() => {
    let active = true;
    persistence
      .load()
      .then((loaded) => {
        if (!active) return;
        if (loaded && loaded.version === 1) setState(loaded);
        setHydrated(true);
      })
      .catch(() => {
        if (active) {
          setStorageBlocked(true);
          setHydrated(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || storageBlocked) return;
    void persistence
      .save(state)
      .catch(() =>
        toast.error(
          "Não foi possível salvar neste navegador. Exporte um backup nas configurações.",
          { id: "storage-error" },
        ),
      );
  }, [state, hydrated, storageBlocked]);

  const patch = useCallback((fn: (prev: AppState) => AppState) => setState(fn), []);

  const actions = useMemo<AppActions>(() => {
    const nextOrder = (tasks: Task[]) =>
      tasks.length ? Math.max(...tasks.map((t) => t.order)) + 1 : 0;

    return {
      addTask(input) {
        const task: Task = {
          id: uid(),
          title: input.title,
          notes: input.notes ?? "",
          date: input.date ?? null,
          time: input.time ?? null,
          priority: input.priority ?? "media",
          categoryId: input.categoryId ?? null,
          projectId: input.projectId ?? null,
          tags: input.tags ?? [],
          status: input.status ?? (input.date ? "todo" : "inbox"),
          recurrence: input.recurrence ?? { kind: "none" },
          focus: input.focus ?? false,
          order: 0,
          subtasks: input.subtasks ?? [],
          createdAt: new Date().toISOString(),
          completedAt: input.status === "done" ? new Date().toISOString() : null,
        };
        patch((prev) => ({
          ...prev,
          tasks: [...prev.tasks, { ...task, order: nextOrder(prev.tasks) }],
          subscription: {
            ...prev.subscription,
            usage: { tasksThisMonth: prev.subscription.usage.tasksThisMonth + 1 },
          },
        }));
        return task;
      },
      updateTask(id, taskPatch) {
        const nextId = uid();
        const now = new Date().toISOString();
        patch((prev) => ({
          ...prev,
          tasks: transitionTask(prev.tasks, id, taskPatch, nextId, now),
        }));
      },
      toggleTask(id) {
        const nextId = uid();
        const now = new Date().toISOString();
        patch((prev) => {
          const task = prev.tasks.find((t) => t.id === id);
          if (!task) return prev;
          return {
            ...prev,
            tasks: transitionTask(
              prev.tasks,
              id,
              { status: task.status === "done" ? (task.date ? "todo" : "inbox") : "done" },
              nextId,
              now,
            ),
          };
        });
      },
      toggleSubtask(taskId, subtaskId) {
        patch((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, done: !s.done } : s,
                  ),
                }
              : t,
          ),
        }));
      },
      deleteTask(id) {
        patch((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
      },
      reorderTasks(ids) {
        patch((prev) => {
          const orderMap = new Map(ids.map((id, index) => [id, index]));
          return {
            ...prev,
            tasks: prev.tasks.map((t) =>
              orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t,
            ),
          };
        });
      },
      moveTaskToDate(id, date) {
        patch((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === id
              ? { ...t, date, status: t.status === "inbox" && date ? "todo" : t.status }
              : t,
          ),
        }));
      },

      addHabit(input) {
        const habit: Habit = {
          id: uid(),
          name: input.name,
          goal: input.goal ?? "",
          frequency: input.frequency ?? { kind: "daily" },
          categoryId: input.categoryId ?? null,
          history: input.history ?? [],
          createdAt: new Date().toISOString(),
        };
        patch((prev) => ({ ...prev, habits: [...prev.habits, habit] }));
      },
      updateHabit(id, habitPatch) {
        patch((prev) => ({
          ...prev,
          habits: prev.habits.map((h) => (h.id === id ? { ...h, ...habitPatch } : h)),
        }));
      },
      deleteHabit(id) {
        patch((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== id) }));
      },
      toggleHabitDay(id, iso) {
        const day = iso ?? todayISO();
        patch((prev) => ({
          ...prev,
          habits: prev.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  history: h.history.includes(day)
                    ? h.history.filter((d) => d !== day)
                    : [...h.history, day],
                }
              : h,
          ),
        }));
      },

      addEvent(input) {
        const event: CalendarEvent = {
          id: uid(),
          title: input.title,
          date: input.date ?? todayISO(),
          time: input.time ?? "09:00",
          endTime: input.endTime ?? null,
          categoryId: input.categoryId ?? null,
          location: input.location ?? "",
        };
        patch((prev) => ({ ...prev, events: [...prev.events, event] }));
      },
      updateEvent(id, eventPatch) {
        patch((prev) => ({
          ...prev,
          events: prev.events.map((e) => (e.id === id ? { ...e, ...eventPatch } : e)),
        }));
      },
      deleteEvent(id) {
        patch((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== id) }));
      },

      addNote(input) {
        const now = new Date().toISOString();
        const note: Note = {
          id: uid(),
          title: input?.title ?? "Nova nota",
          content: input?.content ?? "",
          favorite: input?.favorite ?? false,
          categoryId: input?.categoryId ?? null,
          createdAt: now,
          updatedAt: now,
        };
        patch((prev) => ({ ...prev, notes: [note, ...prev.notes] }));
        return note;
      },
      updateNote(id, notePatch) {
        patch((prev) => ({
          ...prev,
          notes: prev.notes.map((n) =>
            n.id === id ? { ...n, ...notePatch, updatedAt: new Date().toISOString() } : n,
          ),
        }));
      },
      deleteNote(id) {
        patch((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
      },
      toggleNoteFavorite(id) {
        patch((prev) => ({
          ...prev,
          notes: prev.notes.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n)),
        }));
      },
      setQuickNote(content, id) {
        const now = new Date().toISOString();
        patch((prev) => {
          if (id) {
            return {
              ...prev,
              quickNotes: prev.quickNotes.map((q) =>
                q.id === id ? { ...q, content, updatedAt: now } : q,
              ),
            };
          }
          return {
            ...prev,
            quickNotes: [{ id: uid(), content, updatedAt: now }, ...prev.quickNotes],
          };
        });
      },
      deleteQuickNote(id) {
        patch((prev) => ({ ...prev, quickNotes: prev.quickNotes.filter((q) => q.id !== id) }));
      },

      addProject(input) {
        const project: Project = {
          id: uid(),
          name: input.name,
          description: input.description ?? "",
          tone: input.tone ?? "primary",
          status: input.status ?? "ativo",
          deadline: input.deadline ?? null,
          createdAt: new Date().toISOString(),
        };
        patch((prev) => ({ ...prev, projects: [...prev.projects, project] }));
      },
      updateProject(id, projectPatch) {
        patch((prev) => ({
          ...prev,
          projects: prev.projects.map((p) => (p.id === id ? { ...p, ...projectPatch } : p)),
        }));
      },
      deleteProject(id) {
        patch((prev) => ({
          ...prev,
          projects: prev.projects.filter((p) => p.id !== id),
          tasks: prev.tasks.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
        }));
      },

      addShoppingList(name) {
        const list: ShoppingList = {
          id: uid(),
          name,
          items: [],
          createdAt: new Date().toISOString(),
        };
        patch((prev) => ({ ...prev, shoppingLists: [...prev.shoppingLists, list] }));
      },
      deleteShoppingList(id) {
        patch((prev) => ({
          ...prev,
          shoppingLists: prev.shoppingLists.filter((l) => l.id !== id),
        }));
      },
      addShoppingItem(listId, item) {
        const newItem: ShoppingItem = {
          id: uid(),
          name: item.name,
          quantity: item.quantity ?? 1,
          unit: item.unit ?? "un",
          note: item.note ?? "",
          bought: false,
        };
        patch((prev) => ({
          ...prev,
          shoppingLists: prev.shoppingLists.map((l) =>
            l.id === listId ? { ...l, items: [...l.items, newItem] } : l,
          ),
        }));
      },
      toggleShoppingItem(listId, itemId) {
        patch((prev) => ({
          ...prev,
          shoppingLists: prev.shoppingLists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: l.items.map((i) => (i.id === itemId ? { ...i, bought: !i.bought } : i)),
                }
              : l,
          ),
        }));
      },
      deleteShoppingItem(listId, itemId) {
        patch((prev) => ({
          ...prev,
          shoppingLists: prev.shoppingLists.map((l) =>
            l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l,
          ),
        }));
      },
      clearBought(listId) {
        patch((prev) => ({
          ...prev,
          shoppingLists: prev.shoppingLists.map((l) =>
            l.id === listId ? { ...l, items: l.items.filter((i) => !i.bought) } : l,
          ),
        }));
      },

      addCategory(input) {
        const category: Category = {
          id: uid(),
          name: input.name,
          tone: input.tone ?? "primary",
        };
        patch((prev) => ({ ...prev, categories: [...prev.categories, category] }));
      },
      updateCategory(id, categoryPatch) {
        patch((prev) => ({
          ...prev,
          categories: prev.categories.map((c) => (c.id === id ? { ...c, ...categoryPatch } : c)),
        }));
      },
      deleteCategory(id) {
        patch((prev) => ({
          ...prev,
          categories: prev.categories.filter((c) => c.id !== id),
          tasks: prev.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t)),
          notes: prev.notes.map((n) => (n.categoryId === id ? { ...n, categoryId: null } : n)),
          events: prev.events.map((e) => (e.categoryId === id ? { ...e, categoryId: null } : e)),
          habits: prev.habits.map((h) => (h.categoryId === id ? { ...h, categoryId: null } : h)),
        }));
      },
      updatePreferences(prefPatch) {
        patch((prev) => ({ ...prev, preferences: { ...prev.preferences, ...prefPatch } }));
      },
      updateProfile(profilePatch) {
        patch((prev) => ({ ...prev, profile: { ...prev.profile, ...profilePatch } }));
      },
      completeOnboarding({ name, focusAreas }) {
        patch((prev) => ({
          ...prev,
          onboarded: true,
          profile: { ...prev.profile, name: name || prev.profile.name },
          workspace: { ...prev.workspace, focusAreas },
        }));
      },
      resetDemoData() {
        const seed = createSeedState();
        patch((prev) => ({
          ...seed,
          onboarded: prev.onboarded,
          profile: prev.profile,
          preferences: prev.preferences,
        }));
      },
      startEmpty() {
        setStorageBlocked(false);
        patch((prev) => ({
          ...prev,
          tasks: [],
          habits: [],
          notes: [],
          quickNotes: [],
          events: [],
          projects: [],
          shoppingLists: [],
          subscription: {
            ...prev.subscription,
            planId: "free",
            status: "active",
            renewsAt: null,
            usage: { tasksThisMonth: 0 },
          },
        }));
      },
      replaceState(next) {
        setState(next);
        setStorageBlocked(false);
      },
    };
  }, [patch]);

  const value = useMemo<AppContextValue>(
    () => ({ state, hydrated, storageBlocked, ...actions }),
    [state, hydrated, storageBlocked, actions],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppStoreProvider");
  return ctx;
}

export function useCategories() {
  const { state } = useApp();
  return state.categories;
}

export function useCategory(id: string | null) {
  const categories = useCategories();
  return categories.find((c) => c.id === id) ?? null;
}
