import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../domain/user_session.dart';

class AuthRepository {
  AuthRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient(baseUrl: AppConfig.apiBaseUrl);

  static const String _tokenKey = 'auth_token';
  static const String _nameKey = 'auth_name';
  static const String _roleKey = 'auth_role';
  static const String _emailKey = 'auth_email';
  static const String _idKey = 'auth_id';

  final ApiClient _apiClient;

  Future<UserSession> login({required String user, required String password}) async {
    if (AppConfig.useMockData) {
      final session = UserSession(
        id: AppConfig.technicianId > 0 ? AppConfig.technicianId : 1,
        name: user.trim().isEmpty ? 'Tecnico Demo' : user.trim(),
        role: 'Tecnico',
        email: 'demo@local.test',
        token: 'mock-token',
      );
      await _persistSession(session);
      return session;
    }

    final response = await _apiClient.post('/v1/auth/login', body: {
      'usuario': user,
      'password': password,
    });

    final success = (response['success'] ?? false) as bool;
    if (!success) {
      throw ApiException('No se pudo iniciar sesion', 400, response);
    }

    final session = UserSession.fromLoginResponse(response);
    await _persistSession(session);
    return session;
  }

  Future<void> logout() async {
    if (AppConfig.useMockData) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      await prefs.remove(_nameKey);
      await prefs.remove(_roleKey);
      await prefs.remove(_emailKey);
      await prefs.remove(_idKey);
      return;
    }

    final token = await getToken();
    if (token != null && token.isNotEmpty) {
      try {
        await _apiClient.post('/v1/auth/logout', token: token);
      } catch (_) {
        // El objetivo principal es limpiar sesion local.
      }
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_nameKey);
    await prefs.remove(_roleKey);
    await prefs.remove(_emailKey);
    await prefs.remove(_idKey);
  }

  Future<UserSession?> restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);

    // Si se paso de modo demo a modo real, descartamos token simulado.
    if (!AppConfig.useMockData && token == 'mock-token') {
      await prefs.remove(_tokenKey);
      await prefs.remove(_nameKey);
      await prefs.remove(_roleKey);
      await prefs.remove(_emailKey);
      await prefs.remove(_idKey);
      return null;
    }

    if (token == null || token.isEmpty) {
      if (AppConfig.useMockData) {
        final session = UserSession(
          id: AppConfig.technicianId > 0 ? AppConfig.technicianId : 1,
          name: 'Tecnico Demo',
          role: 'Tecnico',
          email: 'demo@local.test',
          token: 'mock-token',
        );
        await _persistSession(session);
        return session;
      }
      return null;
    }

    return UserSession(
      id: prefs.getInt(_idKey) ?? 0,
      name: prefs.getString(_nameKey) ?? 'Tecnico',
      role: prefs.getString(_roleKey) ?? 'Tecnico',
      email: prefs.getString(_emailKey) ?? '',
      token: token,
    );
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> _persistSession(UserSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, session.token);
    await prefs.setString(_nameKey, session.name);
    await prefs.setString(_roleKey, session.role);
    await prefs.setString(_emailKey, session.email);
    await prefs.setInt(_idKey, session.id);
  }
}
