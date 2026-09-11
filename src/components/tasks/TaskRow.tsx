import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { CategoryChip, PriorityChip } from "@/components/common/Chips";
import { CheckToggle } from "@/components/common/CheckToggle";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { formatTime, fromISO, formatShortDate, isOverdue } from "@/lib/dates";
import { isDone } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { useApp } from "@/stores/app-store";
import type { Task } from "@/types";

interface TaskRowProps {
  task: Task;
  showDate?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  className?: string;
}

export function TaskRow({
  task,
  showDate,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  className,
}: TaskRowProps) {
  const { state, toggleTask, deleteTask } = useApp();
  const [editing, setEditing] = useState(false);
  const category = state.categories.find((c) => c.id === task.categoryId) ?? null;
  const done = isDone(task);
  const late = !done && isOverdue(task.date);

  return (
    <>
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={cn(
          "group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card/60 px-3 py-2.5 transition-all duration-200 hover:shadow-[var(--shadow-soft)]",
          done && "opacity-60",
          className,
        )}
      >
        <div className="flex items-center gap-1.5">
          {draggable && (
            <GripVertical className="hidden size-4 cursor-grab text-muted-foreground/40 sm:block" />
          )}
          <CheckToggle
            size="sm"
            checked={done}
            onChange={() => toggleTask(task.id)}
            label={`Concluir ${task.title}`}
          />
        </div>

        <button type="button" onClick={() => setEditing(true)} className="min-w-0 text-left">
          <p className={cn("truncate text-sm font-medium", done && "text-muted-foreground line-through")}>
            {task.title}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            {showDate && task.date && <span>{formatShortDate(fromISO(task.date))}</span>}
            {task.time && <span className="tabular-nums">{formatTime(task.time, state.preferences.timeFormat)}</span>}
            {late && <span className="font-semibold text-destructive">atrasada</span>}
            {task.subtasks.length > 0 && (
              <span>
                {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} subtarefas
              </span>
            )}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <CategoryChip category={category} className="hidden sm:inline" />
          <PriorityChip priority={task.priority} className="hidden md:inline" />
          <button
            type="button"
            aria-label="Editar tarefa"
            onClick={() => setEditing(true)}
            className="grid size-7 place-items-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Excluir tarefa"
            onClick={() => deleteTask(task.id)}
            className="grid size-7 place-items-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <TaskFormDialog open={editing} onOpenChange={setEditing} task={task} />
    </>
  );
}
