import 'package:flutter/material.dart';
import 'package:qsci/modules/services/domain/service_task.dart';
import 'package:qsci/modules/services/data/services_repository.dart';

class SimplifiedTaskPage extends StatefulWidget {
  const SimplifiedTaskPage({
    super.key,
    required this.task,
    required this.repository,
  });

  final ServiceTask task;
  final ServicesRepository repository;

  @override
  State<SimplifiedTaskPage> createState() => _SimplifiedTaskPageState();
}

class _SimplifiedTaskPageState extends State<SimplifiedTaskPage> {
  bool _isLoading = false;
  late TextEditingController _obsController;

  @override
  void initState() {
    super.initState();
    _obsController = TextEditingController(text: widget.task.observations);
  }

  @override
  void dispose() {
    _obsController.dispose();
    super.dispose();
  }

  Future<void> _completeTask() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await widget.repository.completeService(
        id: widget.task.id,
        isCompletedLocally: false, // O usa tu lógica
        tipoProgramacion: widget.task.tipoProgramacion,
        observations: _obsController.text,
      );

      if (mounted) {
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al finalizar: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isCompleted = widget.task.isCompleted;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.task.tipoProgramacion),
        backgroundColor: const Color(0xFF0F2744),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 10,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.task.title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F2744),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Cliente/Lugar: ${widget.task.client}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.date_range, size: 16, color: Colors.grey),
                      const SizedBox(width: 6),
                      Text(widget.task.date),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.access_time, size: 16, color: Colors.grey),
                      const SizedBox(width: 6),
                      Text('${widget.task.startTime ?? '--:--'} - ${widget.task.endTime ?? '--:--'}'),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(),
                  const Text(
                    'Observaciones',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _obsController,
                    maxLines: 4,
                    readOnly: isCompleted,
                    decoration: InputDecoration(
                      hintText: 'Añadir observaciones...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      filled: true,
                      fillColor: isCompleted ? Colors.grey.shade100 : Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
            if (!isCompleted)
              FilledButton(
                onPressed: _isLoading ? null : _completeTask,
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF18B89A),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'FINALIZAR TAREA',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
              ),
            if (isCompleted)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F8F5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF18B89A)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.check_circle, color: Color(0xFF18B89A)),
                    SizedBox(width: 10),
                    Text(
                      'Tarea finalizada exitosamente',
                      style: TextStyle(
                        color: Color(0xFF18B89A),
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
