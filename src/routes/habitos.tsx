import { createFileRoute } from "@tanstack/react-router";
import { HabitsView } from "@/components/workspace/HabitsView";
export const Route = createFileRoute("/habitos")({ component: () => <HabitsView /> });
