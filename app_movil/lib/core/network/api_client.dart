import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiClient {
  ApiClient({required this.baseUrl});

  final String baseUrl;

  Uri _uri(String path, [Map<String, String>? query]) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    final base = Uri.parse(baseUrl);
    return base.replace(
      path: '${base.path}$normalizedPath',
      queryParameters: query,
    );
  }

  Map<String, String> _headers(String? token) {
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> get(
    String path, {
    String? token,
    Map<String, String>? query,
  }) async {
    final uri = _uri(path, query);
    _logRequest(method: 'GET', uri: uri, token: token, body: null);
    try {
      final response = await http.get(uri, headers: _headers(token));
      _logResponse(method: 'GET', uri: uri, response: response);
      return _decodeResponse(response);
    } on SocketException catch (e) {
      _logException(method: 'GET', uri: uri, error: e);
      throw ApiException(_connectionHint(), 0, const {});
    } on http.ClientException catch (e) {
      _logException(method: 'GET', uri: uri, error: e);
      throw ApiException(_connectionHint(), 0, const {});
    }
  }

  Future<Map<String, dynamic>> post(
    String path, {
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final uri = _uri(path);
    _logRequest(method: 'POST', uri: uri, token: token, body: body);
    try {
      final response = await http.post(
        uri,
        headers: _headers(token),
        body: jsonEncode(body ?? <String, dynamic>{}),
      );
      _logResponse(method: 'POST', uri: uri, response: response);
      return _decodeResponse(response);
    } on SocketException catch (e) {
      _logException(method: 'POST', uri: uri, error: e);
      throw ApiException(_connectionHint(), 0, const {});
    } on http.ClientException catch (e) {
      _logException(method: 'POST', uri: uri, error: e);
      throw ApiException(_connectionHint(), 0, const {});
    }
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final uri = _uri(path);
    _logRequest(method: 'PATCH', uri: uri, token: token, body: body);
    try {
      final response = await http.patch(
        uri,
        headers: _headers(token),
        body: jsonEncode(body ?? <String, dynamic>{}),
      );
      _logResponse(method: 'PATCH', uri: uri, response: response);
      return _decodeResponse(response);
    } on SocketException catch (e) {
      _logException(method: 'PATCH', uri: uri, error: e);
      throw ApiException(_connectionHint(), 0, const {});
    } on http.ClientException catch (e) {
      _logException(method: 'PATCH', uri: uri, error: e);
      throw ApiException(_connectionHint(), 0, const {});
    }
  }

  void _logRequest({
    required String method,
    required Uri uri,
    required String? token,
    required Map<String, dynamic>? body,
  }) {
    if (!kDebugMode) return;

    final hasToken = token != null && token.isNotEmpty;
    final sanitizedBody = body == null ? null : _sanitizeBody(body);
    debugPrint('[API][REQ] $method $uri');
    debugPrint('[API][REQ] hasToken=$hasToken body=${sanitizedBody ?? '{}'}');
  }

  void _logResponse({
    required String method,
    required Uri uri,
    required http.Response response,
  }) {
    if (!kDebugMode) return;

    final bodyPreview = response.body.length > 500
        ? '${response.body.substring(0, 500)}...'
        : response.body;
    debugPrint('[API][RES] $method $uri -> ${response.statusCode}');
    debugPrint('[API][RES] body=$bodyPreview');
  }

  void _logException({
    required String method,
    required Uri uri,
    required Object error,
  }) {
    if (!kDebugMode) return;
    debugPrint('[API][ERR] $method $uri -> $error');
  }

  Map<String, dynamic> _sanitizeBody(Map<String, dynamic> body) {
    final copy = Map<String, dynamic>.from(body);
    const secretKeys = {'password', 'token', 'access_token', 'refresh_token'};
    for (final entry in copy.entries.toList()) {
      if (secretKeys.contains(entry.key.toLowerCase())) {
        copy[entry.key] = '***';
      }
    }
    return copy;
  }

  String _connectionHint() {
    return 'No se pudo conectar al backend ($baseUrl). '
        'Emulador Android: http://10.0.2.2:8000/api | '
        'Celular fisico: usa la IP local de tu PC (ej. http://192.168.1.20:8000/api).';
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    final text = response.body;
    Map<String, dynamic> jsonBody;
    try {
      jsonBody = text.isNotEmpty
          ? jsonDecode(text) as Map<String, dynamic>
          : <String, dynamic>{};
    } on FormatException {
      throw ApiException(
        'La respuesta del servidor no es JSON. '
        'Revisa API_BASE_URL (debe incluir puerto, por ejemplo :8000) y ruta /api. '
        'URL actual: $baseUrl',
        response.statusCode,
        {'raw': text},
      );
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonBody;
    }

    final message = (jsonBody['message'] ?? 'Error HTTP ${response.statusCode}').toString();
    throw ApiException(message, response.statusCode, jsonBody);
  }
}

class ApiException implements Exception {
  ApiException(this.message, this.statusCode, this.payload);

  final String message;
  final int statusCode;
  final Map<String, dynamic> payload;

  @override
  String toString() => message;
}
