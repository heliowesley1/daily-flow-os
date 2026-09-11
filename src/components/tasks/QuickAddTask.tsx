import { Plus } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useApp } from "@/stores/app-store";
import type { TaskStatus } from "@/types";

interface QuickAddTaskProps {
  date?: string | null;
  status?: TaskStatus;
  projectId?: string | null;
  placeholder?: string;
  className?: string;
  label?: string;
}

/** Entrada inline: criar tarefa em segundos, sem abrir modal. */
export function QuickAddTask({
  date,
  status,
  projectId,
  placeholder = "Nova tarefa…",
  className,
  label = "+ Adicionar tarefa",
}: QuickAddTaskProps) {
  const { addTask } = useApp();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim()) {
      setOpen(false);
      return;
    }
    addTask({
      title: value.trim(),
      date: date ?? null,
      status: status ?? (date ? "todo" : "inbox"),
      projectId: projectId ?? null,
    });
    setValue("");
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary",
          className,
        )}
      >
        <Plus className="size-3.5" /> {label}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      value={value}
      placeholder={placeholder}
      className={cn("h-10", className)}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        submit();
        setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") submit();
        if (e.key === "Escape") {
          setValue("");
          setOpen(false);
        }
      }}
    />
  );
}
