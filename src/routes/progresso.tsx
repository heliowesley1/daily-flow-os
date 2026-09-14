import { createFileRoute } from "@tanstack/react-router";
import { ProgressView } from "@/components/workspace/ProgressView";
export const Route = createFileRoute("/progresso")({ component: () => <ProgressView /> });
