-- 0. Arreglar campo password (debe ser VARCHAR(255) para bcrypt)
ALTER TABLE personal MODIFY COLUMN password VARCHAR(255) NOT NULL;

-- 1. Usuario admin (password: password)
INSERT INTO personal (nombre, apellidos, celular, correo, id_area, usuario, password) 
VALUES ('Admin', 'Sistema', '999999999', 'admin@qsci.com', NULL, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- 2. Servicios de prueba
INSERT INTO servicios (nombre, descripcion, estado, duracion_estimada, requiere_movilidad, requiere_certificado) VALUES
('Fumigación Residencial', 'Servicio de fumigación para hogares', 'activo', 120, 1, 1),
('Fumigación Comercial', 'Servicio de fumigación para negocios', 'activo', 180, 1, 1),
('Desratización', 'Control y eliminación de roedores', 'activo', 90, 1, 0),
('Desinsectación', 'Control de insectos rastreros y voladores', 'activo', 60, 1, 0),
('Capacitación HACCP', 'Capacitación en buenas prácticas de manufactura', 'activo', 240, 0, 1);

-- 3. Categorías de productos
INSERT INTO categoria (nombre, descripcion, estado) VALUES
('Insecticidas', 'Productos para control de insectos', 'Activo'),
('Rodenticidas', 'Productos para control de roedores', 'Activo'),
('Equipos', 'Equipos de fumigación', 'Activo'),
('EPP', 'Equipos de protección personal', 'Activo');

-- 4. Productos de prueba
INSERT INTO productos (descripcion, id_categoria, fecha_vencim, ubicacion, n_lote, estado) VALUES
('Cipermetrina 25% EC - 1L', 1, '2026-12-31', 'Almacén A1', 'LOT2025001', 'Activo'),
('Deltametrina 2.5% WP - 1kg', 1, '2026-12-31', 'Almacén A1', 'LOT2025002', 'Activo'),
('Bromadiolona 0.005% - 200g', 2, '2027-06-30', 'Almacén A2', 'LOT2025003', 'Activo'),
('Fumigadora manual 10L', 3, NULL, 'Almacén B1', 'EQ001', 'Activo'),
('Mascarilla respiratoria 3M', 4, '2026-03-15', 'Almacén C1', 'EPP001', 'Activo');

-- 5. Inventario inicial
INSERT INTO inventario (id_productos, cantidad_disponible, stock_seguridad, Tipo, Cantidad_total) VALUES
(1, 50, 10, 'Entrada', 50),
(2, 30, 10, 'Entrada', 30),
(3, 100, 20, 'Entrada', 100),
(4, 5, 2, 'Entrada', 5),
(5, 200, 50, 'Entrada', 200);

-- 6. Clientes de prueba
INSERT INTO cliente (nombre_empresa, ruc, rubro, direccion, estado) VALUES
('Restaurante El Buen Sabor', '20456789123', 'Alimenticio', 'Jr. Comercio 456, Lima', 'Contactado'),
('Hotel Plaza', '20987654321', 'Hotelería', 'Av. Arequipa 1234, Lima', 'Acepta'),
('Supermercado MegaMax', '20123456789', 'Retail', 'Av. Javier Prado 890, Lima', 'Acepta'),
('Clínica San José', '20555666777', 'Salud', 'Jr. Salud 123, Lima', 'Contactado'),
('Colegio Santa María', '20999888777', 'Educación', 'Av. Educación 567, Lima', 'No acepta');

-- 7. Áreas de la empresa
INSERT INTO area (nombre, estado) VALUES
('Comercial', 'Activo'),
('Operaciones', 'Activo'),
('Administración', 'Activo'),
('Recursos Humanos', 'Activo'),
('Finanzas', 'Activo');

-- Verificar los datos insertados
SELECT 'Servicios creados:' as Info, COUNT(*) as Total FROM servicios;
SELECT 'Productos creados:' as Info, COUNT(*) as Total FROM productos;
SELECT 'Clientes creados:' as Info, COUNT(*) as Total FROM cliente;
SELECT 'Personal creado:' as Info, COUNT(*) as Total FROM personal;
