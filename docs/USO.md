# Daily Flow — uso e desenvolvimento

Aplicação pessoal em português, construída sobre o projeto existente (React, TanStack Start, Vite, TypeScript e shadcn/ui).

## Começar

Na primeira abertura, informe seu nome e escolha entre um espaço vazio e dados de exemplo. Os exemplos só são usados como ponto de partida; não são enviados para nenhum servidor.

- **Meu Dia:** tarefas de hoje, pendências, hábitos, agenda e notas rápidas.
- **Tarefas:** criação e edição, status, subtarefas, categorias, prioridades, recorrência e visualização em lista ou Kanban. Arraste para reordenar ou mudar o status; no celular, use o formulário de edição.
- **Semana / Calendário:** mês, semana e dia; crie tarefas e compromissos por data. Arraste tarefas entre dias ou edite a data no formulário.
- **Hábitos:** frequência, objetivo, registro diário e histórico de 91 dias. Clique nos quadrados para corrigir um registro.
- **Compras:** múltiplas listas, quantidade, unidade, itens pendentes e comprados.
- **Notas & páginas:** editor de texto simples com salvamento automático, pesquisa, categorias e favoritos.
- **Projetos:** descrição, prazo, status e tarefas relacionadas com progresso calculado.
- **Meu Progresso:** tarefas por data de conclusão e distribuição entre áreas.
- **Configurações:** perfil, tema, cor, preferências, categorias e backups.

Atalhos fora dos campos de texto: `N` tarefa, `H` hábito, `C` compromisso, `Q` nota rápida, `/` ou `Ctrl/Cmd + K` busca e `?` ajuda.

## Persistência e limites

Os dados são salvos automaticamente na chave `focal.state.v1` do localStorage, mantendo compatibilidade com o modelo original. Exporte um backup JSON nas configurações antes de limpar o navegador, mudar de endereço ou trocar de dispositivo. O arquivo contém todos os registros pessoais e deve ser guardado em local privado.

Importar um backup valida sua estrutura e solicita confirmação antes de substituir os registros. Falhas de gravação aparecem na interface. Se a leitura falhar, o salvamento fica bloqueado para não sobrescrever o conteúdo original; restaure um backup ou limpe o espaço conscientemente pelas configurações.

Esta versão não oferece login, sincronização na nuvem, colaboração, notificações ou integrações externas. As páginas são documentos de texto, sem o editor de blocos e bancos de dados do Notion. A camada `PersistenceAdapter` permite acrescentar um backend posteriormente.

Uma tarefa recorrente cria a próxima ocorrência ao ser concluída, preservando a anterior no histórico. Não são criadas todas as ocorrências futuras de uma vez. Concluir, reabrir e concluir novamente não duplica a próxima ocorrência. Para hábitos de meta semanal, o indicador de sequência representa dias consecutivos registrados; a frequência semanal aparece como meta.

## Executar localmente

Use Node.js 24 ou superior:

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5180
```

Abra `http://127.0.0.1:5180`.

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Os testes de domínio verificam validação e restauração de backups, falha de armazenamento, recorrência, prevenção de duplicação e sequência de hábitos em dias úteis. O executor usa os hooks nativos do Node 24 para resolver os aliases TypeScript.

## Publicação

A configuração de hospedagem original do Lovable foi preservada. `npm run build` gera `.output` para o alvo configurado pelo projeto. Atualizações na branch conectada são sincronizadas com o editor Lovable; publicar o endereço público depende do acesso ao projeto de hospedagem. Não envie `.npm-cache`, `node_modules`, arquivos de backup pessoal ou `.output` para o Git.
