<?php
$formatos = \App\Models\FormatoOperacional::where('estado', 'borrador')->get();
foreach ($formatos as $f) {
    // Si todos los detalles tienen ubicacion vacía, lo eliminamos para que herede de nuevo
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
    }
}
