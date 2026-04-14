class ServiceTask {
  ServiceTask({
    required this.id,
    required this.title,
    required this.client,
    required this.date,
    required this.status,
    this.address,
    this.observations,
    this.startTime,
    this.endTime,
    this.latitude,
    this.longitude,
  });

  final int id;
  final String title;
  final String client;
  final String date;
  final String status;
  final String? address;
  final String? observations;
  final String? startTime;
  final String? endTime;
  final double? latitude;
  final double? longitude;

  bool get isCompleted => status.toLowerCase().contains('realizado');

  ServiceTask copyWith({
    String? status,
    String? observations,
  }) {
    return ServiceTask(
      id: id,
      title: title,
      client: client,
      date: date,
      status: status ?? this.status,
      address: address,
      observations: observations ?? this.observations,
      startTime: startTime,
      endTime: endTime,
      latitude: latitude,
      longitude: longitude,
    );
  }

  factory ServiceTask.fromJson(Map<String, dynamic> json) {
    final service = json['servicio'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final order = json['orden_servicio'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final clientMap = order['cliente'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final coords = _parseCoordinates((json['coordenadas'] ?? '').toString());

    return ServiceTask(
      id: (json['id'] ?? 0) as int,
      title: (service['nombre'] ?? 'Servicio').toString(),
      client: (clientMap['nombre_empresa'] ?? 'Cliente sin nombre').toString(),
      date: (json['fecha_programada'] ?? '').toString(),
      status: (json['estado_ejecucion'] ?? 'Programado').toString(),
      address: (json['direccion_completa'] ?? '').toString(),
      observations: (json['observaciones'] ?? '').toString(),
      startTime: (json['hora_inicio'] ?? '').toString(),
      endTime: (json['hora_fin'] ?? '').toString(),
      latitude: coords.$1,
      longitude: coords.$2,
    );
  }

  static (double?, double?) _parseCoordinates(String raw) {
    if (raw.trim().isEmpty) {
      return (null, null);
    }

    final parts = raw.split(',');
    if (parts.length != 2) {
      return (null, null);
    }

    final lat = double.tryParse(parts[0].trim());
    final lng = double.tryParse(parts[1].trim());
    return (lat, lng);
  }
}
