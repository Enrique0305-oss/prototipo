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
    return Scaffold(
      appBar: AppBar(title: const Text('Servicio en curso')),
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
                  const SizedBox(height: 6),
                  Text(widget.service.address ?? 'Sin direccion'),
                ],
              ),
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
