<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cotizacion = \App\Models\Cotizacion::where('numero_cotizacion', 'COT-2026-100')->first();
if ($cotizacion) {
    try {
        $request = Illuminate\Http\Request::create('/api/v1/cotizaciones/'.$cotizacion->id.'/pdf', 'GET');
        $kernelHttp = $app->make(Illuminate\Contracts\Http\Kernel::class);
        $response = $kernelHttp->handle($request);
        if ($response->status() !== 200) {
            echo "Status: " . $response->status() . "\n";
            echo $response->content();
        } else {
            echo "OK, PDF generated length: " . strlen($response->content());
        }
    } catch (\Throwable $e) {
        echo "Exception: " . $e->getMessage() . "\n";
        echo $e->getTraceAsString();
    }
} else {
    echo "Cotizacion not found";
}
