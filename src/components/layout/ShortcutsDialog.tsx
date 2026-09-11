import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SHORTCUTS } from "@/config/nav";

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Atalhos</DialogTitle>
          <DialogDescription>Para fazer tudo sem sair do teclado.</DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
              <span className="text-sm">{s.description}</span>
              <kbd className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-semibold">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
