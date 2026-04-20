class UserSession {
  UserSession({
    required this.id,
    required this.name,
    required this.role,
    required this.email,
    required this.token,
    this.technicianId,
  });

  final int id;
  final String name;
  final String role;
  final String email;
  final String token;
  final int? technicianId;

  factory UserSession.fromLoginResponse(Map<String, dynamic> json) {
    final user = (json['usuario'] as Map<String, dynamic>? ?? <String, dynamic>{});
    return UserSession(
      id: (user['id'] ?? 0) as int,
      name: (user['nombre'] ?? '').toString(),
      role: (user['rol'] ?? '').toString(),
      email: (user['email'] ?? '').toString(),
      token: (json['token'] ?? '').toString(),
      technicianId: (() {
        final raw = user['tecnico_id'];
        final n = int.tryParse((raw ?? '').toString()) ?? 0;
        return n > 0 ? n : null;
      })(),
    );
  }
}
