<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Migrations\Migrator;
use SplFileInfo;

class MarkMigrationsCommand extends Command
{
    protected $signature = 'migrate:mark-existing';
    protected $description = 'Mark all existing migration files as completed';

    public function handle()
    {
        // Obtener lista de todos los archivos de migración
        $migrationPath = database_path('migrations');
        $files = scandir($migrationPath);
        
        $alreadyRecorded = DB::table('migrations')->pluck('migration')->toArray();
        $toInsert = [];

        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $migrationName = str_replace('.php', '', $file);
            
            if (!in_array($migrationName, $alreadyRecorded)) {
                $toInsert[] = [
                    'migration' => $migrationName,
                    'batch' => 0,
                ];
            }
        }

        if (!empty($toInsert)) {
            // Insertar en chunks
            foreach (array_chunk($toInsert, 50) as $chunk) {
                DB::table('migrations')->insertOrIgnore($chunk);
            }
            $this->info("✓ Se marcaron " . count($toInsert) . " migraciones como completadas.");
        } else {
            $this->info("ℹ Todas las migraciones ya están registradas.");
        }

        // Mostrar total
        $total = DB::table('migrations')->count();
        $this->info("✓ Total de migraciones registradas: {$total}");
    }
}
