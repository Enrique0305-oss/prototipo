import 'package:flutter/material.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/domain/user_session.dart';
import '../data/services_repository.dart';
import '../domain/service_task.dart';
import 'service_detail_page.dart';

class ServicesPage extends StatefulWidget {
  const ServicesPage({
    super.key,
    required this.session,
    required this.authRepository,
    required this.servicesRepository,
    required this.onLogout,
  });

  final UserSession session;
  final AuthRepository authRepository;
  final ServicesRepository servicesRepository;
  final VoidCallback onLogout;

  @override
  State<ServicesPage> createState() => _ServicesPageState();
}

class _ServicesPageState extends State<ServicesPage> {
  late Future<List<ServiceTask>> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.servicesRepository.getTodayServices();
  }

  Future<void> _reload() async {
    setState(() => _future = widget.servicesRepository.getTodayServices());
    await _future;
  }

  Future<void> _logout() async {
    await widget.authRepository.logout();
    widget.onLogout();
  }

  Future<void> _openService(ServiceTask service) async {
    final updated = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => ServiceDetailPage(service: service, repository: widget.servicesRepository),
      ),
    );

    if (updated == true) {
      await _reload();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Servicios de hoy'),
        actions: [
          IconButton(
            onPressed: _reload,
            icon: const Icon(Icons.refresh),
            tooltip: 'Recargar',
          ),
          IconButton(
            onPressed: _logout,
            icon: const Icon(Icons.logout),
            tooltip: 'Salir',
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            color: Colors.white,
            child: Text(
              'Tecnico: ${widget.session.name} | Rol: ${widget.session.role}',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<ServiceTask>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (snapshot.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Text('Error al cargar servicios: ${snapshot.error}'),
                    ),
                  );
                }

                final services = snapshot.data ?? <ServiceTask>[];
                if (services.isEmpty) {
                  return const Center(
                    child: Text('No hay servicios programados para hoy.'),
                  );
                }

                return RefreshIndicator(
                  onRefresh: _reload,
                  child: ListView.builder(
                    itemCount: services.length,
                    itemBuilder: (context, index) {
                      final s = services[index];
                      return Card(
                        color: s.isCompleted ? Colors.green.shade50 : null,
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: s.isCompleted ? Colors.green : Colors.blueGrey,
                            child: Icon(
                              s.isCompleted ? Icons.check : Icons.work_outline,
                              color: Colors.white,
                            ),
                          ),
                          title: Text(s.title),
                          subtitle: Text('${s.client}\n${s.address ?? ''}'),
                          isThreeLine: true,
                          trailing: Text(
                            s.status,
                            style: TextStyle(
                              color: s.isCompleted ? Colors.green.shade800 : Colors.black87,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          onTap: () => _openService(s),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
