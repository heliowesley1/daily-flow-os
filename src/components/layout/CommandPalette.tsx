import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Flame,
  NotebookPen,
  Rocket,
  ShoppingCart,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/config/nav";
import { useApp } from "@/stores/app-store";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { state } = useApp();

  const go = (to: string) => {
    onOpenChange(false);
    void navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar tarefas, hábitos, notas, projetos…" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>

        <CommandGroup heading="Navegar">
          {[...NAV_ITEMS, SETTINGS_ITEM].map((item) => (
            <CommandItem key={item.to} value={`ir ${item.label}`} onSelect={() => go(item.to)}>
              <item.icon className="size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {state.tasks.length > 0 && (
          <CommandGroup heading="Tarefas">
            {state.tasks.slice(0, 12).map((task) => (
              <CommandItem key={task.id} value={`tarefa ${task.title}`} onSelect={() => go("/tarefas")}>
                <CheckCircle2 className="size-4" />
                {task.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {state.habits.length > 0 && (
          <CommandGroup heading="Hábitos">
            {state.habits.map((habit) => (
              <CommandItem key={habit.id} value={`hábito ${habit.name}`} onSelect={() => go("/habitos")}>
                <Flame className="size-4" />
                {habit.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {state.notes.length > 0 && (
          <CommandGroup heading="Notas">
            {state.notes.map((note) => (
              <CommandItem key={note.id} value={`nota ${note.title}`} onSelect={() => go("/notas")}>
                <NotebookPen className="size-4" />
                {note.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {state.projects.length > 0 && (
          <CommandGroup heading="Projetos">
            {state.projects.map((project) => (
              <CommandItem
                key={project.id}
                value={`projeto ${project.name}`}
                onSelect={() => go("/projetos")}
              >
                <Rocket className="size-4" />
                {project.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {state.shoppingLists.length > 0 && (
          <CommandGroup heading="Listas">
            {state.shoppingLists.map((list) => (
              <CommandItem key={list.id} value={`lista ${list.name}`} onSelect={() => go("/compras")}>
                <ShoppingCart className="size-4" />
                {list.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {state.events.length > 0 && (
          <CommandGroup heading="Compromissos">
            {state.events.slice(0, 10).map((event) => (
              <CommandItem
                key={event.id}
                value={`evento ${event.title}`}
                onSelect={() => go("/calendario")}
              >
                <CalendarDays className="size-4" />
                {event.title} · {event.time}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
