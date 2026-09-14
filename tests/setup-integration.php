<?php
declare(strict_types=1);
// Only for the isolated local database initialized for this test run.
$password = trim(file_get_contents(__DIR__.'/../.test-runtime/db-secret.txt'));
$db = new PDO('mysql:host=127.0.0.1;port=33079;charset=utf8mb4','root',$password,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$db->exec('CREATE DATABASE IF NOT EXISTS dailyflow_integration CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
$db->exec('USE dailyflow_integration');
$db->exec(file_get_contents(__DIR__.'/../hosting/database.sql'));
$config=['db_host'=>'127.0.0.1','db_port'=>33079,'db_name'=>'dailyflow_integration','db_user'=>'root','db_password'=>$password,'setup_key'=>bin2hex(random_bytes(32)),'require_https'=>false];
file_put_contents(__DIR__.'/../.test-runtime/site/api/config.php',"<?php\nreturn ".var_export($config,true).";\n");
file_put_contents(__DIR__.'/../.test-runtime/setup-key.txt',$config['setup_key']);
echo "Banco de integração isolado preparado.\n";
