<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$formatos = \App\Models\FormatoOperacional::where('estado', 'borrador')->get();
$deleted = 0;
foreach ($formatos as $f) {
    $detalles = $f->detalles;
    $vacio = true;
    foreach ($detalles as $d) {
        if (!empty(trim($d->ubicacion))) {
            $vacio = false;
            break;
        }
    }
    if ($vacio && $detalles->count() > 0) {
        $f->detalles()->delete();
        $f->delete();
        echo "Eliminado formato " . $f->id . "\n";
        $deleted++;
    }
}
echo "Total eliminados: $deleted\n";
