import 'dart:convert';

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
    final response = await http.get(_uri(path, query), headers: _headers(token));
    return _decodeResponse(response);
  }

  Future<Map<String, dynamic>> post(
    String path, {
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final response = await http.post(
      _uri(path),
      headers: _headers(token),
      body: jsonEncode(body ?? <String, dynamic>{}),
    );
    return _decodeResponse(response);
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final response = await http.patch(
      _uri(path),
      headers: _headers(token),
      body: jsonEncode(body ?? <String, dynamic>{}),
    );
    return _decodeResponse(response);
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    final text = response.body;
    final jsonBody = text.isNotEmpty
        ? jsonDecode(text) as Map<String, dynamic>
        : <String, dynamic>{};

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
