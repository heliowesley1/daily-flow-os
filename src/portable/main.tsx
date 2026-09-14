import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { AppStoreProvider } from "@/stores/app-store";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGate } from "@/components/auth/AuthGate";
import { ConfirmProvider } from "@/components/common/ConfirmProvider";
import { Dashboard } from "@/components/workspace/Dashboard";
import { TasksView } from "@/components/workspace/TasksView";
import { PlannerView } from "@/components/workspace/PlannerView";
import { HabitsView } from "@/components/workspace/HabitsView";
import { ShoppingView } from "@/components/workspace/ShoppingView";
import { NotesView } from "@/components/workspace/NotesView";
import { ProjectsView } from "@/components/workspace/ProjectsView";
import { ProgressView } from "@/components/workspace/ProgressView";
import { SettingsView } from "@/components/workspace/SettingsView";
import "@/styles.css";
const root = createRootRoute({
  component: () => (
    <AuthGate>
      <AppStoreProvider>
        <ConfirmProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </ConfirmProvider>
      </AppStoreProvider>
    </AuthGate>
  ),
});
const routes = [
  { path: "/", component: Dashboard },
  { path: "/tarefas", component: TasksView },
  { path: "/semana", component: () => <PlannerView weekly /> },
  { path: "/calendario", component: PlannerView },
  { path: "/habitos", component: HabitsView },
  { path: "/compras", component: ShoppingView },
  { path: "/notas", component: NotesView },
  { path: "/projetos", component: ProjectsView },
  { path: "/progresso", component: ProgressView },
  { path: "/configuracoes", component: SettingsView },
];
const routeTree = root.addChildren(
  routes.map((r) => createRoute({ getParentRoute: () => root, ...r })),
);
const router = createRouter({ routeTree, history: createHashHistory(), scrollRestoration: true });
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
