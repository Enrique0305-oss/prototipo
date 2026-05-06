<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\OrdenServicio;
use App\Models\Proyeccion;
use App\Models\Multicim;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations - Create automatic projections for existing service orders
     */
    public function up(): void
    {
        try {
            // Get all service orders without projections
            $ordenesServicio = OrdenServicio::with('cliente')
                ->whereNotIn('id', function($query) {
                    $query->select('id_referencia')
                        ->from('proyecciones')
                        ->where('tipo_orden', 'servicio');
                })
                ->where('estado', '!=', 'cancelada')
                ->get();

            // Get first multicim or create reference
            $primerMulticim = Multicim::first();
            $multicimId = $primerMulticim ? $primerMulticim->id : 1;

            // Create projection for each order
            foreach ($ordenesServicio as $orden) {
                $monto = $orden->total_costo;
                $montoDetrax = ($monto > 700) ? ($monto * 0.12) : 0;
                $totalFinal = $monto - $montoDetrax;

                Proyeccion::create([
                    'id_multicim' => $multicimId,
                    'tipo_orden' => 'servicio',
                    'id_referencia' => $orden->id,
                    'actividad' => null,
                    'n_factura' => null,
                    'dias_credito' => null,
                    'fecha_factura' => null,
                    'fecha_pago' => null,
                    'fecha_ejecucion' => $orden->fecha_tentativa,
                    'fecha_vcto' => null,
                    'dia_vencer' => null,
                    'monto_detrax' => $montoDetrax,
                    'total_final' => $totalFinal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            \Log::info("Creadas " . $ordenesServicio->count() . " proyecciones automáticas para órdenes de servicio existentes");
        } catch (\Exception $e) {
            \Log::error("Error en migración de proyecciones automáticas: " . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations
     */
    public function down(): void
    {
        try {
            // Delete projections that were created for service orders (no actividad, no n_factura)
            Proyeccion::where('tipo_orden', 'servicio')
                ->whereNull('actividad')
                ->whereNull('n_factura')
                ->whereNull('dias_credito')
                ->delete();
        } catch (\Exception $e) {
            \Log::error("Error reverting automatic projections: " . $e->getMessage());
        }
    }
};
