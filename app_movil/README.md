# App Movil Tecnicos

Base inicial de app Flutter para tecnicos, conectada al backend Laravel en la carpeta backend.

## Flujo implementado

1. Login de tecnico por API.
2. Listado de servicios programados para el dia actual.
3. Detalle de servicio con mapa y validacion de distancia.
4. Habilitacion de Empezar servicio solo dentro de 100 metros.
5. Vista de servicio en curso con fotos y observaciones.
6. Finalizacion de servicio con cambio a estado terminado en backend.

## Estructura principal

- lib/core/config/app_config.dart: Configuracion de API y geocerca.
- lib/core/network/api_client.dart: Cliente HTTP centralizado.
- lib/modules/auth: Login y sesion.
- lib/modules/services: Listado, detalle georreferenciado y ejecucion.

## Endpoints usados

- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/programacion-servicio?fecha=YYYY-MM-DD
- GET /api/v1/programacion-servicio/{id}
- PATCH /api/v1/programacion-servicio/{id}/completar

## Configuracion local

Por defecto la app inicia en modo visual/demo (sin backend), para poder revisar pantallas y flujo UX.

Si quieres forzar explicitamente el modo demo:

```bash
flutter run --dart-define=USE_MOCK_DATA=true
```

Cuando ya tengas backend local y quieras usar login/API real:

```bash
flutter run --dart-define=USE_MOCK_DATA=false --dart-define=API_BASE_URL=http://10.0.2.2:8000/api
```

La URL base por defecto para API real es:

- http://10.0.2.2:8000/api

Puedes cambiarla en runtime con dart-define:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.20:8000/api
```

Si quieres filtrar servicios por tecnico fijo para pruebas:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.20:8000/api --dart-define=TECHNICIAN_ID=1
```

## Levantar backend + app

Backend Laravel:

```bash
cd ../backend
php artisan serve --host=0.0.0.0 --port=8000
```

Flutter:

```bash
flutter pub get
flutter run
```

## Notas de alcance actual

- Las fotos actualmente se manejan en interfaz local para flujo UX.
- El cierre de servicio si se persiste por API mediante completar.
- Si luego se requiere subida de fotos al backend, se recomienda un endpoint tipo:
	- POST /api/v1/programacion-servicio/{id}/evidencias (multipart/form-data)
