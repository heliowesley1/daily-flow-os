import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  Flame,
  Plus,
  CalendarDays,
  Target,
  ArrowRight,
  Sparkles,
  Leaf,
  Check,
  Clock3,
} from "lucide-react";
import { useApp } from "@/stores/app-store";
import {
  todayISO,
  formatLongDate,
  greeting,
  formatTime,
  weekDays,
  toISO,
  weekdayLabel,
} from "@/lib/dates";
import { dayProgress, tasksForDate, overdueTasks } from "@/lib/tasks";
import { isHabitScheduled } from "@/lib/habits";
import { TaskRow } from "@/components/tasks/TaskRow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Panel, Empty, AddLine } from "./shared";

export function Dashboard() {
  const app = useApp();
  const { state } = app;
  const today = todayISO();
  const [selected, setSelected] = useState(today);
  const [tab, setTab] = useState("pending");
  const [quick, setQuick] = useState("");
  const tasks = tasksForDate(state.tasks, selected).sort(
    (a, b) => Number(b.focus) - Number(a.focus) || a.order - b.order,
  );
  const overdue = overdueTasks(state.tasks);
  const habits = state.habits.filter((h) => isHabitScheduled(h, today));
  const events = state.events
    .filter((e) => e.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));
  const progress = dayProgress(state.tasks, today);
  const filtered =
    tab === "late"
      ? overdue
      : tasks.filter((t) => (tab === "done" ? t.status === "done" : t.status !== "done"));
  return (
    <>
      <div className="flow-page-heading">
        <div>
          <p className="flow-eyebrow">
            <span className="status-dot" />
            {formatLongDate(new Date())}
          </p>
          <h1>
            {greeting()}, {state.profile.name}
            <span className="greeting-wave">✳</span>
          </h1>
          <p>Vamos abrir espaço para o que realmente importa.</p>
        </div>
        <Button variant="outline" asChild className="hidden sm:inline-flex">
          <Link to="/semana">
            <CalendarDays size={16} />
            Planejar semana
          </Link>
        </Button>
      </div>
      <section className="modern-hero">
        <div className="hero-copy">
          <Badge className="hero-badge">
            <Sparkles size={12} />
            SEU ESPAÇO, SEU RITMO
          </Badge>
          <h2>
            Menos ruído.
            <br />
            Mais <span>vida acontecendo.</span>
          </h2>
          <p>
            Um passo de cada vez também é progresso.
            <br />
            Escolha suas prioridades e deixe o resto com o seu planejamento.
          </p>
          <Button asChild className="hero-button">
            <Link to="/tarefas">
              Organizar minhas tarefas <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-progress">
            <div
              className="progress-orbit"
              style={{ background: `conic-gradient(#fff ${progress}%, #ffffff25 0)` }}
            >
              <span>
                <CheckCircle2 size={23} />
                <strong>{progress}%</strong>
                <small>do seu dia concluído</small>
              </span>
            </div>
          </div>
          <span className="floating-leaf">
            <Leaf size={24} />
          </span>
          <span className="floating-check">
            <Check size={19} />
            No seu tempo.
          </span>
          <span className="art-spark">✳</span>
        </div>
      </section>
      <div className="modern-stats">
        {[
          {
            label: "Tarefas de hoje",
            value: tasksForDate(state.tasks, today).filter((t) => t.status === "done").length,
            total: tasksForDate(state.tasks, today).length,
            icon: CheckCircle2,
            tone: "purple",
            detail: "Cada conclusão conta",
          },
          {
            label: "Hábitos em dia",
            value: habits.filter((h) => h.history.includes(today)).length,
            total: habits.length,
            icon: Flame,
            tone: "orange",
            detail: "Construa sua constância",
          },
          {
            label: "Na agenda",
            value: state.events.filter((e) => e.date === today).length,
            icon: CalendarDays,
            tone: "blue",
            detail: "Tempo para suas prioridades",
          },
          {
            label: "Projetos ativos",
            value: state.projects.filter((p) => p.status === "ativo").length,
            icon: Target,
            tone: "green",
            detail: "Ideias ganhando forma",
          },
        ].map((s) => (
          <div className="metric-card" key={s.label}>
            <div className={`metric-icon ${s.tone}`}>
              <s.icon size={20} />
            </div>
            <span className="metric-label">{s.label}</span>
            <div className="metric-value">
              {s.value}
              {s.total !== undefined && <small>/ {s.total}</small>}
            </div>
            <p>{s.detail}</p>
          </div>
        ))}
      </div>
      <div className="flow-dashboard-grid">
        <div className="grid gap-5 content-start">
          <Panel
            title="Seu planejamento"
            action={
              <Link className="subtle-link" to="/tarefas">
                Ver tudo <ArrowUpRight size={14} />
              </Link>
            }
          >
            <div className="week-picker">
              {weekDays(new Date(), state.preferences.firstDayOfWeek).map((d) => {
                const iso = toISO(d);
                return (
                  <button
                    key={iso}
                    onClick={() => setSelected(iso)}
                    aria-pressed={selected === iso}
                    className={selected === iso ? "selected" : ""}
                  >
                    <span>{weekdayLabel(d)}</span>
                    <strong>{d.getDate()}</strong>
                    <i className={state.tasks.some((t) => t.date === iso) ? "has-tasks" : ""} />
                  </button>
                );
              })}
            </div>
            <Tabs value={tab} onValueChange={setTab} className="mb-4">
              <TabsList className="planner-tabs">
                <TabsTrigger value="pending">
                  A fazer <span>{tasks.filter((t) => t.status !== "done").length}</span>
                </TabsTrigger>
                <TabsTrigger value="done">Concluídas</TabsTrigger>
                <TabsTrigger value="late">
                  Pendentes {overdue.length > 0 && <span>{overdue.length}</span>}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="grid gap-2">
              {filtered.map((t) => (
                <TaskRow key={t.id} task={t} showDate={tab === "late"} />
              ))}
              {!filtered.length && (
                <Empty>
                  {tab === "done"
                    ? "Cada pequeno passo merece ser celebrado."
                    : "Tudo em ordem por aqui. Que tal um próximo passo?"}
                </Empty>
              )}
            </div>
            <AddLine
              placeholder="Adicionar uma tarefa…"
              onAdd={(title) => app.addTask({ title, date: selected })}
            />
          </Panel>
          <Panel
            title="Capture uma ideia"
            action={<Badge variant="secondary">Notas rápidas</Badge>}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (quick.trim()) {
                  app.setQuickNote(quick.trim());
                  setQuick("");
                }
              }}
            >
              <Textarea
                className="quick-note-input"
                aria-label="Nota rápida"
                placeholder="O que está na sua cabeça? Ideias, lembretes, planos…"
                value={quick}
                onChange={(e) => setQuick(e.target.value)}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-muted-foreground">
                  Pensamentos livres, mente leve.
                </span>
                <Button size="sm" disabled={!quick.trim()}>
                  <Plus size={14} />
                  Guardar ideia
                </Button>
              </div>
            </form>
            <div className="note-snippets">
              {state.quickNotes.map((n) => (
                <article key={n.id}>
                  <span className="note-pin" />
                  <p>{n.content}</p>
                  <button
                    aria-label="Excluir nota rápida"
                    onClick={() => app.deleteQuickNote(n.id)}
                  >
                    ×
                  </button>
                </article>
              ))}
            </div>
          </Panel>
        </div>
        <div className="grid gap-5 content-start">
          <Panel
            title="Pequenos rituais"
            action={
              <span className="section-icon orange">
                <Flame size={18} />
              </span>
            }
          >
            <p className="section-description">Cuide de você, um hábito por vez.</p>
            <div>
              {habits.map((h) => (
                <label
                  key={h.id}
                  className={`modern-habit ${h.history.includes(today) ? "completed" : ""}`}
                >
                  <Checkbox
                    checked={h.history.includes(today)}
                    onCheckedChange={() => app.toggleHabitDay(h.id)}
                  />
                  <div>
                    <strong>{h.name}</strong>
                    <p>{h.goal || "Um compromisso com você"}</p>
                  </div>
                  {h.history.includes(today) && <span className="habit-done">Feito</span>}
                </label>
              ))}
            </div>
            {!habits.length && <Empty>Seu primeiro ritual começa aqui.</Empty>}
            <Button variant="ghost" asChild className="w-full mt-3 text-primary">
              <Link to="/habitos">
                Ver meus hábitos <ArrowRight size={14} />
              </Link>
            </Button>
          </Panel>
          <Panel
            title="Seu tempo, bem cuidado"
            action={
              <span className="section-icon blue">
                <Clock3 size={18} />
              </span>
            }
          >
            {events.map((e) => (
              <div className="modern-event" key={e.id}>
                <span className="event-dot" />
                <time>{formatTime(e.time, state.preferences.timeFormat)}</time>
                <div>
                  <strong>{e.title}</strong>
                  <p>{e.location || "Compromisso pessoal"}</p>
                </div>
              </div>
            ))}
            {!events.length && <Empty>Uma pausa na agenda também faz bem.</Empty>}
            <Link className="subtle-link mt-5" to="/calendario">
              Abrir calendário <ArrowUpRight size={14} />
            </Link>
          </Panel>
          <div className="modern-quote">
            <Sparkles size={22} />
            <p>
              Uma vida organizada começa
              <br />
              com espaço para respirar.
            </p>
            <span>O IMPORTANTE É CONTINUAR.</span>
          </div>
        </div>
      </div>
    </>
  );
}
