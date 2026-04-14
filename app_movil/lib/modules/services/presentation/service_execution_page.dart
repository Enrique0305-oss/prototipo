import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../data/services_repository.dart';
import '../domain/service_task.dart';

class ServiceExecutionPage extends StatefulWidget {
  const ServiceExecutionPage({
    super.key,
    required this.service,
    required this.repository,
  });

  final ServiceTask service;
  final ServicesRepository repository;

  @override
  State<ServiceExecutionPage> createState() => _ServiceExecutionPageState();
}

class _ServiceExecutionPageState extends State<ServiceExecutionPage> {
  final _observationController = TextEditingController();
  final _picker = ImagePicker();
  final List<XFile> _photos = <XFile>[];
  bool _saving = false;

  _StatusPalette _paletteForStatus(String status) {
    final normalized = status.toLowerCase();
    if (normalized.contains('cancel')) {
      return const _StatusPalette(colors: [Color(0xFFF35454), Color(0xFFE11E1E)]);
    }
    if (normalized.contains('realizado') || normalized.contains('complet')) {
      return const _StatusPalette(colors: [Color(0xFF18B89A), Color(0xFF12A56E)]);
    }
    if (normalized.contains('program')) {
      return const _StatusPalette(colors: [Color(0xFF3F7EF0), Color(0xFF2B5FDE)]);
    }
    return const _StatusPalette(colors: [Color(0xFF4E6283), Color(0xFF394E6D)]);
  }

  @override
  void dispose() {
    _observationController.dispose();
    super.dispose();
  }

  Future<void> _addFromGallery() async {
    final picked = await _picker.pickMultiImage(imageQuality: 75);
    if (picked.isEmpty) return;
    setState(() => _photos.addAll(picked));
  }

  Future<void> _takePhoto() async {
    final photo = await _picker.pickImage(source: ImageSource.camera, imageQuality: 75);
    if (photo == null) return;
    setState(() => _photos.add(photo));
  }

  Future<void> _finalizeService() async {
    setState(() => _saving = true);
    try {
      await widget.repository.completeService(
        id: widget.service.id,
        observations: _observationController.text.trim().isEmpty
            ? null
            : _observationController.text.trim(),
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Servicio finalizado correctamente')),
      );
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final palette = _paletteForStatus(widget.service.status);
    final hasSchedule =
        (widget.service.startTime != null && widget.service.startTime!.trim().isNotEmpty) ||
        (widget.service.endTime != null && widget.service.endTime!.trim().isNotEmpty);
    final schedule = hasSchedule
        ? '${(widget.service.startTime ?? '').trim()} - ${(widget.service.endTime ?? '').trim()}'
        : null;

    return Scaffold(
      appBar: AppBar(title: const Text('Servicio en curso')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: palette.colors,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.service.client,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 24,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  widget.service.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 20,
                  ),
                ),
                if (schedule != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    schedule,
                    style: const TextStyle(
                      color: Color(0xE6FFFFFF),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  widget.service.address ?? 'Sin direccion',
                  style: const TextStyle(color: Color(0xE6FFFFFF)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _addFromGallery,
                  icon: const Icon(Icons.photo_library_outlined),
                  label: const Text('Galeria'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton.icon(
                  onPressed: _takePhoto,
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: const Text('Camara'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Evidencias (${_photos.length})',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          if (_photos.isEmpty)
            const Text('Aun no hay fotos agregadas')
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _photos.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemBuilder: (context, index) {
                return ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.file(
                    File(_photos[index].path),
                    fit: BoxFit.cover,
                  ),
                );
              },
            ),
          const SizedBox(height: 14),
          TextField(
            controller: _observationController,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Observaciones',
              hintText: 'Detalle de lo realizado, novedades, etc.',
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: _saving ? null : _finalizeService,
            icon: const Icon(Icons.check_circle_outline),
            label: _saving
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Finalizar servicio'),
          ),
        ],
      ),
    );
  }
}

class _StatusPalette {
  const _StatusPalette({required this.colors});

  final List<Color> colors;
}
