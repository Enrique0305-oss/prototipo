import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'modules/auth/data/auth_repository.dart';
import 'modules/auth/domain/user_session.dart';
import 'modules/auth/presentation/login_page.dart';
import 'modules/services/data/services_repository.dart';
import 'modules/services/presentation/services_page.dart';

void main() {
  runApp(const AppMovil());
}

class AppMovil extends StatefulWidget {
  const AppMovil({super.key});

  @override
  State<AppMovil> createState() => _AppMovilState();
}

class _AppMovilState extends State<AppMovil> {
  final AuthRepository _authRepository = AuthRepository();
  UserSession? _session;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final session = await _authRepository.restoreSession();
    if (!mounted) return;
    setState(() {
      _session = session;
      _loading = false;
    });
  }

  void _onLoggedIn(UserSession session) {
    setState(() => _session = session);
  }

  void _onLoggedOut() {
    setState(() => _session = null);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'QSCI Tecnicos',
      theme: AppTheme.build(),
      home: _loading
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : _session == null
              ? LoginPage(
                  authRepository: _authRepository,
                  onLoginSuccess: _onLoggedIn,
                )
              : ServicesPage(
                  session: _session!,
                  authRepository: _authRepository,
                  servicesRepository: ServicesRepository(authRepository: _authRepository),
                  onLogout: _onLoggedOut,
                ),
    );
  }
}
