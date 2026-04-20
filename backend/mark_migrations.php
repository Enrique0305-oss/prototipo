<?php
// Script para marcar todas las migraciones base como completadas

$migraciones = [
    '0001_01_01_000000_create_users_table',
    '0001_01_01_000001_create_cache_table',
    '0001_01_01_000002_create_jobs_table',
    '0001_01_01_000003_create_failed_jobs_table',
    '2026_02_07_075051_create_personal_access_tokens_table',
];

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$db = $app->make('Illuminate\Database\ConnectionResolver')->connection();

foreach ($migraciones as $migration) {
    $db->table('migrations')->insertOrIgnore([
        'migration' => $migration,
        'batch' => 1,
    ]);
}

echo "✓ Todas las migraciones base han sido marcadas como completadas.\n";
