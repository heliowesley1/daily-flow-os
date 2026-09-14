import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/components/workspace/SettingsView";
export const Route = createFileRoute("/configuracoes")({ component: () => <SettingsView /> });
