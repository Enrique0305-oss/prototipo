import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';

import 'package:app_movil/main.dart';

void main() {
  testWidgets('Renderiza pantalla de inicio', (WidgetTester tester) async {
    await tester.pumpWidget(const AppMovil());
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
