import { useApp } from "@/stores/app-store";
import { addDays, toISO, weekdayLabel, todayISO } from "@/lib/dates";
import { longestActiveStreak } from "@/lib/habits";
import { Panel, Empty } from "./shared";

export function ProgressView() {
  const { state } = useApp();
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6));
  const completed = state.tasks.filter((t) => t.status === "done");
  const count = (iso: string) =>
    completed.filter((t) => t.completedAt && toISO(new Date(t.completedAt)) === iso).length;
  const max = Math.max(1, ...days.map((d) => count(toISO(d))));
  return (
    <>
      <div className="flow-page-heading">
        <div>
          <p className="flow-eyebrow">CELEBRE OS PEQUENOS PASSOS</p>
          <h1>Meu Progresso</h1>
          <p>Observe sua caminhada, sem se comparar.</p>
        </div>
      </div>
      <div className="flow-stats">
        {[
          { label: "Tarefas concluídas", value: completed.length },
          {
            label: "Hábitos registrados hoje",
            value: state.habits.filter((h) => h.history.includes(todayISO())).length,
          },
          { label: "Maior sequência ativa", value: `${longestActiveStreak(state.habits)} dias` },
          {
            label: "Projetos concluídos",
            value: state.projects.filter((p) => p.status === "concluido").length,
          },
        ].map((s) => (
          <div key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Seus últimos 7 dias">
          <div className="flow-chart">
            {days.map((d) => (
              <div key={toISO(d)}>
                <span>{count(toISO(d))}</span>
                <div style={{ height: `${Math.max(3, (count(toISO(d)) / max) * 160)}px` }} />
                <span>{weekdayLabel(d)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Tarefas por data de conclusão.</p>
        </Panel>
        <Panel title="Onde você está colocando energia">
          {state.categories.map((c) => {
            const total = state.tasks.filter((t) => t.categoryId === c.id).length;
            return (
              <div className="mb-4" key={c.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{c.name}</span>
                  <span>{total} tarefas</span>
                </div>
                <progress
                  className="flow-progress"
                  max={Math.max(1, state.tasks.length)}
                  value={total}
                />
              </div>
            );
          })}
          {!state.tasks.length && <Empty>Seu progresso começa com o primeiro passo.</Empty>}
        </Panel>
      </div>
    </>
  );
}
