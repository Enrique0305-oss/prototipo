class UserSession {
  UserSession({
    required this.id,
    required this.name,
    required this.role,
    required this.email,
    required this.token,
  });

  final int id;
  final String name;
  final String role;
  final String email;
  final String token;

  factory UserSession.fromLoginResponse(Map<String, dynamic> json) {
    final user = (json['usuario'] as Map<String, dynamic>? ?? <String, dynamic>{});
    return UserSession(
      id: (user['id'] ?? 0) as int,
      name: (user['nombre'] ?? '').toString(),
      role: (user['rol'] ?? '').toString(),
      email: (user['email'] ?? '').toString(),
      token: (json['token'] ?? '').toString(),
    );
  }
}
