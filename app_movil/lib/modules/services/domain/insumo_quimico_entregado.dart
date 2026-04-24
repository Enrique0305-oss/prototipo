/// Representa un insumo químico que fue entregado por almacén
/// para una programación de servicio.
class InsumoQuimicoEntregado {
  const InsumoQuimicoEntregado({
    required this.idProducto,
    required this.producto,
    required this.lote,
    required this.fechaVencimiento,
    required this.unidad,
    required this.cantidadEntregada,
  });

  final int idProducto;
  final String producto;
  final String lote;
  final String fechaVencimiento;
  final String unidad;
  final int cantidadEntregada;

  factory InsumoQuimicoEntregado.fromJson(Map<String, dynamic> json) {
    return InsumoQuimicoEntregado(
      idProducto: (json['id_producto'] as num?)?.toInt() ?? 0,
      producto: (json['producto'] ?? 'Producto').toString(),
      lote: (json['lote'] ?? '').toString(),
      fechaVencimiento: (json['fecha_vencimiento'] ?? '').toString(),
      unidad: (json['unidad'] ?? '').toString(),
      cantidadEntregada: (json['cantidad_entregada'] as num?)?.toInt() ?? 0,
    );
  }
}
