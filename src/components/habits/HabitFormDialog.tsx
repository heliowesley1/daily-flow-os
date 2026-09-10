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
import { useApp } from "@/stores/app-store";
import type { Habit, HabitFrequency } from "@/types";

const FREQUENCIES: { value: string; label: string }[] = [
  { value: "daily", label: "Todos os dias" },
  { value: "weekdays", label: "Dias de semana" },
  { value: "weekly-3", label: "3x por semana" },
  { value: "weekly-5", label: "5x por semana" },
];

const toFrequency = (value: string): HabitFrequency => {
  if (value === "weekdays") return { kind: "weekdays" };
  if (value === "weekly-3") return { kind: "weekly", times: 3 };
  if (value === "weekly-5") return { kind: "weekly", times: 5 };
  return { kind: "daily" };
};

const fromFrequency = (frequency: HabitFrequency) => {
  if (frequency.kind === "weekdays") return "weekdays";
  if (frequency.kind === "weekly") return frequency.times >= 5 ? "weekly-5" : "weekly-3";
  return "daily";
};

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
}

export function HabitFormDialog({ open, onOpenChange, habit }: HabitFormDialogProps) {
  const { state, addHabit, updateHabit } = useApp();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [categoryId, setCategoryId] = useState("none");

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? "");
    setGoal(habit?.goal ?? "");
    setFrequency(habit ? fromFrequency(habit.frequency) : "daily");
    setCategoryId(habit?.categoryId ?? "none");
  }, [open, habit]);

  const submit = () => {
    if (!name.trim()) {
      toast.error("Dê um nome ao hábito");
      return;
    }
    const payload = {
      name: name.trim(),
      goal,
      frequency: toFrequency(frequency),
      categoryId: categoryId === "none" ? null : categoryId,
    };
    if (habit) {
      updateHabit(habit.id, payload);
      toast.success("Hábito atualizado");
    } else {
      addHabit(payload);
      toast.success("Hábito criado");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{habit ? "Editar hábito" : "Novo hábito"}</DialogTitle>
          <DialogDescription>Comece pequeno — consistência vale mais que volume.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="habit-name">Nome</Label>
            <Input
              id="habit-name"
              autoFocus
              value={name}
              placeholder="Ex.: Beber 2L de água"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="habit-goal">Objetivo</Label>
            <Input
              id="habit-goal"
              value={goal}
              placeholder="Ex.: 20 minutos por dia"
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Frequência</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
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
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit}>{habit ? "Salvar" : "Criar hábito"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
