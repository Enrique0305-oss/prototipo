<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $view = view('InformeTecnicoPDF');
    $compiler = app('blade.compiler');
    $compiled = $compiler->compileString(file_get_contents(resource_path('views/InformeTecnicoPDF.blade.php')));
    echo "Syntax OK\n";
} catch (\Exception $e) {
    echo "Syntax Error: " . $e->getMessage() . "\n";
}
