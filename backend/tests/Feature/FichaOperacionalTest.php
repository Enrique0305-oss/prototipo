<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\ProgramacionServicio;
use App\Models\Usuario;

class FichaOperacionalTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_ficha_borrador()
    {
        // Crear datos de prueba
        $usuario = Usuario::factory()->create();
        $programacion = ProgramacionServicio::factory()->create();

        // Actuar: POST para crear/guardar borrador
        $response = $this->postJson("/api/v1/programacion-servicio/{$programacion->id}/ficha", [
            'cliente' => 'Test Cliente',
            'direccion' => 'Test Dirección',
            'fecha' => now()->toDateString(),
            'hora_llegada' => '09:00:00',
            'hora_inicio' => '09:15:00',
            'hora_final' => '12:00:00',
            'diagnostico' => 'Test diagnosis',
            'giro' => 'Fumigación',
        ], [
            'Authorization' => 'Bearer fake_token'
        ]);

        // Assert
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'id',
            'id_programacion_servicio',
            'estado',
            'cliente',
            'created_at'
        ]);
    }

    public function test_can_get_existing_ficha()
    {
        // Crear datos de prueba
        $programacion = ProgramacionServicio::factory()->create();

        // Crear una ficha
        $ficha = $programacion->fichaOperacional()->create([
            'cliente' => 'Test Cliente',
            'estado' => 'borrador',
        ]);

        // Actuar: GET para recuperar
        $response = $this->getJson("/api/v1/programacion-servicio/{$programacion->id}/ficha", [
            'Authorization' => 'Bearer fake_token'
        ]);

        // Assert
        $response->assertStatus(200);
        $response->assertJson([
            'id' => $ficha->id,
            'cliente' => 'Test Cliente',
            'estado' => 'borrador'
        ]);
    }
}
