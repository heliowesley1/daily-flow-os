import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ChevronDown,
  Keyboard,
  Menu,
  Plus,
  Search,
  Sparkles,
  Moon,
  Sun,
  CheckCircle2,
  FileText,
  CalendarDays,
  Flame,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { remoteEnabled, api } from "@/services/api";
import { Toaster } from "sonner";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/config/nav";
import { useApp } from "@/stores/app-store";
import { useAppearance } from "@/hooks/use-appearance";
import { useIsMobile } from "@/hooks/use-mobile";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { HabitFormDialog } from "@/components/habits/HabitFormDialog";
import { EventFormDialog } from "@/components/events/EventFormDialog";
import { QuickNoteDialog } from "./QuickNoteDialog";
import { CommandPalette } from "./CommandPalette";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function AppShell({ children }: { children: ReactNode }) {
  const {
    state,
    hydrated,
    storageBlocked,
    completeOnboarding,
    startEmpty,
    updatePreferences,
    saveStatus,
    retrySave,
  } = useApp();
  useAppearance();
  const isMobile = useIsMobile();
  const path = useLocation({ select: (l) => l.pathname });
  const [mobile, setMobile] = useState(false);
  const [dialog, setDialog] = useState("");
  const [name, setName] = useState("");
  const [areas, setAreas] = useState<string[]>(["Pessoal", "Saúde"]);
  useEffect(() => {
    setMobile(false);
  }, [path]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setDialog("search");
        return;
      }
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        (e.target as HTMLElement)?.closest(
          'input,textarea,select,[contenteditable="true"],[role="dialog"],[role="alertdialog"],[role="combobox"],[role="menu"],[role="listbox"]',
        )
      )
        return;
      const key = (
        { n: "task", h: "habit", c: "event", q: "note", "/": "search", "?": "help" } as Record<
          string,
          string
        >
      )[e.key.toLowerCase()];
      if (key) {
        e.preventDefault();
        setDialog(key);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const toggle = (open: boolean) => {
    if (!open) setDialog("");
  };
  const current = [...NAV_ITEMS, SETTINGS_ITEM].find((i) => i.to === path);
  if (!hydrated)
    return <div className="grid min-h-screen place-items-center">Preparando seu espaço…</div>;
  return (
    <div className="flow-app">
      {mobile && (
        <button
          className="flow-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside inert={isMobile && !mobile} className={`flow-sidebar ${mobile ? "is-open" : ""}`}>
        <Link to="/" className="flow-brand">
          <span className="flow-logo">
            <Sparkles size={21} />
          </span>{" "}
          daily flow<span className="text-xs text-muted-foreground font-normal">OS</span>
        </Link>
        <Link to="/configuracoes" className="flow-workspace">
          <span className="flow-avatar">{state.profile.name.slice(0, 1).toUpperCase()}</span>
          <div className="flex-1">
            <strong className="text-sm">{state.profile.name}</strong>
            <p className="text-xs text-muted-foreground">Meu espaço pessoal</p>
          </div>
          <ChevronDown size={14} />
        </Link>
        <button className="flow-search" onClick={() => setDialog("search")}>
          <Search size={16} />
          Buscar no espaço <kbd>Ctrl K</kbd>
        </button>
        <p className="flow-nav-label">MINHA VIDA</p>
        <nav className="grid gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flow-nav ${path === item.to ? "active" : ""}`}
            >
              <item.icon size={18} />
              {item.label}
              {item.to === "/tarefas" && (
                <span className="ml-auto text-xs">
                  {state.tasks.filter((t) => t.status !== "done").length}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <div className="flow-tip">
            <Sparkles size={18} />
            <p>
              Um pouco de foco.
              <br />
              <strong>Mais espaço para viver.</strong>
            </p>
          </div>
          <Link
            to={SETTINGS_ITEM.to}
            className={`flow-nav ${path === SETTINGS_ITEM.to ? "active" : ""}`}
          >
            <SETTINGS_ITEM.icon size={18} />
            Configurações
          </Link>
          <button className="flow-nav w-full" onClick={() => setDialog("help")}>
            <Keyboard size={18} />
            Atalhos de teclado
          </button>
          <p className="text-[11px] text-muted-foreground px-3 mt-3">
            <span className="status-dot" />
            {remoteEnabled ? "Espaço privado · MySQL" : "Espaço pessoal · Local"}
          </p>
          {remoteEnabled && (
            <Button
              className="w-full justify-start mt-3"
              variant="ghost"
              disabled={saveStatus !== "saved"}
              onClick={async () => {
                await api("logout", { method: "POST", body: {} });
                location.reload();
              }}
            >
              <LogOut size={16} />
              Sair da conta
            </Button>
          )}
        </div>
      </aside>
      <div className="flow-main">
        <header className="flow-topbar">
          <button className="md:hidden" aria-label="Abrir menu" onClick={() => setMobile(true)}>
            <Menu size={20} />
          </button>
          <span className="text-muted-foreground hidden sm:inline">Meu espaço</span>
          <span className="text-muted-foreground hidden sm:inline">/</span>
          <span>{current?.label ?? "Meu Dia"}</span>
          <div className="ml-auto flex gap-3">
            <span className="save-indicator" role="status">
              <span className="status-dot" />
              {saveStatus === "saved"
                ? "Tudo salvo"
                : saveStatus === "saving"
                  ? "Salvando…"
                  : "Falha ao salvar"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Alternar tema"
              onClick={() =>
                updatePreferences({
                  theme: document.documentElement.classList.contains("dark") ? "light" : "dark",
                })
              }
            >
              <Sun className="hidden dark:block" size={17} />
              <Moon className="dark:hidden" size={17} />
            </Button>
            <button aria-label="Buscar" onClick={() => setDialog("search")}>
              <Search size={18} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus size={16} />
                  Criar novo
                  <ChevronDown size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>O que vamos organizar?</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDialog("task")}>
                  <CheckCircle2 size={16} />
                  Tarefa <kbd className="ml-auto text-xs opacity-50">N</kbd>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialog("event")}>
                  <CalendarDays size={16} />
                  Compromisso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialog("habit")}>
                  <Flame size={16} />
                  Hábito
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialog("note")}>
                  <FileText size={16} />
                  Nota rápida
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flow-content">
          {saveStatus === "error" && (
            <div role="alert" className="flow-panel mb-5 flex flex-wrap gap-3 items-center text-sm">
              <p className="flex-1">
                As últimas alterações ainda não foram salvas. Tente novamente ou exporte um backup
                antes de sair.
              </p>
              <Button variant="outline" size="sm" onClick={retrySave}>
                Tentar salvar
              </Button>
              <Link to="/configuracoes" className="underline">
                Exportar backup
              </Link>
            </div>
          )}
          {storageBlocked && (
            <div role="alert" className="flow-panel mb-5">
              Não foi possível ler seus dados locais. O salvamento está pausado para preservar o
              original. Restaure um backup nas{" "}
              <Link to="/configuracoes" className="underline">
                configurações
              </Link>
              .
            </div>
          )}
          {children}
        </main>
      </div>
      <nav className="flow-bottom">
        {NAV_ITEMS.slice(0, 4).map((i) => (
          <Link key={i.to} to={i.to} className={path === i.to ? "text-primary" : ""}>
            <i.icon size={19} />
            <span>{i.to === "/" ? "Hoje" : i.label.replace("Minha ", "")}</span>
          </Link>
        ))}
        <button onClick={() => setMobile(true)}>
          <Menu size={19} />
          <span>Mais</span>
        </button>
      </nav>
      <TaskFormDialog open={dialog === "task"} onOpenChange={toggle} />
      <HabitFormDialog open={dialog === "habit"} onOpenChange={toggle} />
      <EventFormDialog open={dialog === "event"} onOpenChange={toggle} />
      <QuickNoteDialog open={dialog === "note"} onOpenChange={toggle} />
      <CommandPalette open={dialog === "search"} onOpenChange={toggle} />
      <ShortcutsDialog open={dialog === "help"} onOpenChange={toggle} />
      <Toaster richColors position="bottom-right" />
      <Dialog open={!state.onboarded && !storageBlocked}>
        <DialogContent showCloseButton={false}>
          <span className="flow-logo">
            <Sparkles />
          </span>
          <DialogTitle className="text-2xl">Sua vida, com mais espaço.</DialogTitle>
          <DialogDescription>
            Reúna sua rotina, ideias e planos em um lugar só. Como podemos chamar você?
          </DialogDescription>
          <Input
            aria-label="Seu nome"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
          <p className="text-sm">O que você quer organizar?</p>
          <div className="flex flex-wrap gap-2">
            {["Pessoal", "Trabalho", "Estudos", "Saúde", "Casa", "Finanças"].map((area) => (
              <Button
                key={area}
                variant={areas.includes(area) ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setAreas((a) => (a.includes(area) ? a.filter((x) => x !== area) : [...a, area]))
                }
              >
                {area}
              </Button>
            ))}
          </div>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              startEmpty();
              completeOnboarding({ name: name.trim(), focusAreas: areas });
            }}
          >
            Criar meu espaço <ArrowUpRight size={16} />
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              completeOnboarding({ name: name.trim() || "Visitante", focusAreas: areas })
            }
          >
            Explorar com dados de exemplo
          </Button>
          <p className="text-xs text-muted-foreground">
            {remoteEnabled
              ? "Seus dados ficam protegidos na sua conta, no seu servidor."
              : "Salvamento local. Exporte backups nas configurações para guardar seus dados."}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
