import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { todayISO } from "@/lib/dates";
import { PRIORITY_LABEL } from "@/lib/tasks";
import { useApp } from "@/stores/app-store";
import type { Priority, Recurrence, Task, TaskStatus } from "@/types";

const RECURRENCES: { value: Recurrence["kind"]; label: string }[] = [
  { value: "none", label: "Não repete" },
  { value: "daily", label: "Todos os dias" },
  { value: "weekdays", label: "Dias de semana" },
  { value: "weekly", label: "Toda semana" },
  { value: "monthly", label: "Todo mês" },
];

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaults?: { date?: string | null; status?: TaskStatus; projectId?: string | null };
}

export function TaskFormDialog({ open, onOpenChange, task, defaults }: TaskFormDialogProps) {
  const { state, addTask, updateTask } = useApp();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [categoryId, setCategoryId] = useState<string>("none");
  const [projectId, setProjectId] = useState<string>("none");
  const [recurrence, setRecurrence] = useState<Recurrence["kind"]>("none");
  const [notes, setNotes] = useState("");
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setDate(task?.date ?? defaults?.date ?? todayISO());
    setTime(task?.time ?? "");
    setPriority(task?.priority ?? "media");
    setCategoryId(task?.categoryId ?? "none");
    setProjectId(task?.projectId ?? defaults?.projectId ?? "none");
    setRecurrence(task?.recurrence.kind ?? "none");
    setNotes(task?.notes ?? "");
    setFocus(task?.focus ?? false);
  }, [open, task, defaults?.date, defaults?.projectId]);

  const submit = () => {
    if (!title.trim()) {
      toast.error("Dê um nome para a tarefa");
      return;
    }
    const payload = {
      title: title.trim(),
      date: date || null,
      time: time || null,
      priority,
      categoryId: categoryId === "none" ? null : categoryId,
      projectId: projectId === "none" ? null : projectId,
      recurrence: { kind: recurrence } as Recurrence,
      notes,
      focus,
    };

    if (task) {
      updateTask(task.id, payload);
      toast.success("Tarefa atualizada");
    } else {
      addTask({ ...payload, status: defaults?.status ?? (date ? "todo" : "inbox") });
      toast.success("Tarefa criada");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          <DialogDescription>
            Preencha só o essencial — você pode ajustar os detalhes depois.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              autoFocus
              value={title}
              placeholder="Ex.: Finalizar apresentação"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="task-date">Data</Label>
              <Input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-time">Horário</Label>
              <Input
                id="task-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {state.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Recorrência</Label>
              <Select
                value={recurrence}
                onValueChange={(v) => setRecurrence(v as Recurrence["kind"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Projeto</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem projeto</SelectItem>
                  {state.projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-notes">Observação</Label>
            <Textarea
              id="task-notes"
              value={notes}
              rows={3}
              placeholder="Detalhes, links, contexto…"
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Marcar como prioridade do dia</p>
              <p className="text-xs text-muted-foreground">Aparece no topo do Meu Dia</p>
            </div>
            <Switch checked={focus} onCheckedChange={setFocus} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit}>{task ? "Salvar" : "Criar tarefa"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
