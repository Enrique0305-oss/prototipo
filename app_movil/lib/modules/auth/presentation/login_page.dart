import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

import '../../../core/network/api_client.dart';
import '../data/auth_repository.dart';
import '../domain/user_session.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({
    super.key,
    required this.authRepository,
    required this.onLoginSuccess,
  });

  final AuthRepository authRepository;
  final ValueChanged<UserSession> onLoginSuccess;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _userController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _hidePassword = true;

  @override
  void dispose() {
    _userController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      final session = await widget.authRepository.login(
        user: _userController.text.trim(),
        password: _passwordController.text,
      );
      widget.onLoginSuccess(session);
    } catch (e, st) {
      if (kDebugMode) {
        debugPrint('[LOGIN][ERR] $e');
        if (e is ApiException) {
          debugPrint('[LOGIN][ERR] status=${e.statusCode} payload=${e.payload}');
        }
        debugPrint('$st');
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1E3A66),
              Color(0xFF2E5D91),
              Color(0xFF6AAFD8),
            ],
          ),
        ),
        child: Stack(
          children: [
            Positioned(
              top: -120,
              left: -80,
              child: _GlowBubble(
                size: 260,
                color: Colors.white.withValues(alpha: 0.16),
              ),
            ),
            Positioned(
              bottom: -140,
              right: -100,
              child: _GlowBubble(
                size: 320,
                color: const Color(0xFFB2E1FF).withValues(alpha: 0.20),
              ),
            ),
            SafeArea(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(minHeight: constraints.maxHeight - 40),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 520),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(24),
                            child: BackdropFilter(
                              filter: ImageFilter.blur(sigmaX: 7, sigmaY: 7),
                              child: Container(
                                padding: const EdgeInsets.all(22),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(24),
                                  color: Colors.white.withValues(alpha: 0.88),
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Color(0x29000000),
                                      blurRadius: 26,
                                      offset: Offset(0, 14),
                                    ),
                                  ],
                                ),
                                child: Form(
                                  key: _formKey,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 64,
                                        height: 64,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(18),
                                          gradient: const LinearGradient(
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                            colors: [Color(0xFF4C84C8), Color(0xFF69B3DB)],
                                          ),
                                        ),
                                        child: Padding(
                                          padding: const EdgeInsets.all(10),
                                          child: Image.asset(
                                            'assets/images/menu.png',
                                            fit: BoxFit.contain,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      Text(
                                        'Iniciar sesion',
                                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                              fontWeight: FontWeight.w700,
                                              color: const Color(0xFF123158),
                                            ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Accede a tu cuenta para ver tus servicios programados.',
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                              color: const Color(0xFF4D6683),
                                              height: 1.4,
                                            ),
                                      ),
                                      const SizedBox(height: 18),
                                      TextFormField(
                                        controller: _userController,
                                        decoration: const InputDecoration(
                                          labelText: 'Usuario',
                                          hintText: 'Ingresa tu usuario',
                                          prefixIcon: Icon(Icons.person_outline),
                                          filled: true,
                                          fillColor: Color(0xFFF4F8FC),
                                        ),
                                        validator: (value) {
                                          if (value == null || value.trim().isEmpty) {
                                            return 'Ingresa tu usuario';
                                          }
                                          return null;
                                        },
                                      ),
                                      const SizedBox(height: 12),
                                      TextFormField(
                                        controller: _passwordController,
                                        obscureText: _hidePassword,
                                        decoration: InputDecoration(
                                          labelText: 'Contrasena',
                                          hintText: 'Ingresa tu contrasena',
                                          prefixIcon: const Icon(Icons.lock_outline),
                                          filled: true,
                                          fillColor: const Color(0xFFF4F8FC),
                                          suffixIcon: IconButton(
                                            onPressed: () => setState(() => _hidePassword = !_hidePassword),
                                            icon: Icon(
                                              _hidePassword ? Icons.visibility : Icons.visibility_off,
                                            ),
                                          ),
                                        ),
                                        validator: (value) {
                                          if (value == null || value.isEmpty) {
                                            return 'Ingresa tu contrasena';
                                          }
                                          return null;
                                        },
                                      ),
                                      const SizedBox(height: 18),
                                      SizedBox(
                                        width: double.infinity,
                                        child: FilledButton(
                                          onPressed: _loading ? null : _submit,
                                          style: FilledButton.styleFrom(
                                            backgroundColor: const Color(0xFF4F8ED3),
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(vertical: 16),
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(14),
                                            ),
                                          ),
                                          child: _loading
                                              ? const SizedBox(
                                                  width: 18,
                                                  height: 18,
                                                  child: CircularProgressIndicator(
                                                    strokeWidth: 2,
                                                    color: Colors.white,
                                                  ),
                                                )
                                              : const Text(
                                                  'INICIAR SESION',
                                                  style: TextStyle(
                                                    fontWeight: FontWeight.w700,
                                                    letterSpacing: 0.5,
                                                  ),
                                                ),
                                        ),
                                      ),
                                      const SizedBox(height: 14),
                                      Row(
                                        children: [
                                          Icon(
                                            Icons.verified,
                                            color: Colors.green.shade600,
                                            size: 18,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            'Conexion segura y sesion auditada',
                                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                                  color: const Color(0xFF5E7894),
                                                ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GlowBubble extends StatelessWidget {
  const _GlowBubble({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }
}
