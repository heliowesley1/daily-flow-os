import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "@/stores/app-store";
import { projectProgress } from "@/lib/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskRow } from "@/components/tasks/TaskRow";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { AddLine, Empty, Panel } from "./shared";
import type { ProjectStatus } from "@/types";

export function ProjectsView() {
  const { state, addProject, updateProject, deleteProject } = useApp();
  const [projectId, setProjectId] = useState<string | null>(null);
  return (
    <>
      <div className="flow-page-heading">
        <div>
          <p className="flow-eyebrow">DÊ VIDA AOS SEUS PLANOS</p>
          <h1>Projetos</h1>
          <p>Transforme grandes ideias em próximos passos.</p>
        </div>
      </div>
      <div className="max-w-lg mb-6">
        <AddLine placeholder="Nome do novo projeto…" onAdd={(name) => addProject({ name })} />
      </div>
      <div className="grid xl:grid-cols-2 gap-5">
        {state.projects.map((p) => (
          <Panel
            title="Projeto pessoal"
            key={p.id}
            action={
              <button
                aria-label={`Excluir projeto ${p.name}`}
                onClick={() => {
                  if (window.confirm("Excluir o projeto? As tarefas serão mantidas."))
                    deleteProject(p.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            }
          >
            <Input
              className="text-lg font-semibold border-0 px-0"
              aria-label="Nome do projeto"
              value={p.name}
              onChange={(e) => updateProject(p.id, { name: e.target.value })}
            />
            <textarea
              className="flow-textarea mt-2"
              aria-label="Descrição do projeto"
              placeholder="O que você quer realizar?"
              value={p.description}
              onChange={(e) => updateProject(p.id, { description: e.target.value })}
            />
            <div className="flex flex-wrap gap-3 my-4">
              <select
                aria-label="Status do projeto"
                value={p.status}
                onChange={(e) => updateProject(p.id, { status: e.target.value as ProjectStatus })}
              >
                <option value="ativo">Em andamento</option>
                <option value="pausado">Pausado</option>
                <option value="concluido">Concluído</option>
              </select>
              <Input
                className="w-auto"
                aria-label="Prazo do projeto"
                type="date"
                value={p.deadline ?? ""}
                onChange={(e) => updateProject(p.id, { deadline: e.target.value || null })}
              />
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span>Progresso das tarefas</span>
              <span>{projectProgress(state.tasks, p.id)}%</span>
            </div>
            <progress
              className="flow-progress"
              max={100}
              value={projectProgress(state.tasks, p.id)}
            />
            <div className="grid gap-2 my-4">
              {state.tasks
                .filter((t) => t.projectId === p.id)
                .map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setProjectId(p.id)}>
              <Plus size={14} />
              Adicionar tarefa
            </Button>
          </Panel>
        ))}
      </div>
      {!state.projects.length && <Empty>Qual plano você quer tirar do papel?</Empty>}
      <TaskFormDialog
        open={!!projectId}
        onOpenChange={(open) => {
          if (!open) setProjectId(null);
        }}
        defaults={{ projectId }}
      />
    </>
  );
}
