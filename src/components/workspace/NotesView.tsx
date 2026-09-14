import { useConfirm } from "@/components/common/ConfirmProvider";
import { SelectField } from "@/components/common/SelectField";
import { useState } from "react";
import { Plus, Star, Trash2, FileText } from "lucide-react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty } from "./shared";
export function NotesView() {
  const confirm = useConfirm();
  const { state, addNote, updateNote, deleteNote, toggleNoteFavorite } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(false);
  const notes = state.notes
    .filter(
      (n) =>
        (!favorites || n.favorite) &&
        (n.title + " " + n.content).toLowerCase().includes(query.toLowerCase()),
    )
    .sort(
      (a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt.localeCompare(a.updatedAt),
    );
  const note = state.notes.find((n) => n.id === selected);
  return (
    <>
      <div className="flow-page-heading">
        <div>
          <p className="flow-eyebrow">SEU SEGUNDO CÉREBRO</p>
          <h1>Notas & páginas</h1>
          <p>Ideias, planos, diário. Um lugar para pensar com calma.</p>
        </div>
        <Button onClick={() => setSelected(addNote({ title: "Sem título" }).id)}>
          <Plus size={16} />
          Nova página
        </Button>
      </div>
      <div className="flow-notes">
        <aside className="flow-panel">
          <Input
            aria-label="Pesquisar notas"
            placeholder="Buscar nas páginas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            className="my-3"
            variant={favorites ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFavorites(!favorites)}
          >
            <Star size={14} />
            Favoritas
          </Button>
          <div className="grid gap-1">
            {notes.map((n) => (
              <button
                key={n.id}
                className={`flow-note-link ${n.id === selected ? "selected" : ""}`}
                onClick={() => setSelected(n.id)}
              >
                <FileText size={16} />
                <span className="truncate">{n.title || "Sem título"}</span>
                {n.favorite && <Star size={12} className="ml-auto" />}
              </button>
            ))}
          </div>
          {!notes.length && <Empty>Nenhuma página encontrada.</Empty>}
        </aside>
        {note ? (
          <article className="flow-panel flow-editor">
            <div className="flex gap-3 items-center mb-7">
              <SelectField
                aria-label="Área da nota"
                value={note.categoryId ?? ""}
                onChange={(e) => updateNote(note.id, { categoryId: e.target.value || null })}
              >
                <option value="">Sem categoria</option>
                {state.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
              <span className="ml-auto text-xs text-muted-foreground">Salvamento automático</span>
              <button
                aria-label="Favoritar página"
                aria-pressed={note.favorite}
                onClick={() => toggleNoteFavorite(note.id)}
              >
                <Star size={18} fill={note.favorite ? "currentColor" : "none"} />
              </button>
              <button
                aria-label="Excluir página"
                onClick={async () => {
                  if (await confirm("Excluir esta página?")) {
                    deleteNote(note.id);
                    setSelected(null);
                  }
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
            <input
              className="flow-note-title"
              aria-label="Título da página"
              placeholder="Sem título"
              value={note.title}
              onChange={(e) => updateNote(note.id, { title: e.target.value })}
            />
            <textarea
              className="flow-note-body"
              aria-label="Conteúdo da página"
              placeholder="Comece a escrever. Este espaço é seu…"
              value={note.content}
              onChange={(e) => updateNote(note.id, { content: e.target.value })}
            />
          </article>
        ) : (
          <div className="flow-panel grid place-items-center">
            <Empty>Selecione uma página ou crie uma nova para começar.</Empty>
          </div>
        )}
      </div>
    </>
  );
}
