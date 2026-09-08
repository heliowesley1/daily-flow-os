import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const ISO = "yyyy-MM-dd";

export const toISO = (date: Date) => format(date, ISO);
export const fromISO = (iso: string) => parseISO(iso);
export const todayISO = () => toISO(new Date());

export const weekStart = (date: Date, firstDay: 0 | 1 = 1) =>
  startOfWeek(date, { weekStartsOn: firstDay });

export const weekDays = (date: Date, firstDay: 0 | 1 = 1) =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart(date, firstDay), i));

export const monthGrid = (date: Date, firstDay: 0 | 1 = 1) => {
  const start = weekStart(startOfMonth(date), firstDay);
  const end = endOfMonth(date);
  const total = Math.ceil((differenceInCalendarDays(end, start) + 1) / 7) * 7;
  return Array.from({ length: total }, (_, i) => addDays(start, i));
};

export const formatLongDate = (date: Date) =>
  format(date, "EEEE, d 'de' MMMM", { locale: ptBR });

export const formatShortDate = (date: Date) => format(date, "d 'de' MMM", { locale: ptBR });

export const weekdayLabel = (date: Date) => format(date, "EEE", { locale: ptBR }).replace(".", "");

export const monthLabel = (date: Date) => format(date, "MMMM 'de' yyyy", { locale: ptBR });

export const formatTime = (time: string | null, timeFormat: "24h" | "12h" = "24h") => {
  if (!time) return null;
  if (timeFormat === "24h") return time;
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

export const isToday = (iso: string) => isSameDay(parseISO(iso), new Date());

export const isOverdue = (iso: string | null) =>
  !!iso && differenceInCalendarDays(new Date(), parseISO(iso)) > 0;

export { addDays, differenceInCalendarDays, isSameDay, format };
