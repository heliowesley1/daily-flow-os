import { isOverdue, todayISO } from "@/lib/dates";
import type { Priority, Task, TaskStatus } from "@/types";

export const PRIORITY_LABEL: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORITY_ORDER: Priority[] = ["urgente", "alta", "media", "baixa"];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  inbox: "Inbox",
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluída",
};

export const STATUS_COLUMNS: TaskStatus[] = ["inbox", "todo", "doing", "done"];

export const isDone = (task: Task) => task.status === "done";

export const tasksForDate = (tasks: Task[], iso: string) =>
  tasks.filter((t) => t.date === iso).sort(sortByOrder);

export const sortByOrder = (a: Task, b: Task) => a.order - b.order;

export const sortByPriority = (a: Task, b: Task) =>
  PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);

export const overdueTasks = (tasks: Task[]) => tasks.filter((t) => !isDone(t) && isOverdue(t.date));

export const todayTasks = (tasks: Task[]) => tasksForDate(tasks, todayISO());

export const focusTasks = (tasks: Task[]) =>
  todayTasks(tasks)
    .filter((t) => t.focus)
    .slice(0, 3);

export const dayProgress = (tasks: Task[], iso: string) => {
  const list = tasksForDate(tasks, iso);
  if (!list.length) return 0;
  return Math.round((list.filter(isDone).length / list.length) * 100);
};

export const projectProgress = (tasks: Task[], projectId: string) => {
  const list = tasks.filter((t) => t.projectId === projectId);
  if (!list.length) return 0;
  return Math.round((list.filter(isDone).length / list.length) * 100);
};

export const recurrenceLabel = (task: Task) => {
  switch (task.recurrence.kind) {
    case "none":
      return null;
    case "daily":
      return "Todos os dias";
    case "weekdays":
      return "Dias de semana";
    case "weekly":
      return "Toda semana";
    case "monthly":
      return "Todo mês";
    case "custom":
      return "Personalizado";
  }
};
