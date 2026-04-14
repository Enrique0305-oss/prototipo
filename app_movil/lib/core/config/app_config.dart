class AppConfig {
  // Sobrescribe este valor con --dart-define=API_BASE_URL=...
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000/api',
  );

  // Activa modo demo sin backend:
  // --dart-define=USE_MOCK_DATA=true
  static const bool useMockData = bool.fromEnvironment(
    'USE_MOCK_DATA',
    defaultValue: true,
  );

  // Si quieres filtrar por un tecnico fijo de prueba:
  // --dart-define=TECHNICIAN_ID=1
  static const int technicianId = int.fromEnvironment(
    'TECHNICIAN_ID',
    defaultValue: 0,
  );

  static const int serviceGeofenceMeters = 100;
}
