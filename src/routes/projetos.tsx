import { createFileRoute } from "@tanstack/react-router";
import { ProjectsView } from "@/components/workspace/ProjectsView";
export const Route = createFileRoute("/projetos")({ component: () => <ProjectsView /> });
