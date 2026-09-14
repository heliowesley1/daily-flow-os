import { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "@/stores/app-store";
import { TaskRow } from "@/components/tasks/TaskRow";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_COLUMNS, STATUS_LABEL, sortByPriority } from "@/lib/tasks";
import { Empty } from "./shared";
import type { TaskStatus } from "@/types";

export function TasksView() {
  const { state, updateTask, reorderTasks } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("list");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const tasks = state.tasks
    .filter(
      (t) =>
        (t.title + " " + t.notes + " " + t.tags.join(" "))
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (category === "all" || t.categoryId === category) &&
        (status === "all" || t.status === status) &&
        (!state.preferences.hideCompleted || t.status !== "done"),
    )
    .sort(
      mode === "priority"
        ? sortByPriority
        : mode === "date"
          ? (a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999")
          : (a, b) => a.order - b.order,
    );
  const rows = (items: typeof tasks) =>
    items.map((t) => (
      <TaskRow
        key={t.id}
        task={t}
        showDate
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          if (mode === "kanban") return;
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          if (id === t.id) return;
          if (!state.tasks.some((x) => x.id === id)) return;
          const ids = [...state.tasks]
            .sort((a, b) => a.order - b.order)
            .map((x) => x.id)
            .filter((x) => x !== id);
          ids.splice(ids.indexOf(t.id), 0, id);
          reorderTasks(ids);
        }}
      />
    ));
  return (
    <>
      <div className="flow-page-heading">
        <div>
          <p className="flow-eyebrow">UM PASSO DE CADA VEZ</p>
          <h1>Tarefas</h1>
          <p>Tire da cabeça. Organize. Faça acontecer.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} />
          Nova tarefa
        </Button>
      </div>
      <div className="flow-toolbar">
        <Input
          placeholder="Buscar tarefas…"
          aria-label="Buscar tarefas"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Todas as áreas</option>
          {state.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Todos os status</option>
          {STATUS_COLUMNS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select aria-label="Visualização" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="list">Lista</option>
          <option value="kanban">Kanban</option>
          <option value="priority">Por prioridade</option>
          <option value="date">Por data</option>
        </select>
      </div>
      {mode === "kanban" ? (
        <div className="flow-kanban">
          {STATUS_COLUMNS.map((s) => (
            <section
              className="flow-panel"
              key={s}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                updateTask(e.dataTransfer.getData("text/plain"), { status: s });
              }}
            >
              <h2 className="font-semibold mb-4">
                {STATUS_LABEL[s]}{" "}
                <span className="text-muted-foreground">
                  {tasks.filter((t) => t.status === s).length}
                </span>
              </h2>
              <div className="grid gap-2">{rows(tasks.filter((t) => t.status === s))}</div>
            </section>
          ))}
        </div>
      ) : (
        <div className="flow-panel grid gap-2">
          {rows(tasks)}
          {!tasks.length && <Empty>Nenhuma tarefa por aqui. Adicione seu próximo passo.</Empty>}
        </div>
      )}
      <TaskFormDialog
        open={open}
        onOpenChange={setOpen}
        defaults={{ status: status === "all" ? "todo" : (status as TaskStatus) }}
      />
    </>
  );
}
