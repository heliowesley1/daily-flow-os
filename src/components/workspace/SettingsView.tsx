import { useConfirm } from "@/components/common/ConfirmProvider";
import { remoteEnabled } from "@/services/api";
import { SelectField } from "@/components/common/SelectField";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/stores/app-store";
import { parseBackup } from "@/services/backup";
import { todayISO } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddLine, Panel, Field } from "./shared";
import type { AccentKey, ThemeMode } from "@/types";
export function SettingsView() {
  const confirm = useConfirm();
  const {
    state,
    updateProfile,
    updatePreferences,
    addCategory,
    updateCategory,
    deleteCategory,
    replaceState,
    startEmpty,
  } = useApp();
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-flow-backup-${todayISO()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Backup exportado");
  };
  return (
    <>
      <div className="flow-page-heading">
        <div>
          <p className="flow-eyebrow">DO SEU JEITO</p>
          <h1>Configurações</h1>
          <p>Um espaço que combina com sua rotina.</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Seu perfil">
          <Field label="Como podemos chamar você?">
            <Input
              value={state.profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              maxLength={80}
            />
          </Field>
          <p className="text-sm text-muted-foreground mt-5">
            {remoteEnabled
              ? "Seu espaço é privado e salvo no MySQL da sua hospedagem. Entre com a mesma conta para acessar em outro dispositivo."
              : "Seu espaço é pessoal e fica salvo neste navegador. Use o pacote cPanel para ativar login e salvamento no servidor."}
          </p>
        </Panel>
        <Panel title="Aparência">
          <div className="grid gap-4">
            <Field label="Tema">
              <SelectField
                value={state.preferences.theme}
                onChange={(e) => updatePreferences({ theme: e.target.value as ThemeMode })}
              >
                <option value="system">Automático</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </SelectField>
            </Field>
            <Field label="Cor de destaque">
              <SelectField
                value={state.preferences.accent}
                onChange={(e) => updatePreferences({ accent: e.target.value as AccentKey })}
              >
                {Object.entries({
                  frost: "Azul",
                  sage: "Verde",
                  amber: "Âmbar",
                  rose: "Rosa",
                  violet: "Violeta",
                  graphite: "Grafite",
                }).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </SelectField>
            </Field>
          </div>
        </Panel>
        <Panel title="Sua rotina">
          <div className="grid gap-4">
            <Field label="Primeiro dia da semana">
              <SelectField
                value={state.preferences.firstDayOfWeek}
                onChange={(e) =>
                  updatePreferences({ firstDayOfWeek: Number(e.target.value) as 0 | 1 })
                }
              >
                <option value={1}>Segunda-feira</option>
                <option value={0}>Domingo</option>
              </SelectField>
            </Field>
            <Field label="Formato de horário">
              <SelectField
                value={state.preferences.timeFormat}
                onChange={(e) => updatePreferences({ timeFormat: e.target.value as "24h" | "12h" })}
              >
                <option value="24h">24 horas</option>
                <option value="12h">12 horas</option>
              </SelectField>
            </Field>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={state.preferences.hideCompleted}
                onChange={(e) => updatePreferences({ hideCompleted: e.target.checked })}
              />
              Ocultar tarefas concluídas
            </label>
          </div>
        </Panel>
        <Panel title="Áreas da sua vida">
          <div className="grid gap-2">
            {state.categories.map((c) => (
              <div className="flex gap-2" key={c.id}>
                <Input
                  aria-label="Nome da categoria"
                  value={c.name}
                  onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                />
                <Button
                  aria-label={`Excluir categoria ${c.name}`}
                  variant="ghost"
                  onClick={async () => {
                    if (
                      await confirm("Excluir categoria? Os registros serão mantidos sem categoria.")
                    )
                      deleteCategory(c.id);
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
          <AddLine placeholder="Nova área da vida" onAdd={(name) => addCategory({ name })} />
        </Panel>
        <Panel title="Seus dados, com você">
          <p className="text-sm text-muted-foreground mb-4">
            {remoteEnabled
              ? "Mantenha uma cópia independente dos seus dados. Exporte backups regularmente e faça também o backup do banco no cPanel."
              : "Exporte um backup regularmente. Limpar os dados do navegador remove seu espaço. Você pode importar o arquivo em outro dispositivo."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={download}>
              <Download size={16} />
              Exportar backup
            </Button>
            <label className="flow-import">
              <Upload size={16} />
              Importar backup
              <input
                className="sr-only"
                type="file"
                accept=".json,application/json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    if (file.size > 10000000) throw new Error("O backup deve ter até 10 MB.");
                    const backup = parseBackup(await file.text());
                    if (
                      await confirm(
                        "Substituir os dados atuais por este backup? Exporte os dados atuais antes de continuar.",
                      )
                    ) {
                      replaceState(backup);
                      toast.success("Backup restaurado");
                    }
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Backup inválido");
                  }
                }}
              />
            </label>
          </div>
        </Panel>
        <Panel title="Recomeçar">
          <p className="text-sm text-muted-foreground mb-4">
            Apaga tarefas, hábitos, notas, projetos, compromissos e compras. Seu perfil e
            preferências são preservados.
          </p>
          <Button
            variant="destructive"
            onClick={async () => {
              if (
                await confirm(
                  "Apagar todos os registros pessoais? Esta ação não pode ser desfeita. Exporte um backup antes.",
                )
              ) {
                startEmpty();
                toast.success("Seu espaço está pronto para recomeçar");
              }
            }}
          >
            Limpar meu espaço
          </Button>
        </Panel>
      </div>
    </>
  );
}
