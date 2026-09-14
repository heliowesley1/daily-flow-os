import { z } from "zod";
import type { AppState } from "@/types";

const id = z.string().min(1);
const nullable = z.string().nullable();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const stamp = z.string().datetime();
const tone = z.enum(["primary", "success", "warning", "chart-4", "chart-5", "muted"]);
const days = z.array(z.number().int().min(0).max(6)).min(1);
const recurrence = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("none") }),
  z.object({ kind: z.literal("daily") }),
  z.object({ kind: z.literal("weekdays") }),
  z.object({ kind: z.literal("weekly") }),
  z.object({ kind: z.literal("monthly") }),
  z.object({ kind: z.literal("custom"), days }),
]);
const frequency = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("daily") }),
  z.object({ kind: z.literal("weekdays") }),
  z.object({ kind: z.literal("weekly"), times: z.number().int().min(1).max(7) }),
  z.object({ kind: z.literal("custom"), days }),
]);
export const backupSchema = z.object({
  version: z.literal(1),
  onboarded: z.boolean(),
  profile: z.object({ id, name: z.string(), email: z.string(), avatarUrl: nullable }),
  workspace: z.object({
    id,
    name: z.string(),
    ownerId: z.string(),
    focusAreas: z.array(z.string()),
  }),
  subscription: z.object({
    planId: z.enum(["free", "pro", "premium"]),
    status: z.enum(["trial", "active", "canceled"]),
    renewsAt: nullable,
    usage: z.object({ tasksThisMonth: z.number().nonnegative() }),
  }),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]),
    accent: z.enum(["frost", "sage", "amber", "rose", "violet", "graphite"]),
    firstDayOfWeek: z.union([z.literal(0), z.literal(1)]),
    dateFormat: z.enum(["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd"]),
    timeFormat: z.enum(["24h", "12h"]),
    notifications: z.boolean(),
    hideCompleted: z.boolean(),
  }),
  categories: z.array(z.object({ id, name: z.string(), tone })),
  tasks: z.array(
    z.object({
      id,
      title: z.string(),
      notes: z.string().optional(),
      date: date.nullable(),
      time: time.nullable(),
      priority: z.enum(["baixa", "media", "alta", "urgente"]),
      categoryId: nullable,
      projectId: nullable,
      tags: z.array(z.string()),
      status: z.enum(["inbox", "todo", "doing", "done"]),
      recurrence,
      focus: z.boolean(),
      order: z.number(),
      subtasks: z.array(z.object({ id, title: z.string(), done: z.boolean() })),
      createdAt: stamp,
      completedAt: stamp.nullable(),
      recurrenceSourceId: z.string().optional(),
    }),
  ),
  habits: z.array(
    z.object({
      id,
      name: z.string(),
      goal: z.string().optional(),
      frequency,
      categoryId: nullable,
      history: z.array(date),
      createdAt: stamp,
    }),
  ),
  events: z.array(
    z.object({
      id,
      title: z.string(),
      date,
      time,
      endTime: time.nullable(),
      categoryId: nullable,
      location: z.string().optional(),
    }),
  ),
  notes: z.array(
    z.object({
      id,
      title: z.string(),
      content: z.string(),
      favorite: z.boolean(),
      categoryId: nullable,
      createdAt: stamp,
      updatedAt: stamp,
    }),
  ),
  quickNotes: z.array(z.object({ id, content: z.string(), updatedAt: stamp })),
  projects: z.array(
    z.object({
      id,
      name: z.string(),
      description: z.string(),
      tone,
      status: z.enum(["ativo", "pausado", "concluido"]),
      deadline: date.nullable(),
      createdAt: stamp,
    }),
  ),
  shoppingLists: z.array(
    z.object({
      id,
      name: z.string(),
      createdAt: stamp,
      items: z.array(
        z.object({
          id,
          name: z.string(),
          quantity: z.number().positive(),
          unit: z.string(),
          note: z.string().optional(),
          bought: z.boolean(),
        }),
      ),
    }),
  ),
});
export function parseBackup(raw: string): AppState {
  const result = backupSchema.safeParse(JSON.parse(raw));
  if (!result.success)
    throw new Error("Backup inválido ou incompatível. Seus dados atuais foram preservados.");
  return result.data as AppState;
}
