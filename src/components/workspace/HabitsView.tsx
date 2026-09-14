import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApp } from "@/stores/app-store";
import {
  currentStreak,
  bestStreak,
  heatmapDays,
  frequencyLabel,
  isHabitScheduled,
} from "@/lib/habits";
import { todayISO } from "@/lib/dates";
import { HabitFormDialog } from "@/components/habits/HabitFormDialog";
import { Button } from "@/components/ui/button";
import { Empty, Panel } from "./shared";
import type { Habit } from "@/types";

export function HabitsView() {
  const { state, toggleHabitDay, deleteHabit } = useApp();
  const [open, setOpen] = useState(false);
  const [habit, setHabit] = useState<Habit | null>(null);
  return (
    <>
      <div className="flow-page-heading">
        <div>
          <p className="flow-eyebrow">CONSISTÊNCIA, SEM PRESSÃO</p>
          <h1>Hábitos</h1>
          <p>Pequenas escolhas que fazem bem para você.</p>
        </div>
        <Button
          onClick={() => {
            setHabit(null);
            setOpen(true);
          }}
        >
          <Plus size={16} />
          Novo hábito
        </Button>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        {state.habits.map((h) => (
          <Panel
            key={h.id}
            title={h.name}
            action={
              <div className="flex gap-3">
                <button
                  aria-label={`Editar ${h.name}`}
                  onClick={() => {
                    setHabit(h);
                    setOpen(true);
                  }}
                >
                  <Pencil size={15} />
                </button>
                <button
                  aria-label={`Excluir ${h.name}`}
                  onClick={() => {
                    if (window.confirm("Excluir este hábito e seu histórico?")) deleteHabit(h.id);
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            }
          >
            <p className="text-sm text-muted-foreground">
              {h.goal} · {frequencyLabel(h)}
            </p>
            <div className="flex items-center justify-between my-5">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={h.history.includes(todayISO())}
                  onChange={() => toggleHabitDay(h.id)}
                />
                Feito hoje
              </label>
              <span className="text-sm">
                🔥 {currentStreak(h)} dias · recorde {bestStreak(h)}
              </span>
            </div>
            <div className="flow-heatmap">
              {heatmapDays(h).map((d) => (
                <button
                  key={d.iso}
                  title={`${d.iso}: ${d.done ? "concluído" : "não concluído"}`}
                  aria-label={`${h.name} em ${d.iso}`}
                  aria-pressed={d.done}
                  className={d.done ? "done" : isHabitScheduled(h, d.iso) ? "" : "off"}
                  onClick={() => toggleHabitDay(h.id, d.iso)}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Últimos 91 dias · toque em um dia para registrar.
            </p>
          </Panel>
        ))}
      </div>
      {!state.habits.length && <Empty>Que pequeno hábito você gostaria de começar?</Empty>}
      <HabitFormDialog open={open} onOpenChange={setOpen} habit={habit} />
    </>
  );
}
