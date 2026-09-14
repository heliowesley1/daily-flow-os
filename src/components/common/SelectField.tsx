import { Children, isValidElement, type ReactNode } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Option = { value?: string | number; children?: ReactNode };
export function SelectField({
  value,
  onChange,
  children,
  className,
  "aria-label": label,
}: {
  value: string | number;
  onChange: (event: { target: { value: string } }) => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const options = Children.toArray(children).filter(isValidElement<Option>);
  return (
    <Select
      value={String(value) === "" ? "__empty__" : String(value)}
      onValueChange={(next) => onChange({ target: { value: next === "__empty__" ? "" : next } })}
    >
      <SelectTrigger aria-label={label} className={`modern-select ${className ?? ""}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option, index) => {
          const val = String(option.props.value ?? option.props.children ?? index);
          return (
            <SelectItem key={val} value={val || "__empty__"}>
              {option.props.children}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
