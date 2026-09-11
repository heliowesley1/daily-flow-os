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
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/stores/app-store";

export function QuickNoteDialog({
  open,
  onOpenChange,
  noteId,
  initialContent = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId?: string;
  initialContent?: string;
}) {
  const { setQuickNote } = useApp();
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (open) setContent(initialContent);
  }, [open, initialContent]);

  const submit = () => {
    if (!content.trim()) {
      onOpenChange(false);
      return;
    }
    setQuickNote(content.trim(), noteId);
    toast.success("Nota salva");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nota rápida</DialogTitle>
          <DialogDescription>Escreva agora, organize depois.</DialogDescription>
        </DialogHeader>
        <Textarea
          autoFocus
          rows={6}
          value={content}
          placeholder="Uma ideia, um lembrete, um pensamento…"
          onChange={(e) => setContent(e.target.value)}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
