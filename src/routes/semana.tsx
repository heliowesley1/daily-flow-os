import { createFileRoute } from "@tanstack/react-router";
import { PlannerView } from "@/components/workspace/PlannerView";
export const Route = createFileRoute("/semana")({ component: () => <PlannerView weekly /> });
