import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddLine, Empty, Panel } from "./shared";

export function ShoppingView() {
  const {
    state,
    addShoppingList,
    deleteShoppingList,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    clearBought,
  } = useApp();
  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("un");
  const list = state.shoppingLists.find((l) => l.id === selected) ?? state.shoppingLists[0];
  return (
    <>
      <div className="flow-page-heading">
        <div>
          <p className="flow-eyebrow">MENOS ESQUECIMENTOS</p>
          <h1>Compras</h1>
          <p>Do mercado aos planos de viagem, tudo na lista.</p>
        </div>
      </div>
      <div className="flow-notes">
        <Panel title="Minhas listas">
          <AddLine placeholder="Nome da nova lista" onAdd={addShoppingList} />
          {state.shoppingLists.map((l) => (
            <button
              className={`flow-note-link w-full ${l.id === list?.id ? "selected" : ""}`}
              key={l.id}
              onClick={() => setSelected(l.id)}
            >
              {l.name}
              <span className="ml-auto text-xs">{l.items.filter((i) => !i.bought).length}</span>
            </button>
          ))}
        </Panel>
        {list ? (
          <Panel
            title={list.name}
            action={
              <button
                aria-label="Excluir lista"
                onClick={() => {
                  if (window.confirm("Excluir esta lista e todos os itens?"))
                    deleteShoppingList(list.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            }
          >
            <form
              className="flow-shopping-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim() && Number(quantity) > 0) {
                  addShoppingItem(list.id, { name: name.trim(), quantity: Number(quantity), unit });
                  setName("");
                }
              }}
            >
              <Input
                aria-label="Item de compra"
                placeholder="Adicionar item…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                aria-label="Quantidade"
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <select aria-label="Unidade" value={unit} onChange={(e) => setUnit(e.target.value)}>
                {["un", "kg", "g", "L", "pacote"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
              <Button type="submit">Adicionar</Button>
            </form>
            {[false, true].map((bought) => (
              <div key={String(bought)} className="mt-5">
                <div className="flex justify-between mb-3 text-sm font-semibold">
                  <h3>{bought ? "Já comprado" : "Para comprar"}</h3>
                  {bought && list.items.some((i) => i.bought) && (
                    <button
                      className="text-xs text-muted-foreground"
                      onClick={() => {
                        if (window.confirm("Remover os itens já comprados?")) clearBought(list.id);
                      }}
                    >
                      Limpar comprados
                    </button>
                  )}
                </div>
                {list.items
                  .filter((i) => i.bought === bought)
                  .map((i) => (
                    <div className="flow-shopping-item" key={i.id}>
                      <input
                        aria-label={`Comprar ${i.name}`}
                        type="checkbox"
                        checked={i.bought}
                        onChange={() => toggleShoppingItem(list.id, i.id)}
                      />
                      <span className={i.bought ? "line-through opacity-50" : ""}>{i.name}</span>
                      <span className="ml-auto text-muted-foreground text-sm">
                        {i.quantity} {i.unit}
                      </span>
                      <button
                        aria-label={`Excluir ${i.name}`}
                        onClick={() => deleteShoppingItem(list.id, i.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            ))}
            {!list.items.length && <Empty>O que você precisa comprar?</Empty>}
          </Panel>
        ) : (
          <Empty>Crie uma lista para começar.</Empty>
        )}
      </div>
    </>
  );
}
