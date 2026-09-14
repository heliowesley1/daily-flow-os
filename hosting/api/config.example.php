<?php
// Copie como config.php. Nunca publique estes valores em repositórios.
return [
    'db_host' => 'localhost',
    'db_port' => 3306,
    'db_name' => 'SEUUSUARIO_dailyflow',
    'db_user' => 'SEUUSUARIO_dailyflow',
    'db_password' => 'PREENCHA_A_SENHA_DO_BANCO',
    // Escolha uma chave aleatória com pelo menos 32 caracteres para a primeira instalação.
    // Após criar a conta, deixe vazio. Novas contas não podem ser criadas pela interface.
    'setup_key' => 'TROQUE_POR_UMA_CHAVE_ALEATORIA_DE_32_CARACTERES',
    // Mantenha true no domínio. false SOMENTE para desenvolvimento em localhost.
    'require_https' => true,
];
