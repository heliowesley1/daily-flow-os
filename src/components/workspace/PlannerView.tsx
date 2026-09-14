import { SelectField } from "@/components/common/SelectField";
import { useState } from "react";
import { addMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useApp } from "@/stores/app-store";
import {
  addDays,
  weekDays,
  monthGrid,
  toISO,
  todayISO,
  monthLabel,
  weekdayLabel,
  formatTime,
} from "@/lib/dates";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { EventFormDialog } from "@/components/events/EventFormDialog";
import { Button } from "@/components/ui/button";
import type { CalendarEvent, Task } from "@/types";
export function PlannerView({ weekly = false }: { weekly?: boolean }) {
  const { state, moveTaskToDate } = useApp();
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState(weekly ? "week" : "month");
  const [category, setCategory] = useState("all");
  const [taskOpen, setTaskOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [selected, setSelected] = useState(todayISO());
  const [task, setTask] = useState<Task | null>(null);
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const days =
    mode === "month"
      ? monthGrid(date, state.preferences.firstDayOfWeek)
      : mode === "week"
        ? weekDays(date, state.preferences.firstDayOfWeek)
        : [date];
  const step = (direction: number) =>
    setDate((d) =>
      mode === "month"
        ? addMonths(d, direction)
        : addDays(d, direction * (mode === "week" ? 7 : 1)),
    );
  return (
    <>
      <div className="flow-page-heading">
        <div>
          <p className="flow-eyebrow">ESPAÇO PARA O QUE IMPORTA</p>
          <h1>{weekly ? "Minha Semana" : "Calendário"}</h1>
          <p>Encontre o equilíbrio entre seus planos e seu tempo.</p>
        </div>
        <Button
          onClick={() => {
            setEvent(null);
            setSelected(toISO(date));
            setEventOpen(true);
          }}
        >
          <Plus size={16} />
          Compromisso
        </Button>
      </div>
      <div className="flow-toolbar">
        <Button
          variant="outline"
          size="icon"
          aria-label="Período anterior"
          onClick={() => step(-1)}
        >
          <ChevronLeft size={16} />
        </Button>
        <h2 className="font-semibold capitalize">{monthLabel(date)}</h2>
        <Button variant="outline" size="icon" aria-label="Próximo período" onClick={() => step(1)}>
          <ChevronRight size={16} />
        </Button>
        <Button variant="outline" onClick={() => setDate(new Date())}>
          Hoje
        </Button>
        <SelectField aria-label="Período" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="month">Mês</option>
          <option value="week">Semana</option>
          <option value="day">Dia</option>
        </SelectField>
        <SelectField
          aria-label="Filtrar área"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Todas as áreas</option>
          {state.categories.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
      </div>
      <div className={`flow-calendar ${mode === "day" ? "single-day" : ""}`}>
        {days.map((day) => {
          const iso = toISO(day);
          return (
            <section
              key={iso}
              className={`flow-calendar-day ${iso === todayISO() ? "is-today" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                moveTaskToDate(e.dataTransfer.getData("text/plain"), iso);
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  {weekdayLabel(day)}{" "}
                  <strong className="text-foreground text-lg ml-1">{day.getDate()}</strong>
                </span>
                <button
                  aria-label={`Adicionar tarefa em ${iso}`}
                  onClick={() => {
                    setSelected(iso);
                    setTask(null);
                    setTaskOpen(true);
                  }}
                >
                  <Plus size={15} />
                </button>
              </div>
              {state.events
                .filter((e) => e.date === iso && (category === "all" || e.categoryId === category))
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((e) => (
                  <button
                    className="flow-calendar-event"
                    key={e.id}
                    onClick={() => {
                      setEvent(e);
                      setEventOpen(true);
                    }}
                  >
                    {formatTime(e.time, state.preferences.timeFormat)} · {e.title}
                  </button>
                ))}
              {state.tasks
                .filter(
                  (t) =>
                    t.date === iso &&
                    (category === "all" || t.categoryId === category) &&
                    (!state.preferences.hideCompleted || t.status !== "done"),
                )
                .map((t) => (
                  <button
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                    key={t.id}
                    className={`flow-calendar-task ${t.status === "done" ? "line-through opacity-50" : ""}`}
                    onClick={() => {
                      setTask(t);
                      setTaskOpen(true);
                    }}
                  >
                    ○ {t.time && `${formatTime(t.time, state.preferences.timeFormat)} · `}
                    {t.title}
                  </button>
                ))}
              <button
                className="text-xs text-muted-foreground mt-4"
                onClick={() => {
                  setSelected(iso);
                  setEvent(null);
                  setEventOpen(true);
                }}
              >
                + evento
              </button>
            </section>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Arraste tarefas entre dias ou clique para editar a data. Compromissos aparecem em destaque.
      </p>
      <TaskFormDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        task={task}
        defaults={{ date: selected }}
      />
      <EventFormDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        event={event}
        defaultDate={selected}
      />
    </>
  );
}
