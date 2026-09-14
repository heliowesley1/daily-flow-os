<?php
declare(strict_types=1);
// Uso por terminal: php scripts/reset-password.php /caminho/privado/config.php email
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if ($argc !== 3 || !is_file($argv[1])) { fwrite(STDERR, "Uso: php reset-password.php /caminho/api/config.php email\nA nova senha deve ser fornecida pela entrada padrão, nunca por argumento.\n"); exit(1); }
$config = require $argv[1];
fwrite(STDERR, "Nova senha (12 a 72 caracteres; a entrada poderá ficar visível neste terminal): ");
$password = rtrim((string)fgets(STDIN), "\r\n");
if (strlen($password) < 12 || strlen($password) > 72) { fwrite(STDERR, "Tamanho de senha inválido.\n"); exit(1); }
$db = new PDO('mysql:host='.$config['db_host'].';port='.(int)($config['db_port']??3306).';dbname='.$config['db_name'].';charset=utf8mb4', $config['db_user'], $config['db_password'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES=>false]);
$query=$db->prepare('UPDATE df_users SET password_hash=? WHERE email=?');
$query->execute([password_hash($password,PASSWORD_DEFAULT),strtolower(trim($argv[2]))]);
echo $query->rowCount() ? "Senha alterada.\n" : "Conta não encontrada.\n";
