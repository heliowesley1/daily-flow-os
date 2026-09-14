# Daily Flow — instalar no seu domínio

Este pacote contém o site já compilado, uma API PHP e o script MySQL. Não exige Node.js ou npm na hospedagem.

## Requisitos

- Hospedagem cPanel com Apache/LiteSpeed, PHP **8.1 ou superior**, extensões `pdo_mysql`, `json` e `session`.
- MySQL 5.7.8+ ou MariaDB 10.4+.
- HTTPS ativo no domínio (SSL/AutoSSL do cPanel).
- `post_max_size` do PHP de pelo menos 12M. Cada workspace pode ter até 8 MB.

## 1. Criar e importar o banco

1. No cPanel, abra **Bancos de dados MySQL**.
2. Crie um banco, por exemplo `seuusuario_dailyflow`.
3. Crie um usuário do banco e uma senha forte. Associe esse usuário ao banco com os privilégios necessários (SELECT, INSERT, UPDATE e DELETE para o uso diário; a importação também precisa criar tabelas).
4. Abra **phpMyAdmin**, selecione esse banco e importe o arquivo **database.sql** que acompanha o ZIP.

O SQL não apaga tabelas existentes e não inclui senhas padrão. As tabelas usam o prefixo `df_`; instale em um banco dedicado. O workspace é guardado como um documento JSON versionado na tabela `df_workspaces`, preservando tarefas, páginas, compras, projetos, hábitos e preferências. `df_users` contém a conta; `df_login_attempts` limita tentativas de acesso.

## 2. Enviar os arquivos

No **Gerenciador de Arquivos**, abra a pasta do domínio (normalmente `public_html`). Envie **o conteúdo da pasta `web`**, não a pasta inteira. O resultado deve ser:

```text
public_html/
  index.html
  .htaccess
  assets/
  api/
    index.php
    config.example.php
    .htaccess
```

Também funciona dentro de uma subpasta, como `public_html/organizador/`. As rotas usam `#/tarefas`, `#/notas`, etc.; isso evita dependência de regras de reescrita. Não envie `database.sql`, o código-fonte ou arquivos de backup pessoal para a pasta pública.

## 3. Configurar a conexão

Na pasta `api`, copie `config.example.php` para **config.php** e altere:

```php
'db_host' => 'localhost',
'db_port' => 3306,
'db_name' => 'seuusuario_dailyflow',
'db_user' => 'seuusuario_dailyflow',
'db_password' => 'senha_do_usuario_do_banco',
'setup_key' => 'uma-chave-aleatoria-exclusiva-com-32-ou-mais-caracteres',
'require_https' => true,
```

Use os nomes completos do banco e usuário, incluindo o prefixo do cPanel. Se a hospedagem informa outro host/porta, utilize os valores fornecidos por ela. O arquivo `config.php` contém segredos: não compartilhe, não coloque no GitHub e mantenha a proteção `.htaccess` da pasta `api`.

## 4. Criar sua conta

1. Abra o domínio por **https://**.
2. Na primeira abertura, preencha nome, e-mail, senha e a mesma chave de instalação definida em `setup_key`.
3. Após criar a conta, edite `config.php` e deixe `'setup_key' => ''`.
4. Comece com um espaço vazio ou explore os dados de exemplo.

A criação de contas fica desativada após o primeiro usuário. As senhas são armazenadas com hash do PHP; não há senha padrão. Para recuperação de senha, use o script de terminal incluído no código-fonte (`scripts/reset-password.php`), com acesso administrativo ao servidor. Não há envio de e-mail de recuperação nesta versão.

## 5. Levar seus dados da versão local

Na versão local, abra **Configurações → Exportar backup**. No domínio, entre na sua conta e utilize **Importar backup**. Confirme a substituição e aguarde o indicador **Tudo salvo**. A mudança de domínio não transfere automaticamente o localStorage.

## Uso em mais de um dispositivo

Entre com a mesma conta no celular e no computador. Os dados são carregados do MySQL ao abrir o site. A gravação é automática, após uma breve pausa na edição; espere **Tudo salvo** antes de fechar ou sair.

Se dois dispositivos editarem a mesma versão, o segundo recebe um aviso de conflito e não sobrescreve silenciosamente o primeiro. Exporte um backup da edição pendente, recarregue e reaplique o necessário. Não há edição colaborativa em tempo real.

## Se aparecer um erro

- **Instalação pendente:** `api/config.php` ainda não existe.
- **Não foi possível acessar o servidor:** confira banco, usuário, senha, host, tabelas importadas e a extensão `pdo_mysql`. Consulte **Erros / Logs do PHP** no cPanel; a API não expõe credenciais na tela.
- **Acesse por HTTPS:** ative o SSL e use o endereço `https://`. Se houver proxy, peça à hospedagem para repassar corretamente o HTTPS ao PHP; não desative a verificação no domínio.
- **Chave inválida:** a chave em `setup_key` precisa ser exclusiva, ter pelo menos 32 caracteres e ser igual à digitada. O texto de exemplo não funciona.
- **Muitas tentativas:** aguarde 15 minutos.
- **Tela sem estilos:** envie também `assets/` e abra o `index.html` da pasta correta.
- **Falha ao salvar:** mantenha a página aberta, exporte um backup e confira a conexão. Uma sessão expira após 8 horas de inatividade.

## Backups e atualizações

Faça backups pelo aplicativo e pelo cPanel. Para atualizar o site, substitua os arquivos compilados e a API, **preservando `api/config.php` e o banco existente**. Não execute uma instalação do zero sobre dados que queira manter. Atualizações de esquema devem ser revisadas antes de importar.

O pacote utiliza shadcn/ui (Radix), React e Tailwind. Inclui tarefas, calendário, hábitos, compras, páginas de texto, projetos e progresso. Não inclui integrações de calendário externas, notificações por e-mail, anexos ou um editor completo de blocos do Notion.
