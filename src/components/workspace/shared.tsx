import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flow-panel">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
export function AddLine({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="flex gap-2 my-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          onAdd(value.trim());
          setValue("");
        }
      }}
    >
      <Input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={300}
      />
      <Button type="submit" size="icon" aria-label={placeholder} disabled={!value.trim()}>
        <Plus size={17} />
      </Button>
    </form>
  );
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
