import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

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
    <Card className="flow-panel">
      <CardHeader className="flex flex-row items-center justify-between gap-3 p-0 mb-5 space-y-0">
        <CardTitle className="font-semibold tracking-tight text-base">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="modern-empty">
      <span>
        <Sparkles size={23} />
      </span>
      <p>{children}</p>
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
