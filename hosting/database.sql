-- Daily Flow OS · MySQL 5.7.8+ / MySQL 8 / MariaDB 10.4+
-- Crie o banco no cPanel e selecione-o no phpMyAdmin antes de importar.
-- Não apaga tabelas nem cria senhas ou usuários padrão.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS df_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_df_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documento de workspace versionado: preserva todos os campos, notas e históricos
-- do modelo da aplicação. revision impede sobrescrita concorrente entre dispositivos.
CREATE TABLE IF NOT EXISTS df_workspaces (
  user_id INT UNSIGNED NOT NULL,
  state_json LONGTEXT NOT NULL,
  revision BIGINT UNSIGNED NOT NULL DEFAULT 1,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_df_workspace_user FOREIGN KEY (user_id) REFERENCES df_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS df_login_attempts (
  bucket CHAR(64) NOT NULL,
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (bucket), KEY idx_df_attempt_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
