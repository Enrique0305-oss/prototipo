class FormatoOperacionalDispositivo {
  const FormatoOperacionalDispositivo({
    required this.idProducto,
    required this.descripcion,
    required this.cantidadAsignada,
    this.unidadMedida,
    this.numeroLote,
  });

  final int idProducto;
  final String descripcion;
  final int cantidadAsignada;
  final String? unidadMedida;
  final String? numeroLote;

  factory FormatoOperacionalDispositivo.fromJson(Map<String, dynamic> json) {
    final producto = (json['producto'] as Map<String, dynamic>?) ?? const <String, dynamic>{};
    final lote = (json['lote'] as Map<String, dynamic>?) ?? const <String, dynamic>{};

    return FormatoOperacionalDispositivo(
      idProducto: (json['id_producto'] as num?)?.toInt() ?? 0,
      descripcion: _firstNonEmpty([
        json['descripcion'],
        producto['descripcion'],
        producto['nombre'],
        json['nombre_producto'],
        'Dispositivo',
      ]),
      cantidadAsignada: (json['cantidad_asignada'] as num?)?.toInt()
          ?? (json['cantidad'] as num?)?.toInt()
          ?? 1,
      unidadMedida: _firstNonEmptyOrNull([
        json['unidad_medida'],
        producto['unidad_medida'],
      ]),
      numeroLote: _firstNonEmptyOrNull([
        json['numero_lote'],
        lote['numero_lote'],
      ]),
    );
  }

  static String _firstNonEmpty(List<Object?> values) {
    for (final value in values) {
      final text = value?.toString().trim() ?? '';
      if (text.isNotEmpty) {
        return text;
      }
    }
    return 'Dispositivo';
  }

  static String? _firstNonEmptyOrNull(List<Object?> values) {
    for (final value in values) {
      final text = value?.toString().trim() ?? '';
      if (text.isNotEmpty) {
        return text;
      }
    }
    return null;
  }
}