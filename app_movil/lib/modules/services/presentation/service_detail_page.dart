import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/config/app_config.dart';
import '../../../core/utils/distance_utils.dart';
import '../domain/service_task.dart';
import 'service_execution_page.dart';
import '../data/services_repository.dart';

class ServiceDetailPage extends StatefulWidget {
  const ServiceDetailPage({
    super.key,
    required this.service,
    required this.repository,
  });

  final ServiceTask service;
  final ServicesRepository repository;

  @override
  State<ServiceDetailPage> createState() => _ServiceDetailPageState();
}

class _ServiceDetailPageState extends State<ServiceDetailPage> {
  Position? _position;
  String? _locationError;
  bool _loading = true;

  double? get _distanceMeters {
    if (_position == null || widget.service.latitude == null || widget.service.longitude == null) {
      return null;
    }

    return DistanceUtils.distanceMeters(
      fromLat: _position!.latitude,
      fromLng: _position!.longitude,
      toLat: widget.service.latitude!,
      toLng: widget.service.longitude!,
    );
  }

  bool get _canStart {
    final distance = _distanceMeters;
    return distance != null && distance <= AppConfig.serviceGeofenceMeters;
  }

  @override
  void initState() {
    super.initState();
    _loadPosition();
  }

  Future<void> _loadPosition() async {
    setState(() {
      _loading = true;
      _locationError = null;
    });

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Activa el GPS para validar la ubicacion.');
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        throw Exception('Permiso de ubicacion denegado.');
      }

      final position = await Geolocator.getCurrentPosition();
      setState(() => _position = position);
    } catch (e) {
      setState(() => _locationError = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _startService() async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ServiceExecutionPage(service: widget.service, repository: widget.repository),
      ),
    );

    if (result == true && mounted) {
      Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final servicePoint = widget.service.latitude != null && widget.service.longitude != null
        ? LatLng(widget.service.latitude!, widget.service.longitude!)
        : null;

    final techPoint = _position != null ? LatLng(_position!.latitude, _position!.longitude) : null;

    return Scaffold(
      appBar: AppBar(title: const Text('Detalle del servicio')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.service.title, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 6),
                  Text(widget.service.client),
                  const SizedBox(height: 4),
                  Text(widget.service.address ?? 'Sin direccion'),
                  const SizedBox(height: 4),
                  Text('Estado actual: ${widget.service.status}'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text('Validacion por ubicacion', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          if (servicePoint == null)
            const Text('Este servicio no tiene coordenadas configuradas en backend.')
          else
            SizedBox(
              height: 280,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: FlutterMap(
                  options: MapOptions(
                    initialCenter: techPoint ?? servicePoint,
                    initialZoom: 16,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.qsci.appmovil',
                    ),
                    CircleLayer(
                      circles: [
                        CircleMarker(
                          point: servicePoint,
                          radius: AppConfig.serviceGeofenceMeters.toDouble(),
                          useRadiusInMeter: true,
                          color: Colors.green.withValues(alpha: 0.2),
                          borderStrokeWidth: 2,
                          borderColor: Colors.green,
                        ),
                      ],
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: servicePoint,
                          width: 42,
                          height: 42,
                          child: const Icon(Icons.place, color: Colors.red, size: 38),
                        ),
                        if (techPoint != null)
                          Marker(
                            point: techPoint,
                            width: 38,
                            height: 38,
                            child: const Icon(Icons.my_location, color: Colors.blue, size: 30),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 10),
          if (_loading)
            const LinearProgressIndicator()
          else if (_locationError != null)
            Text(_locationError!, style: const TextStyle(color: Colors.red))
          else if (_distanceMeters != null)
            Text(
              'Distancia al punto: ${_distanceMeters!.toStringAsFixed(1)} m '
              '(limite ${AppConfig.serviceGeofenceMeters} m)',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: _canStart ? Colors.green.shade700 : Colors.orange.shade800,
              ),
            ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _loadPosition,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Actualizar ubicacion'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton.icon(
                  onPressed: _canStart ? _startService : null,
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Empezar servicio'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
