import { addDays, differenceInCalendarDays, fromISO, toISO, todayISO } from "@/lib/dates";
import type { Habit } from "@/types";

export const isHabitDoneOn = (habit: Habit, iso: string) => habit.history.includes(iso);

export function isHabitScheduled(habit: Habit, iso: string) {
  const day = fromISO(iso).getDay();
  return (
    habit.frequency.kind === "daily" ||
    habit.frequency.kind === "weekly" ||
    (habit.frequency.kind === "weekdays" && day > 0 && day < 6) ||
    (habit.frequency.kind === "custom" && habit.frequency.days.includes(day))
  );
}

export const currentStreak = (habit: Habit, reference = new Date()) => {
  if (habit.frequency.kind === "custom" && !habit.frequency.days.length) return 0;
  const set = new Set(habit.history);
  let streak = 0;
  let cursor = reference;
  // permite que o dia de hoje ainda não esteja concluído
  if (!set.has(toISO(cursor))) cursor = addDays(cursor, -1);
  while (!isHabitScheduled(habit, toISO(cursor))) cursor = addDays(cursor, -1);
  while (set.has(toISO(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
    while (!isHabitScheduled(habit, toISO(cursor)) && habit.frequency.kind !== "weekly")
      cursor = addDays(cursor, -1);
  }
  return streak;
};

export const bestStreak = (habit: Habit) => {
  const sorted = [...habit.history].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const iso of sorted) {
    const gap = prev ? differenceInCalendarDays(fromISO(iso), fromISO(prev)) : 0;
    const consecutive =
      prev &&
      gap > 0 &&
      Array.from({ length: Math.max(0, gap - 1) }, (_, i) =>
        toISO(addDays(fromISO(prev!), i + 1)),
      ).every((d) => !isHabitScheduled(habit, d));
    if (consecutive) run += 1;
    else run = 1;
    best = Math.max(best, run);
    prev = iso;
  }
  return best;
};

export const completionRate = (habit: Habit, days = 30) => {
  const start = addDays(new Date(), -(days - 1));
  const done = habit.history.filter((iso) => fromISO(iso) >= start).length;
  return Math.round((done / days) * 100);
};

export const habitsDoneToday = (habits: Habit[]) => {
  const today = todayISO();
  return habits.filter((h) => isHabitDoneOn(h, today)).length;
};

export const longestActiveStreak = (habits: Habit[]) =>
  habits.reduce((max, h) => Math.max(max, currentStreak(h)), 0);

export const heatmapDays = (habit: Habit, days = 91) => {
  const set = new Set(habit.history);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(new Date(), -(days - 1 - i));
    const iso = toISO(date);
    return { iso, date, done: set.has(iso) };
  });
};

export const frequencyLabel = (habit: Habit) => {
  switch (habit.frequency.kind) {
    case "daily":
      return "Todos os dias";
    case "weekdays":
      return "Dias de semana";
    case "weekly":
      return `${habit.frequency.times}x por semana`;
    case "custom":
      return "Dias personalizados";
  }
};
