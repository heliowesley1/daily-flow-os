import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/workspace/Dashboard";
export const Route = createFileRoute("/")({ component: Dashboard });
