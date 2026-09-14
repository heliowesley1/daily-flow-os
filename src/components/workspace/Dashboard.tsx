import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Flame, Plus, Sun, Target } from "lucide-react";
import { useApp } from "@/stores/app-store";
import { todayISO, formatLongDate, greeting, formatTime } from "@/lib/dates";
import { dayProgress, todayTasks, overdueTasks } from "@/lib/tasks";
import { isHabitScheduled } from "@/lib/habits";
import { TaskRow } from "@/components/tasks/TaskRow";
import { Button } from "@/components/ui/button";
import { Panel, Empty, AddLine } from "./shared";

export function Dashboard() {
  const app = useApp();
  const { state } = app;
  const today = todayISO();
  const tasks = todayTasks(state.tasks).sort(
    (a, b) => Number(b.focus) - Number(a.focus) || a.order - b.order,
  );
  const overdue = overdueTasks(state.tasks);
  const habits = state.habits.filter((h) => isHabitScheduled(h, today));
  const events = state.events
    .filter((e) => e.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const progress = dayProgress(state.tasks, today);
  const [quick, setQuick] = useState("");
  return (
    <>
      <div className="flow-page-heading">
        <div>
          <p className="flow-eyebrow">{formatLongDate(new Date())}</p>
          <h1>
            {greeting()}, {state.profile.name} <span className="font-normal">☀</span>
          </h1>
          <p>Um novo dia para cuidar do que importa.</p>
        </div>
        <div
          className="flow-day-ring"
          style={{ background: `conic-gradient(var(--primary) ${progress}%, var(--muted) 0)` }}
        >
          <span>
            {progress}%<small>do seu dia</small>
          </span>
        </div>
      </div>
      <div className="flow-focus">
        <div className="flow-logo">
          <Sun size={22} />
        </div>
        <div>
          <p className="font-semibold mb-1">Seu foco de hoje</p>
          <p className="text-sm text-muted-foreground">
            {tasks.filter((t) => t.status !== "done").length} tarefas para hoje ·{" "}
            {habits.filter((h) => !h.history.includes(today)).length} hábitos para cuidar.
            {overdue.length > 0 && ` Você também tem ${overdue.length} tarefas atrasadas.`}
          </p>
        </div>
        <Link to="/semana" className="ml-auto hidden sm:flex items-center gap-2 text-sm">
          Planejar a semana <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="flow-stats">
        {[
          {
            label: "Tarefas concluídas",
            value: `${tasks.filter((t) => t.status === "done").length} / ${tasks.length}`,
            icon: CheckCircle2,
          },
          {
            label: "Hábitos de hoje",
            value: `${habits.filter((h) => h.history.includes(today)).length} / ${habits.length}`,
            icon: Flame,
          },
          { label: "Compromissos", value: events.length, icon: Sun },
          {
            label: "Projetos em andamento",
            value: state.projects.filter((p) => p.status === "ativo").length,
            icon: Target,
          },
        ].map((s) => (
          <div key={s.label}>
            <s.icon size={18} className="text-primary" />
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="flow-dashboard-grid">
        <div className="grid gap-5 content-start">
          <Panel
            title="Minhas tarefas de hoje"
            action={
              <Link to="/tarefas" className="text-xs text-muted-foreground">
                Ver todas ↗
              </Link>
            }
          >
            <div className="grid gap-2">
              {tasks
                .filter((t) => !state.preferences.hideCompleted || t.status !== "done")
                .map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              {!tasks.length && <Empty>Seu dia está livre. Qual é seu próximo passo?</Empty>}
            </div>
            <AddLine
              placeholder="Adicionar uma tarefa para hoje…"
              onAdd={(title) => app.addTask({ title, date: today })}
            />
          </Panel>
          {overdue.length > 0 && (
            <Panel title="Pendências para reorganizar">
              <div className="grid gap-2">
                {overdue.slice(0, 5).map((t) => (
                  <TaskRow key={t.id} task={t} showDate />
                ))}
              </div>
            </Panel>
          )}
          <Panel title="Notas rápidas">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (quick.trim()) {
                  app.setQuickNote(quick.trim());
                  setQuick("");
                }
              }}
            >
              <textarea
                className="flow-textarea min-h-24"
                aria-label="Nota rápida"
                placeholder="Uma ideia, um lembrete, algo para tirar da cabeça…"
                value={quick}
                onChange={(e) => setQuick(e.target.value)}
              />
              <Button size="sm" variant="outline" disabled={!quick.trim()}>
                <Plus size={14} />
                Guardar nota
              </Button>
            </form>
            <div className="grid gap-2 mt-4">
              {state.quickNotes.map((n) => (
                <div key={n.id} className="flex gap-3 rounded-lg bg-muted p-3 text-sm">
                  <p className="whitespace-pre-wrap flex-1">{n.content}</p>
                  <button
                    aria-label="Excluir nota rápida"
                    onClick={() => app.deleteQuickNote(n.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="grid gap-5 content-start">
          <Panel
            title="Pequenos hábitos, grandes mudanças"
            action={
              <Link to="/habitos">
                <ArrowUpRight size={17} />
              </Link>
            }
          >
            <div className="grid gap-3">
              {habits.map((h) => (
                <label key={h.id} className="flow-habit">
                  <input
                    type="checkbox"
                    checked={h.history.includes(today)}
                    onChange={() => app.toggleHabitDay(h.id)}
                  />
                  <div>
                    <strong>{h.name}</strong>
                    <p>{h.goal || "Um passo de cada vez"}</p>
                  </div>
                </label>
              ))}
              {!habits.length && (
                <Empty>
                  <Link to="/habitos">Crie seu primeiro hábito ↗</Link>
                </Empty>
              )}
            </div>
          </Panel>
          <Panel
            title="Na sua agenda"
            action={
              <Link to="/calendario">
                <ArrowUpRight size={17} />
              </Link>
            }
          >
            {events.map((e) => (
              <div className="flow-event" key={e.id}>
                <span>{formatTime(e.time, state.preferences.timeFormat)}</span>
                <div>
                  <strong>{e.title}</strong>
                  <p>{e.location || "Compromisso pessoal"}</p>
                </div>
              </div>
            ))}
            {!events.length && <Empty>Sem compromissos hoje.</Empty>}
          </Panel>
          <div className="flow-quote">
            “Você não precisa fazer tudo.
            <br />
            Só dar o próximo passo.”<span>NO SEU RITMO, TODOS OS DIAS.</span>
          </div>
        </div>
      </div>
    </>
  );
}
