import { addDays, addMonths, format, parseISO } from "date-fns";
import type { Task } from "@/types";

export function nextOccurrence(task: Task): string | null {
  if (!task.date || task.recurrence.kind === "none") return null;
  const base = parseISO(task.date);
  const recurrence = task.recurrence;
  if (recurrence.kind === "monthly") return format(addMonths(base, 1), "yyyy-MM-dd");
  if (recurrence.kind === "weekly") return format(addDays(base, 7), "yyyy-MM-dd");
  for (let i = 1; i <= 7; i++) {
    const next = addDays(base, i);
    const day = next.getDay();
    if (
      recurrence.kind === "daily" ||
      (recurrence.kind === "weekdays" && day > 0 && day < 6) ||
      (recurrence.kind === "custom" && recurrence.days.includes(day))
    )
      return format(next, "yyyy-MM-dd");
  }
  return null;
}

export function transitionTask(
  tasks: Task[],
  id: string,
  patch: Partial<Task>,
  nextId: string,
  now: string,
): Task[] {
  const current = tasks.find((t) => t.id === id);
  if (!current) return tasks;
  const updated = { ...current, ...patch };
  if (patch.status)
    updated.completedAt = patch.status === "done" ? (current.completedAt ?? now) : null;
  const result = tasks.map((t) => (t.id === id ? updated : t));
  if (current.status !== "done" && updated.status === "done") {
    const date = nextOccurrence(updated);
    if (date && !tasks.some((t) => t.recurrenceSourceId === id))
      result.push({
        ...updated,
        id: nextId,
        date,
        status: "todo",
        completedAt: null,
        createdAt: now,
        recurrenceSourceId: id,
        subtasks: updated.subtasks.map((s) => ({ ...s, done: false })),
        order: Math.max(0, ...tasks.map((t) => t.order)) + 1,
      });
  }
  return result;
}
