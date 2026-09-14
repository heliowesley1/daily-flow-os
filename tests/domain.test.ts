import test from "node:test";
import assert from "node:assert/strict";
import { createSeedState } from "@/data/seed";
import { parseBackup } from "@/services/backup";
import { nextOccurrence, transitionTask } from "@/lib/recurrence";
import { currentStreak } from "@/lib/habits";
import { LocalStorageAdapter } from "@/services/persistence";

test("backup roundtrip preserves all personal data", () => {
  const state = createSeedState();
  assert.deepEqual(parseBackup(JSON.stringify(state)), state);
});
test("invalid backups are rejected rather than replacing data", () => {
  assert.throws(() => parseBackup('{"version":1}'));
  const state = createSeedState();
  state.preferences.accent = "invalid" as never;
  assert.throws(() => parseBackup(JSON.stringify(state)));
});
test("recurring tasks create exactly one successor even when reopened", () => {
  const task = {
    ...createSeedState().tasks[0]!,
    date: "2026-09-14",
    status: "todo" as const,
    recurrence: { kind: "daily" as const },
  };
  const now = "2026-09-14T12:00:00.000Z";
  const done = transitionTask([task], task.id, { status: "done" }, "next", now);
  assert.equal(done.length, 2);
  assert.equal(done[1]!.date, "2026-09-15");
  assert.equal(done[0]!.completedAt, now);
  assert.equal(
    done[1]!.subtasks.every((s) => !s.done),
    true,
  );
  const reopened = transitionTask(done, task.id, { status: "todo" }, "unused", now);
  assert.equal(reopened[0]!.completedAt, null);
  assert.equal(transitionTask(reopened, task.id, { status: "done" }, "duplicate", now).length, 2);
});
test("recurrence skips weekends and clamps month endings", () => {
  const task = createSeedState().tasks[0]!;
  assert.equal(
    nextOccurrence({ ...task, date: "2026-09-18", recurrence: { kind: "weekdays" } }),
    "2026-09-21",
  );
  assert.equal(
    nextOccurrence({ ...task, date: "2026-01-31", recurrence: { kind: "monthly" } }),
    "2026-02-28",
  );
  assert.equal(nextOccurrence({ ...task, date: null, recurrence: { kind: "daily" } }), null);
});
test("weekday streak survives a weekend before Monday completion", () => {
  const habit = {
    ...createSeedState().habits[0]!,
    frequency: { kind: "weekdays" as const },
    history: ["2026-09-17", "2026-09-18"],
  };
  assert.equal(currentStreak(habit, new Date(2026, 8, 21)), 2);
});
test("storage failure is reported and corrupt data is preserved", async () => {
  const raw = "invalid-data";
  Object.defineProperty(globalThis, "window", {
    value: {
      localStorage: {
        getItem: () => raw,
        setItem: () => {
          throw new Error("quota");
        },
      },
    },
    configurable: true,
  });
  const adapter = new LocalStorageAdapter();
  await assert.rejects(adapter.load());
  await assert.rejects(adapter.save(createSeedState()));
  Reflect.deleteProperty(globalThis, "window");
});
