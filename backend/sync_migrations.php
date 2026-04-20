<?php

use Illuminate\Support\Facades\DB;

// Obtener todas las migraciones del directorio
$migrationFiles = glob(__DIR__ . '/database/migrations/*.php');
$existingMigrations = [];

foreach ($migrationFiles as $file) {
    $filename = basename($file, '.php');
    $existingMigrations[] = $filename;
}

// Conectar a la BD manualmente
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$migrations = DB::table('migrations')->pluck('migration')->toArray();

$toInsert = [];
foreach ($existingMigrations as $migrationName) {
    if (!in_array($migrationName, $migrations)) {
        $toInsert[] = [
            'migration' => $migrationName,
            'batch' => 0,
        ];
    }
}

if (!empty($toInsert)) {
    // Insertar en chunks para evitar errores
    foreach (array_chunk($toInsert, 20) as $chunk) {
        DB::table('migrations')->insertOrIgnore($chunk);
    }
    echo "✓ Se marcaron " . count($toInsert) . " migraciones como completadas.\n";
} else {
    echo "ℹ No hay migraciones nuevas que marcar.\n";
}

// Listar migraciones registradas
$count = DB::table('migrations')->count();
echo "✓ Total de migraciones registradas: $count\n";
