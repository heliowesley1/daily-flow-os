<?php
declare(strict_types=1);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

function respond(array $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}
function fail(string $message, int $code): never { respond(['error' => $message], $code); }
function body(): array {
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 8 * 1024 * 1024) fail('Seu espaço excedeu 8 MB. Exporte um backup e reduza os dados.', 413);
    $raw = file_get_contents('php://input', false, null, 0, 8 * 1024 * 1024 + 1);
    if ($raw === false || strlen($raw) > 8 * 1024 * 1024) fail('Requisição muito grande.', 413);
    $data = json_decode($raw, true);
    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) fail('JSON inválido.', 400);
    return $data;
}
function requireUser(): int {
    if (!isset($_SESSION['user_id'])) fail('Sua sessão expirou. Entre novamente para continuar.', 401);
    return (int)$_SESSION['user_id'];
}
function sessionInfo(PDO $db): array {
    $info = ['authenticated' => isset($_SESSION['user_id']), 'setupRequired' => (int)$db->query('SELECT COUNT(*) FROM df_users')->fetchColumn() === 0, 'csrf' => $_SESSION['csrf']];
    if ($info['authenticated']) {
        $query = $db->prepare('SELECT display_name, email FROM df_users WHERE id = ?');
        $query->execute([$_SESSION['user_id']]);
        $user = $query->fetch();
        if (!$user) { unset($_SESSION['user_id']); $info['authenticated'] = false; }
        else $info['user'] = ['name' => $user['display_name'], 'email' => $user['email']];
    }
    return $info;
}
function throttle(PDO $db, string $scope): void {
    $bucket = hash('sha256', $scope . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $db->exec('DELETE FROM df_login_attempts WHERE expires_at < UTC_TIMESTAMP()');
    $query = $db->prepare('INSERT INTO df_login_attempts (bucket, attempts, expires_at) VALUES (?, 1, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)) ON DUPLICATE KEY UPDATE attempts = attempts + 1');
    $query->execute([$bucket]);
    $query = $db->prepare('SELECT attempts FROM df_login_attempts WHERE bucket = ?');
    $query->execute([$bucket]);
    if ((int)$query->fetchColumn() > 10) { header('Retry-After: 900'); fail('Muitas tentativas. Aguarde 15 minutos e tente novamente.', 429); }
}
function validateState(array $state): void {
    if (($state['version'] ?? null) !== 1 || !is_bool($state['onboarded'] ?? null)) fail('Versão de dados incompatível.', 422);
    foreach (['profile','workspace','subscription','preferences','categories','tasks','habits','events','notes','quickNotes','projects','shoppingLists'] as $key) {
        if (!isset($state[$key]) || !is_array($state[$key])) fail('Estrutura de dados inválida: ' . $key, 422);
    }
    foreach (['categories','tasks','habits','events','notes','quickNotes','projects','shoppingLists'] as $key) {
        if (!array_is_list($state[$key]) || count($state[$key]) > 20000) fail('Lista de dados inválida.', 422);
        foreach ($state[$key] as $item) if (!is_array($item) || !is_string($item['id'] ?? null)) fail('Registro inválido.', 422);
    }
}

try {
    $configPath = __DIR__ . '/config.php';
    if (!is_file($configPath)) fail('Instalação pendente: copie api/config.example.php para api/config.php e configure o banco.', 503);
    $config = require $configPath;
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    if (($config['require_https'] ?? true) && !$https) fail('Acesse seu domínio por HTTPS para entrar com segurança.', 403);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', '28800');
    session_name('DAILYFLOWSESSID');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
    if (!session_start()) fail('Não foi possível iniciar a sessão. Confira session.save_path e as permissões do PHP na hospedagem.', 503);
    if (isset($_SESSION['last_seen']) && time() - $_SESSION['last_seen'] > 28800) {
        $_SESSION = []; session_regenerate_id(true);
    }
    $_SESSION['last_seen'] = time();
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    $dsn = 'mysql:host=' . $config['db_host'] . ';port=' . (int)($config['db_port'] ?? 3306) . ';dbname=' . $config['db_name'] . ';charset=utf8mb4';
    $db = new PDO($dsn, $config['db_user'], $config['db_password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $action = $_GET['action'] ?? 'session';
    if (!in_array($method, ['GET','POST','PUT'], true)) fail('Método não permitido.', 405);
    if ($method !== 'GET') {
        if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) fail('Use application/json.', 415);
        if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) fail('Sessão de segurança inválida. Recarregue a página.', 403);
    }
    if ($action === 'session' && $method === 'GET') respond(sessionInfo($db));
    if ($action === 'setup' && $method === 'POST') {
        throttle($db, 'setup'); $data = body();
        $key = (string)($config['setup_key'] ?? '');
        if (strlen($key) < 32 || str_starts_with($key, 'TROQUE_') || !is_string($data['setupKey'] ?? null) || !hash_equals($key, $data['setupKey'])) fail('Chave de instalação inválida. Confira o config.php.', 403);
        $email = strtolower(trim((string)($data['email'] ?? ''))); $name = trim((string)($data['name'] ?? '')); $password = (string)($data['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190 || $name === '' || strlen($name) > 100 || strlen($password) < 12 || strlen($password) > 72) fail('Informe nome, e-mail e uma senha de 12 a 72 caracteres.', 422);
        // Advisory lock prevents concurrent first-account creation.
        $lockName = 'df-setup-' . substr(hash('sha256', $config['db_name']), 0, 32);
        $lock = $db->prepare('SELECT GET_LOCK(?, 10)'); $lock->execute([$lockName]);
        if ((int)$lock->fetchColumn() !== 1) fail('Instalação em andamento. Tente novamente.', 409);
        try {
            if ((int)$db->query('SELECT COUNT(*) FROM df_users')->fetchColumn() !== 0) fail('Esta instalação já possui uma conta. Faça login.', 409);
            $query = $db->prepare('INSERT INTO df_users (email, display_name, password_hash) VALUES (?, ?, ?)');
            $query->execute([$email, $name, password_hash($password, PASSWORD_DEFAULT)]);
            $id = (int)$db->lastInsertId();
        } finally { $unlock = $db->prepare('SELECT RELEASE_LOCK(?)'); $unlock->execute([$lockName]); }
        session_regenerate_id(true); $_SESSION['user_id'] = $id; $_SESSION['csrf'] = bin2hex(random_bytes(32));
        respond(sessionInfo($db), 201);
    }
    if ($action === 'login' && $method === 'POST') {
        throttle($db, 'login'); $data = body();
        $email = strtolower(trim((string)($data['email'] ?? ''))); $password = (string)($data['password'] ?? '');
        if (strlen($email) > 190 || strlen($password) > 72) fail('E-mail ou senha incorretos.', 401);
        $query = $db->prepare('SELECT id, password_hash FROM df_users WHERE email = ?'); $query->execute([$email]); $user = $query->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) fail('E-mail ou senha incorretos.', 401);
        if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) { $query = $db->prepare('UPDATE df_users SET password_hash = ? WHERE id = ?'); $query->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]); }
        session_regenerate_id(true); $_SESSION['user_id'] = (int)$user['id']; $_SESSION['csrf'] = bin2hex(random_bytes(32));
        respond(sessionInfo($db));
    }
    if ($action === 'logout' && $method === 'POST') {
        $_SESSION = []; session_regenerate_id(true); $_SESSION['csrf'] = bin2hex(random_bytes(32));
        respond(['ok' => true]);
    }
    if ($action === 'state' && $method === 'GET') {
        $id = requireUser(); $query = $db->prepare('SELECT state_json, revision FROM df_workspaces WHERE user_id = ?'); $query->execute([$id]); $row = $query->fetch();
        respond(['state' => $row ? json_decode($row['state_json'], true, 512, JSON_THROW_ON_ERROR) : null, 'revision' => $row ? (int)$row['revision'] : 0]);
    }
    if ($action === 'state' && $method === 'PUT') {
        $id = requireUser(); $data = body();
        if (!isset($data['state']) || !is_array($data['state']) || !is_int($data['revision'] ?? null) || $data['revision'] < 0) fail('Dados ou revisão inválidos.', 422);
        validateState($data['state']); $json = json_encode($data['state'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR); $revision = $data['revision'];
        if ($revision === 0) {
            try { $query = $db->prepare('INSERT INTO df_workspaces (user_id, state_json, revision) VALUES (?, ?, 1)'); $query->execute([$id, $json]); }
            catch (PDOException $error) { if ($error->getCode() === '23000') fail('Este espaço já foi alterado em outro dispositivo. Recarregue antes de continuar.', 409); throw $error; }
        } else {
            $query = $db->prepare('UPDATE df_workspaces SET state_json = ?, revision = revision + 1 WHERE user_id = ? AND revision = ?'); $query->execute([$json, $id, $revision]);
            if ($query->rowCount() !== 1) fail('Este espaço foi alterado em outro dispositivo. Exporte um backup e recarregue antes de continuar.', 409);
        }
        respond(['revision' => $revision + 1]);
    }
    fail('Endpoint não encontrado.', 404);
} catch (Throwable $error) {
    error_log('Daily Flow API: ' . $error->getMessage());
    fail('Não foi possível acessar o servidor. Verifique o banco, o SQL importado e os logs do PHP no cPanel.', 500);
}

