import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Flame,
  NotebookPen,
  Rocket,
  Settings,
  Sparkles,
  ShoppingCart,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: typeof Sparkles;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Meu Dia", icon: Sparkles },
  { to: "/semana", label: "Minha Semana", icon: CalendarRange },
  { to: "/tarefas", label: "Tarefas", icon: CheckCircle2 },
  { to: "/habitos", label: "Hábitos", icon: Flame },
  { to: "/compras", label: "Compras", icon: ShoppingCart },
  { to: "/notas", label: "Notas", icon: NotebookPen },
  { to: "/projetos", label: "Projetos", icon: Rocket },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
  { to: "/progresso", label: "Meu Progresso", icon: BarChart3 },
];

export const SETTINGS_ITEM: NavItem = { to: "/configuracoes", label: "Configurações", icon: Settings };

export const MOBILE_ITEMS: NavItem[] = [
  { to: "/", label: "Hoje", icon: Sparkles },
  { to: "/semana", label: "Semana", icon: CalendarRange },
  { to: "/tarefas", label: "Tarefas", icon: CheckCircle2 },
  { to: "/habitos", label: "Hábitos", icon: Flame },
];

export const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: "N", description: "Nova tarefa" },
  { keys: "H", description: "Novo hábito" },
  { keys: "C", description: "Novo compromisso" },
  { keys: "Q", description: "Nota rápida" },
  { keys: "/", description: "Busca" },
  { keys: "⌘/Ctrl + K", description: "Command palette" },
];
