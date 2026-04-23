class FichaOperacional {
  final int? id;
  final int idProgramacionServicio;
  final int? idGrupoProgramacion;
  final String estado; // 'borrador' o 'completada'
  final String? cliente;
  final String? direccion;
  final String? fecha;
  final String? horaLlegada;
  final String? horaInicio;
  final String? horaFinal;
  final String? giro;
  final String? diagnostico;
  final String? condicionSanitaria;
  final List<String>? actividadesRealizadas;
  final List<String>? equipos;
  final List<Map<String, dynamic>>? insumosUtilizados;
  final List<String>? areasTratadas;
  final String? accionesCorrectivas;
  final String? recomendaciones;
  final Map<String, dynamic>? firmas;
  final String? observaciones;
  final String? createdAt;
  final String? updatedAt;
  final String? fechaFinalizacion;

  FichaOperacional({
    this.id,
    required this.idProgramacionServicio,
    this.idGrupoProgramacion,
    this.estado = 'borrador',
    this.cliente,
    this.direccion,
    this.fecha,
    this.horaLlegada,
    this.horaInicio,
    this.horaFinal,
    this.giro,
    this.diagnostico,
    this.condicionSanitaria,
    this.actividadesRealizadas,
    this.equipos,
    this.insumosUtilizados,
    this.areasTratadas,
    this.accionesCorrectivas,
    this.recomendaciones,
    this.firmas,
    this.observaciones,
    this.createdAt,
    this.updatedAt,
    this.fechaFinalizacion,
  });

  // Crear desde JSON
  factory FichaOperacional.fromJson(Map<String, dynamic> json) {
    return FichaOperacional(
      id: json['id'] as int?,
      idProgramacionServicio: json['id_programacion_servicio'] as int? ?? 0,
      idGrupoProgramacion: json['id_grupo_programacion'] as int?,
      estado: json['estado'] as String? ?? 'borrador',
      cliente: json['cliente'] as String?,
      direccion: json['direccion'] as String?,
      fecha: json['fecha'] as String?,
      horaLlegada: json['hora_llegada'] as String?,
      horaInicio: json['hora_inicio'] as String?,
      horaFinal: json['hora_final'] as String?,
      giro: json['giro'] as String?,
      diagnostico: json['diagnostico'] as String?,
      condicionSanitaria: json['condicion_sanitaria'] as String?,
      actividadesRealizadas: List<String>.from(
        (json['actividades_realizadas'] as List?)?.map((x) => x.toString()) ?? [],
      ),
      equipos: List<String>.from(
        (json['equipos'] as List?)?.map((x) => x.toString()) ?? [],
      ),
      insumosUtilizados: (json['insumos_utilizados'] as List?)
          ?.map((x) => x as Map<String, dynamic>)
          .toList(),
      areasTratadas: List<String>.from(
        (json['areas_tratadas'] as List?)?.map((x) => x.toString()) ?? [],
      ),
      accionesCorrectivas: json['acciones_correctivas'] as String?,
      recomendaciones: json['recomendaciones'] as String?,
      firmas: json['firmas'] as Map<String, dynamic>?,
      observaciones: json['observaciones'] as String?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
      fechaFinalizacion: json['fecha_finalizacion'] as String?,
    );
  }

  // Convertir a JSON para enviar al backend
  Map<String, dynamic> toJson() {
    return {
      'id_programacion_servicio': idProgramacionServicio,
      'id_grupo_programacion': idGrupoProgramacion,
      'estado': estado,
      'cliente': cliente,
      'direccion': direccion,
      'fecha': fecha,
      'hora_llegada': horaLlegada,
      'hora_inicio': horaInicio,
      'hora_final': horaFinal,
      'giro': giro,
      'diagnostico': diagnostico,
      'condicion_sanitaria': condicionSanitaria,
      'actividades_realizadas': actividadesRealizadas,
      'equipos': equipos,
      'insumos_utilizados': insumosUtilizados,
      'areas_tratadas': areasTratadas,
      'acciones_correctivas': accionesCorrectivas,
      'recomendaciones': recomendaciones,
      'firmas': firmas,
      'observaciones': observaciones,
    };
  }

  // Copiar con cambios
  FichaOperacional copyWith({
    int? id,
    int? idProgramacionServicio,
    int? idGrupoProgramacion,
    String? estado,
    String? cliente,
    String? direccion,
    String? fecha,
    String? horaLlegada,
    String? horaInicio,
    String? horaFinal,
    String? giro,
    String? diagnostico,
    String? condicionSanitaria,
    List<String>? actividadesRealizadas,
    List<String>? equipos,
    List<Map<String, dynamic>>? insumosUtilizados,
    List<String>? areasTratadas,
    String? accionesCorrectivas,
    String? recomendaciones,
    Map<String, dynamic>? firmas,
    String? observaciones,
    String? createdAt,
    String? updatedAt,
    String? fechaFinalizacion,
  }) {
    return FichaOperacional(
      id: id ?? this.id,
      idProgramacionServicio: idProgramacionServicio ?? this.idProgramacionServicio,
      idGrupoProgramacion: idGrupoProgramacion ?? this.idGrupoProgramacion,
      estado: estado ?? this.estado,
      cliente: cliente ?? this.cliente,
      direccion: direccion ?? this.direccion,
      fecha: fecha ?? this.fecha,
      horaLlegada: horaLlegada ?? this.horaLlegada,
      horaInicio: horaInicio ?? this.horaInicio,
      horaFinal: horaFinal ?? this.horaFinal,
      giro: giro ?? this.giro,
      diagnostico: diagnostico ?? this.diagnostico,
      condicionSanitaria: condicionSanitaria ?? this.condicionSanitaria,
      actividadesRealizadas: actividadesRealizadas ?? this.actividadesRealizadas,
      equipos: equipos ?? this.equipos,
      insumosUtilizados: insumosUtilizados ?? this.insumosUtilizados,
      areasTratadas: areasTratadas ?? this.areasTratadas,
      accionesCorrectivas: accionesCorrectivas ?? this.accionesCorrectivas,
      recomendaciones: recomendaciones ?? this.recomendaciones,
      firmas: firmas ?? this.firmas,
      observaciones: observaciones ?? this.observaciones,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      fechaFinalizacion: fechaFinalizacion ?? this.fechaFinalizacion,
    );
  }

  // Verificar si es borrador
  bool get isBorrador => estado == 'borrador';

  // Verificar si está completada
  bool get isCompletada => estado == 'completada';
}
