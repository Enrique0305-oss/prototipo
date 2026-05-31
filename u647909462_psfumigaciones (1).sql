-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 12-05-2026 a las 01:43:22
-- Versión del servidor: 11.8.6-MariaDB-log
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u647909462_psfumigaciones`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades_mantenieminto`
--

CREATE TABLE `actividades_mantenieminto` (
  `id` int(11) NOT NULL,
  `categoria` enum('Programado','Entregado','Garantia') DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `tipo_mantenimiento` enum('Preventivo','Correctivo') DEFAULT NULL,
  `tipo_equipo` varchar(80) DEFAULT NULL,
  `frecuencia_sugerida` varchar(40) DEFAULT NULL,
  `estado` enum('Activo','Desactivo') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `actividades_mantenieminto`
--

INSERT INTO `actividades_mantenieminto` (`id`, `categoria`, `motivo`, `tipo_mantenimiento`, `tipo_equipo`, `frecuencia_sugerida`, `estado`) VALUES
(1, 'Programado', 'Derrame de Gasolina, Demora en encedido, descarga rapida', 'Correctivo', 'GENERAL', NULL, 'Activo'),
(2, 'Programado', 'Mantenimiento preventivo', 'Preventivo', 'GENERAL', NULL, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `area`
--

CREATE TABLE `area` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `area`
--

INSERT INTO `area` (`id`, `nombre`, `estado`) VALUES
(1, 'Comercial', 'Activo'),
(2, 'Operaciones', 'Activo'),
(3, 'Administración', 'Activo'),
(4, 'Recursos Humanos', 'Activo'),
(5, 'Finanzas', 'Activo'),
(6, 'Gerencia', 'Activo'),
(7, 'Almacén', 'Activo'),
(8, 'Programacion', 'Activo'),
(9, 'Tecnico', 'Activo'),
(10, 'Investigacion', 'Activo'),
(11, 'IT', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `caja_chica`
--

CREATE TABLE `caja_chica` (
  `id` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `solicitante` varchar(100) NOT NULL,
  `area` varchar(100) NOT NULL,
  `proveedor` varchar(100) NOT NULL,
  `n_documento` varchar(100) NOT NULL,
  `concepto` varchar(100) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `egreso` decimal(10,2) NOT NULL,
  `ingreso` decimal(10,2) NOT NULL,
  `saldo` decimal(10,2) NOT NULL,
  `campo_nuevo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargo`
--

CREATE TABLE `cargo` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_area` bigint(20) UNSIGNED DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cargo`
--

INSERT INTO `cargo` (`id`, `id_area`, `nombre`, `descripcion`, `estado`, `created_at`, `updated_at`) VALUES
(1, 1, 'Coordinador Comercial', NULL, 'activo', '2026-03-31 22:52:31', '2026-03-31 22:53:37'),
(2, 1, 'Asistente Comercial', NULL, 'activo', '2026-03-31 22:52:46', '2026-03-31 22:52:46'),
(3, 6, 'Gerente Comercial', NULL, 'activo', '2026-03-31 22:54:06', '2026-03-31 22:54:06'),
(4, 8, 'Programacion Servicio', NULL, 'activo', '2026-04-10 22:47:50', '2026-04-10 22:47:50'),
(5, 8, 'Programacion Capa-Asesoria', NULL, 'activo', '2026-04-10 22:48:08', '2026-04-10 22:48:08'),
(6, 6, 'Gerente Operaciones', NULL, 'activo', '2026-04-15 15:08:52', '2026-04-15 15:08:52'),
(7, 10, 'Asistente MIP 1', NULL, 'activo', '2026-04-15 15:32:02', '2026-04-15 15:36:44'),
(8, 10, 'Asistente MIP 2', NULL, 'activo', '2026-04-15 15:32:14', '2026-04-15 15:36:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `catalogo_capacitacion_auditoria`
--

CREATE TABLE `catalogo_capacitacion_auditoria` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tipo` enum('Capacitación','Asesoría','Auditoria') NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_referencial` decimal(10,2) DEFAULT NULL,
  `duracion_horas` int(11) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `catalogo_capacitacion_auditoria`
--

INSERT INTO `catalogo_capacitacion_auditoria` (`id`, `tipo`, `nombre`, `descripcion`, `precio_referencial`, `duracion_horas`, `estado`) VALUES
(1, 'Capacitación', 'CAPACITACION HACCP', '--', 800.00, 6, 'activo'),
(2, 'Capacitación', 'CAPACITACION BPM', '---', 600.00, 4, 'activo'),
(3, 'Capacitación', 'CAPACITACION FSSC 22000', '---', 800.00, 4, 'activo'),
(4, 'Capacitación', 'CAPACITACION BRCGS', NULL, NULL, NULL, 'activo'),
(5, 'Asesoría', 'ASESORIA IMPLEMENTACION HACCP', '---', 1000.00, 1, 'activo'),
(6, 'Auditoria', 'AUDITORIA DE PGH', NULL, NULL, NULL, 'activo'),
(7, 'Capacitación', 'CAPACITACION DE CULTURA DE CALIDAD E INOCUIDAD', NULL, NULL, NULL, 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'INSUMOS', NULL, 'Activo'),
(2, 'DISPOSITIVOS', NULL, 'Activo'),
(3, 'EPPS', NULL, 'Activo'),
(4, 'QUIMICOS', NULL, 'Activo'),
(5, 'CONSUMIBLE', NULL, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id` int(11) NOT NULL,
  `nombre_empresa` varchar(100) NOT NULL,
  `ruc` char(11) NOT NULL,
  `rubro` varchar(150) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `persona_contacto` varchar(100) DEFAULT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `origen` varchar(50) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `estado` enum('Acepta','No acepta','Contactado') DEFAULT 'Contactado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id`, `nombre_empresa`, `ruc`, `rubro`, `direccion`, `persona_contacto`, `telefono_contacto`, `origen`, `fecha_registro`, `estado`) VALUES
(1, 'YAMBOLY S.A.C', '20510161069', 'Producción y comercialización de helados.', 'Av. Sta. Rosa de Lima 827, URB, LIMA', 'Juanita Mallqui', NULL, NULL, '2026-04-11', 'Acepta'),
(2, 'VILLA NATURA PERU SAC', '20515696017', 'Actividades de Envase y Empaque', 'Av. Jose Pardo Nro. 513 Dpto. 601', 'Power Cerda', NULL, 'Otro', '2026-04-11', 'Acepta'),
(3, 'COSECHAS PERUANAS', '20537676133', 'Industria Agroalimentaria', 'Calle José Aquilar Mz. G Lote 5-6. Urb. Ceres 1ra Etapa Ate Vitarte, Lima Perú.', 'Rossmery Sanchez', NULL, 'Referido', '2026-04-11', 'Acepta'),
(4, 'DRESDEN S.A.', '20507165461', 'Ingredientes alimenticios, farmacéuticos', 'Calle Los Telares N° 197 URB. Vulcano Lima-Lima-Ate', 'Kedy Espinoza', NULL, 'Referido', '2026-04-11', 'Acepta'),
(5, 'SALSAS INDUSTRY S.A.C', '20603031378', 'venta de productos', 'Av. Santa Rosa 474 y 476, Urb. La Aurora, Ate. Lima – Perú.', 'Ana Cristina', NULL, 'Referido', '2026-04-13', 'Acepta'),
(6, 'EXPORTADORA ROMEX S.A', '20522061035', 'Industria Alimentaria', 'Parcela 12 – Cajamarquilla – Lurigancho – Lima – Peru', 'Katherine Larraín', NULL, 'Referido', '2026-04-13', 'Acepta'),
(7, 'DRESDEN FOOD INGREDIENTS S.A.', '20263019807', 'Industria Alimentaria', 'los Telares Nro. 299, Vulcano-Ate', 'Aida Sánchez', NULL, 'Referido', '2026-04-13', 'Acepta'),
(8, 'OLIVEZA S.A.C.', '20513203871', 'Industria Alimentaria', 'Calle 1 Lote 7  Mz RR – Huertos de Lurín- Lurín', 'Erika Vilca', NULL, 'Referido', '2026-04-13', 'Acepta'),
(9, 'P&D Andina Alimentos SA', '20205922149', 'Industria Alimentaria', 'Av. Industrial Nro 741', 'Roberto Córdova', NULL, 'Referido', '2026-04-13', 'Acepta'),
(10, 'AGRÍCOLA ECOLÓGICA SAC', '20381210651', 'Industria Agroalimentaria', 'Av. Argentina 2045, Callao', 'Omar Nilsson', NULL, 'Referido', '2026-04-13', 'Acepta'),
(11, 'NUTRILIS SAC', '20600752180', 'Industria alimentaria', NULL, NULL, NULL, 'Referido', '2026-04-14', 'Acepta'),
(12, 'LECAROS SERVICIOS EN GENERAL E.I.R.L. - LESERGEN E.I.R.L.', '20603795173', 'Alimentos y bebidas', NULL, NULL, NULL, 'Referido', '2026-04-14', 'Acepta'),
(13, 'PANDA RESTAURANTES SAC', '20612221066', 'Gastronomía / Restaurantes.', NULL, 'Luis Castro', NULL, 'Referido', '2026-04-14', 'Acepta'),
(14, 'ARSENNA SAC', '20536868004', 'Sector Agroindustrial', NULL, 'Yure Quispe', NULL, 'Referido', '2026-04-14', 'Acepta'),
(15, 'AURANDINA SAC', '20474691986', 'Agroexportaciones y Servicios al Comercio Exterior.', NULL, 'Rocio', NULL, 'Referido', '2026-04-14', 'Acepta'),
(16, 'PRODUCTORA DE ALIMENTOS UNO SAC', '20344552364', 'Industria Alimentaria - Productos Lácteos.', 'Av. Santa Rosa 476, Urb. La Aurora, Ate. Lima – Perú.', 'Ana Huamaní', NULL, 'Referido', '2026-04-14', 'Acepta'),
(17, 'DELOSI', '20100123330', 'Gastronomía y servicios de preparación de alimentos y bebidas.', NULL, 'Kelly', NULL, 'Referido', '2026-04-14', 'Acepta'),
(18, 'PROCESADORA CATALINA S.A.C.', '20506223394', 'Sector agroindustrial y de alimentos', NULL, 'Magno Meyhuay', NULL, 'Referido', '2026-04-14', 'Acepta'),
(19, 'EMBOTELLADORA AQUAOASIS SAC', '20610005498', 'Bebidas', NULL, 'Corinta Caman', NULL, 'Referido', '2026-04-14', 'Acepta'),
(20, 'GELATERIA LARITZA D SA', '20166132585', 'Alimentación y bebidas', 'Av. Comandante Espinar 800, Miraflores 15074', 'Jubeth Bejarano', NULL, 'Referido', '2026-04-14', 'Acepta'),
(21, 'LA MORA PASTELERÍA', '20608507494', 'Fabricación de alimentos y bebidas', NULL, NULL, NULL, 'Otro', '2026-04-14', 'Acepta'),
(22, 'AMAZONAS TRADING PERU S.A.C.', '20521137682', 'Sector agroexportador', NULL, 'Michael Cuellar', NULL, 'Referido', '2026-04-14', 'Acepta'),
(23, 'ANDES ALIMENTOS & BEBIDAS', '20549227369', 'Agroindustrial / Agroexportador', 'Av. Prolongacion Ramon Castil Mza. T Lote. 09, Nuevo Lurin I Etapa las S (Km 36, antg. Panamericana Sur)', 'Yhilmer Campos', NULL, 'Referido', '2026-04-14', 'Acepta'),
(24, 'SANTA VERENA S.A.C.', '20100654611', 'Agroindustria', NULL, NULL, NULL, 'Referido', '2026-04-14', 'Acepta'),
(25, 'AGROINDUSTRIAS KAPAK HUAYTA S.A.C. / SANTA NATURA', '20553935599', 'Sector Agroindustrial', NULL, 'Sherley Ruiz', NULL, 'Referido', '2026-04-14', 'Acepta'),
(26, 'THEOBROMA INVERSIONES SAC', '20549061967', 'Industria agrícola, agroindustrial y de alimentos y bebidas', NULL, 'Kelly Cespedes', NULL, 'Referido', '2026-04-14', 'Acepta'),
(27, 'SUPER ALIMENTOS DEL PERÚ SAC', '20601782082', 'Industria alimentaria', NULL, NULL, NULL, 'Referido', '2026-04-14', 'Acepta'),
(28, 'REINSAC', '20172955518', '-', NULL, 'Elizabeth Veliz', NULL, 'Referido', '2026-04-14', 'Acepta'),
(29, 'GANADERIA D.J. S.A.C. / SANTA RES', '20533910361', 'Agropecuario/Carnes y derivados', NULL, 'Juan Jimenez', NULL, 'Referido', '2026-04-14', 'Acepta'),
(30, 'INVERSIONES M 6 S.A.C.', '20538715931', 'Industria alimentaria', NULL, 'Giovanna Vega', NULL, 'Referido', '2026-04-14', 'Acepta'),
(31, 'AGRORUM S.A.C.', '20565366719', 'Servicios de laboratorio, análisis de alimentos y asesoría agroambiental.', NULL, 'Angelica Rios', NULL, 'Referido', '2026-04-14', 'Acepta'),
(32, 'MARIA ALMENARA', '20517441792', 'Alimentos y Bebidas', NULL, 'Verónica', NULL, 'Referido', '2026-04-15', 'Acepta'),
(33, 'ICH CORP S.A', '20132515680', 'Producción alimentaria y manufactura', 'AV. PACHACUTEC MZA. I LOTE. 1-13 Z.I. PARQUE INDUSTRIAL - VILLA EL SALVADOR', 'Mariella Moreno', NULL, 'Referido', '2026-04-15', 'Acepta'),
(34, 'Industrial Kylas SAC', '20557774468', 'Agroindustrial / Fabricación de Alimentos y Bebidas.', 'Av. Otr. Sección 3 y 4 Mza. A Lote 2 Int. DZ.I. Las Praderas de Lurín, Lurín – Lima', 'Lady Cajo', NULL, 'Referido', '2026-04-15', 'Acepta'),
(35, 'Inversiones La Negra SAC', '20613420330', 'producción de alimentos', 'Av. Angamos Oeste 291, Miraflores 15074', 'Renzo Lillo Verán', NULL, NULL, '2026-04-16', 'Acepta'),
(36, 'AMAZON ANDES EXPORT S.A.C.', '20548920478', 'PRODUCCIÓN, COMERCIALIZACIÓN Y EXPORTACIÓN DE ALIMENTOS', 'AV. LOS ÁLAMOS 532, URB. CANTO GRANDE - SAN JUAN DE LURIGANCHO', 'Grecia', NULL, 'Referido', '2026-04-18', 'Acepta'),
(37, 'MANQA INVERSIONES S.A.C', '20600242009', '-', NULL, NULL, NULL, 'Referido', '2026-04-18', 'Acepta'),
(38, 'GRUPO ISAMISA SAC', '20602674488', 'producción de alimentos', NULL, 'Victor Olortegui', '+51 924 492 059', 'Referido', '2026-04-21', 'Acepta'),
(39, 'HEINZ GLAS PERÚ S.A.C', '20513640316', 'Fabricación de cristal y productos de vidrio', 'Av. Argentina 1239, Lima', 'Alisson Sosa', NULL, 'Referido', '2026-04-21', 'Acepta'),
(40, 'ALIMENTOS Y SERVICIOS AGROPECUARIOS SRL', '20124952850', 'agroindustrial y de insumos agropecuarios', 'Av. Quinta Avenida Mza. C Lote. 15, La Capitana Huachipa, Lurigancho, Lima', 'Polonia Yois Casali Soto', NULL, 'Referido', '2026-04-29', 'Acepta'),
(41, 'INSPECTION & QUALITY TOTAL SERVICES S.A.C.', '20503484316', 'Industria Alimentaria', NULL, NULL, NULL, 'Referido', '2026-04-30', 'Acepta'),
(42, 'ALIMENTOS BALANCEADOS DEL PERU S.A.C.', '20498513833', 'Agroindustrial', 'Av. Quinta Avenida Mza. C LT15 , La capitana Huachipa , lurigancho', NULL, NULL, 'Referido', '2026-04-30', 'Acepta'),
(43, 'EUROFHARMA EUFHA SAC', '20194480459', 'Alimentario', 'Cal. Los Rosales Mza. B2 Lote. 15 Urbanizacion: La Capitana (Alt de Mapfre-Ramiro Priale)- Distrito Lurigancho- Lima', 'Miguel Pozo', NULL, 'Referido', '2026-04-30', 'Acepta'),
(44, 'RAINFOREST COCOA LAB S.A.C.', '20615064204', 'Importador', 'Av talladores 334, ate', 'Yajayra', NULL, 'Referido', '2026-05-06', 'Acepta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente_planta`
--

CREATE TABLE `cliente_planta` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `distrito` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `contacto_nombre` varchar(100) DEFAULT NULL,
  `contacto_telefono` varchar(20) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cliente_planta`
--

INSERT INTO `cliente_planta` (`id`, `id_cliente`, `nombre`, `direccion`, `distrito`, `provincia`, `departamento`, `referencia`, `latitud`, `longitud`, `contacto_nombre`, `contacto_telefono`, `estado`) VALUES
(1, 4, 'LINEA FARMACEUTICA', 'Calle Los Telares N° 197 URB. Vulcano', 'Ate', 'LIMA', 'Lima', NULL, NULL, NULL, 'Kedy Espinoza', '912 460 368', 'Activo'),
(2, 4, 'LINEA QUÍMICA', 'Calle Los Telares N° 197 URB. Vulcano', 'Ate', 'LIMA', 'Lima', NULL, NULL, NULL, 'Kedy Espinoza', '912 460 368', 'Activo'),
(3, 5, 'TIGO ATE', NULL, 'LIMA', 'LIMA', 'LIMA', NULL, NULL, NULL, NULL, NULL, 'Activo'),
(5, 18, 'NATURALE LURIN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(6, 18, 'NATURALE ATE', 'Av. Arboleda 371 Urb. Sta.Raquel II Etapa', 'Ate', 'Lima', NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(7, 20, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', 'MIRAFLORES', 'LIMA', 'LIMA', NULL, -12.11143874, -77.03675509, 'Jubeth  Bejarano', NULL, 'Activo'),
(8, 20, 'PLANTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(9, 20, 'ALMACEN EXTERNO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(10, 20, 'LARITZA ASIA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(11, 20, 'LARITZA BALTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(12, 20, 'LARITZA CHACARILLA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(13, 20, 'LARITZA CHORRILLOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(14, 20, 'LARITZA EL POLO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(15, 20, 'LARITZA JOCKEY', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(16, 20, 'LARITZA MALL DEL SUR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(17, 20, 'LARITZA SAN MIGUEL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(21, 9, 'AREAS EXTERNAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(22, 21, 'MORA CHORRILLOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(23, 21, 'MORA SURCO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(24, 30, 'M6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(25, 30, 'PLANTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(26, 20, 'INTERNA (debajo del mostrador)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(27, 34, 'PRADERAS I', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(28, 33, 'AREA DE PRODUCCION ( linea mani, azucar y cafe)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(29, 35, 'REFRIGERADOR DE COCINA', 'Av. Angamos Oeste 291, Miraflores 15074', 'MIRAFLORES', 'LIMA', 'LIMA', NULL, -12.11387612, 77.03112800, 'Renzo Lillo Verán', '963 214 005', 'Activo'),
(30, 37, 'MIRAFLORES', 'CA. ENRIQUE PALACIOS 361', 'MIRAFLORES', 'LIMA', NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(31, 37, 'DERTEANO', 'AV. DIONISIO DERTEANO 128, LIMA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(32, 37, 'CENTENARIO', 'AV. BELAUNDE, VICTOR A 0147, VIA REAL N° 0125 0127, LIMA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(33, 37, 'JESÚS MARÍA', 'JIRÓN GENERAL CANTERAC 310', 'JESUS MARIA', 'LIMA', NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(34, 37, 'CHORRILLOS', 'AV. GUARDIA PERUANA N° 299 URB. MATELLINI MZ. H – 02 LT.27', 'CHORRILLOS', 'LIMA', NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(35, 37, 'LA ROTONDA II', 'AV. LA FONTANA 440, CENTRO COMERCIAL LA ROTONDA', 'LA MOLINA', 'LIMA', NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(36, 37, 'SURCO', 'CA. GALICIA 134, URBANIZACIÓN HIGUERETA', 'SANTIAGO DE SURCO', 'LIMA', NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(37, 37, 'SURQUILLO', 'LIZARDO MONTERO 1105', 'SURQUILLO', 'LIMA', NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(38, 37, 'PLANTA', 'AV. CIRCUNVALACIÓN 1931', 'SAN LUIS', 'LIMA', NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(39, 9, 'PATIO DE MANIOBRAS Y CENTRO DE ACOPIO DE RESIDUOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(40, 38, 'PLANTA BALANCEADOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(41, 38, 'PLANTA FRIGORÍFICO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(42, 38, 'TIENDA SANTA ANITA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(43, 38, 'TIENDA CAMAL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(44, 38, 'TIENDA ASESOR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(45, 38, 'PLANTA CÁRNICOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(46, 38, 'PLANTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(48, 38, 'RESTAURANTE', 'Av. Los Ángeles, Ate 15498', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(49, 38, 'PLANTA DE ALIMENTOS BALANCEADOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(50, 16, 'RESERVORIO Vol.  30 m3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(51, 16, 'RESERVORIO Vol.  40m3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(52, 16, 'RESERVORIO Vol.  50m3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(53, 40, 'Áreas internas', 'Av. Quinta Avenida Mza. C Lote. 15, La Capitana Huachipa, Lurigancho', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(54, 42, 'Áreas internas', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(55, 2, '22 Pallets', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(56, 23, 'Almacén anexo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(58, 16, 'PATIO DE MANIOBRAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(59, 16, 'AZOTEA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(60, 16, 'ÁREAS INTERNAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(61, 16, 'ÁREAS EXTERNAS,PATIO DE MANIOBRAS, AZOTEA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(62, 44, 'GENERAL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(63, 36, 'AREA (General)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo'),
(64, 2, '4 pallets de nueces', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente_planta_area`
--

CREATE TABLE `cliente_planta_area` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cliente_planta_area`
--

INSERT INTO `cliente_planta_area` (`id`, `id_cliente_planta`, `nombre`, `descripcion`, `estado`) VALUES
(1, 1, 'SSHH', NULL, 'Activo'),
(2, 1, 'VEHÍCULOS', NULL, 'Activo'),
(3, 1, 'DESRATIZACION', NULL, 'Activo'),
(4, 2, 'SSHH', NULL, 'Activo'),
(5, 2, '2 VEHÍCULOS', NULL, 'Activo'),
(6, 1, 'AREAS INTERNAS', NULL, 'Activo'),
(7, 3, 'KIOSKO', 'Tiendita en exterior de tigo ate', 'Activo'),
(11, 7, 'INTERNA (debajo del mostrador)', NULL, 'Activo'),
(12, 27, 'INTERIORES', NULL, 'Activo'),
(13, 27, '3 CONTAINERS', NULL, 'Activo'),
(14, 27, 'ZONA EXTERNA', NULL, 'Activo'),
(16, 46, 'DE ALIMENTOS BALANCEADOS', NULL, 'Activo'),
(17, 46, 'FRIGORIFICO', NULL, 'Activo'),
(19, 49, 'reservorios de: 20 m3, 10 m3, 5 m3', NULL, 'Activo'),
(21, 41, 'cisterna de 5 m3 y tanque de 1000 L', NULL, 'Activo'),
(22, 48, 'cisterna de: 5 m3 y 2 tanques de: 2500 L', NULL, 'Activo'),
(23, 24, 'LIMPIEZA DE TANQUE', NULL, 'Activo'),
(24, 24, 'LIMPIEZA DE TANQUE', NULL, 'Activo'),
(25, 24, 'LIMPIEZA DE 2 TANQUES DE AGUA', NULL, 'Activo'),
(26, 12, 'MOTORES, CANALETAS, CAJAS ELECTRICAS, LUGARES DE DIFICIL ACCESO PARA FUMIGAR, ETC', NULL, 'Activo'),
(27, 56, 'Almacén anexo', NULL, 'Activo'),
(28, 64, 'nueces', NULL, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion`
--

CREATE TABLE `cotizacion` (
  `id` int(11) NOT NULL,
  `numero_cotizacion` varchar(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha_emision` date NOT NULL,
  `id_personal_creador` int(11) NOT NULL,
  `id_multicim` int(11) DEFAULT NULL,
  `estado` enum('Pendiente','Aceptada','Rechazada') DEFAULT 'Pendiente',
  `tipo_cotizacion` enum('Servicio','Producto','Capacitacion','Asesoria','Auditoria') NOT NULL,
  `propuesta_tecnica` longtext DEFAULT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `receta_servicio` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON con receta de servicio (equipos y productos)',
  `exponentes_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `objetivos_asesoria` varchar(1000) DEFAULT NULL,
  `fecha_estado_cotizacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cotizacion`
--

INSERT INTO `cotizacion` (`id`, `numero_cotizacion`, `id_cliente`, `fecha_emision`, `id_personal_creador`, `id_multicim`, `estado`, `tipo_cotizacion`, `propuesta_tecnica`, `incluye_igv`, `subtotal`, `igv`, `total`, `observaciones`, `receta_servicio`, `exponentes_ids`, `objetivos_asesoria`, `fecha_estado_cotizacion`) VALUES
(8, 'COT-2026-007', 35, '2026-04-17', 14, 2, 'Aceptada', 'Servicio', NULL, 0, 250.00, 0.00, 250.00, 'Esta cotización no incluye IGV.', '[{\"id_servicio\":8,\"id_equipo\":6,\"equipo_descripcion\":\"MINI ASPIRADORA\",\"id_producto\":35,\"cantidad\":10,\"observacion\":null,\"id_cliente_planta\":29,\"id_cliente_planta_area\":null},{\"id_servicio\":8,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":34,\"cantidad\":300,\"observacion\":null,\"id_cliente_planta\":29,\"id_cliente_planta_area\":null}]', NULL, NULL, '2026-04-17 10:27:17'),
(9, 'COT-2026-008', 34, '2026-04-15', 14, 2, 'Aceptada', 'Servicio', NULL, 0, 850.00, 0.00, 850.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', '[{\"id_servicio\":16,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":0,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":27,\"id_cliente_planta_area\":12},{\"id_servicio\":16,\"id_equipo\":5,\"equipo_descripcion\":\"PULVERIZADOR MANUAL\",\"id_producto\":0,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":27,\"id_cliente_planta_area\":14},{\"id_servicio\":13,\"id_equipo\":4,\"equipo_descripcion\":\"PULVERIZADOR MANUAL\",\"id_producto\":0,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":27,\"id_cliente_planta_area\":13},{\"id_servicio\":16,\"id_equipo\":1,\"equipo_descripcion\":\"TERMONEBULIZADOR\",\"id_producto\":0,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":27,\"id_cliente_planta_area\":12}]', NULL, NULL, '2026-04-17 13:09:19'),
(10, 'COT-2026-009', 33, '2026-04-17', 14, 2, 'Aceptada', 'Producto', NULL, 0, 192.00, 0.00, 192.00, 'Esta cotización no incluye IGV.', NULL, NULL, NULL, '2026-04-17 14:23:14'),
(13, 'COT-2026-010', 35, '2026-04-20', 15, 2, 'Pendiente', 'Servicio', NULL, 0, 250.00, 0.00, 250.00, 'Esta cotización no incluye IGV.', '[{\"id_servicio\":8,\"id_equipo\":6,\"equipo_descripcion\":\"MINI ASPIRADORA\",\"id_producto\":35,\"cantidad\":10,\"observacion\":null,\"id_cliente_planta\":29,\"id_cliente_planta_area\":null},{\"id_servicio\":8,\"id_equipo\":6,\"equipo_descripcion\":\"MINI ASPIRADORA\",\"id_producto\":34,\"cantidad\":300,\"observacion\":null,\"id_cliente_planta\":29,\"id_cliente_planta_area\":null}]', NULL, NULL, NULL),
(14, 'COT-2026-011', 9, '2026-04-20', 14, 2, 'Aceptada', 'Servicio', NULL, 0, 735.00, 0.00, 735.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', '[{\"id_servicio\":13,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":42,\"cantidad\":10,\"observacion\":null,\"id_cliente_planta\":39,\"id_cliente_planta_area\":null},{\"id_servicio\":13,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":19,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":39,\"id_cliente_planta_area\":null}]', NULL, NULL, '2026-04-20 09:34:41'),
(15, 'COT-2026-012', 4, '2026-04-20', 22, 1, 'Aceptada', 'Auditoria', '<p>2.1 Objetivos </p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>a. Fortalecer los conocimientos del solicitante en los temas impartidos por el equipo de QSCI Consulting.    </li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>b. Realizar el Diagnostico de PGH.  </li></ol><p>2.2 Coordinación del servicio y requisitos para el servicio: 1. QSCI Consulting designará a un representante responsable de realizar las coordinaciones del servicio con la empresa solicitante. 2. QSCI Consulting será el responsable de hacer cumplir la actividad propuesta y requiere del compromiso de la empresa de facilitar el tiempo al personal asignado en las actividades programadas. 2.3 Actividades del servicio: Normas a auditar: RS 035-2020/DIGESA/SA - Principios Generales de Higiene (Actas de verificación documentaria) Principios generales de higiene del .codex alimentarius CX-1-1969 / Ver. 2023 DS-007-98-SA Esta Auditoría está diseñada para ser cubierta de la siguiente manera: 1. Reunión de apertura: Horario y fecha por definir, dirigido por auditor líder y auditor acompañante con la presencia del personal encargado a auditar de la empresa contratante. 2. Inspección de Infraestructura de Plana: Horario y fecha por definir, se realizará la inspección de infraestructura y auditoria a personal de operaciones, calidad, mantenimiento y administrativo dependiendo del alcance de la empresa contratante. 3. Revisión Documentaria: Horario y fecha por definir, se revisará los documentos que competen a lineamientos de PGH. 4. Realización de informe de resumen: Horario y fecha por definir, se realizará un informe de resumen de no conformidades para el cierre de auditoría. 5. Reunión de cierre: Horario y fecha por definir, se brindará las observaciones encontradas a personal auditado. CIM CONSULTORES PARA LA INDUSTRIA ALIMENTARIA S.A.C. - www.qsciconsulting.com 6. Envío de informe final: El informe final detallado se enviará después de 04 días de finalizar la auditoría con las observaciones encontradas y recomendaciones.  </p>', 0, 950.00, 0.00, 950.00, 'prueba 1 auditoria | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', NULL, '[1,2]', NULL, '2026-04-20 16:05:14'),
(16, 'COT-2026-013', 30, '2026-04-20', 14, 2, 'Pendiente', 'Servicio', NULL, 0, 350.00, 0.00, 350.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', NULL, NULL, NULL, NULL),
(17, 'COT-2026-014', 16, '2026-04-27', 15, 2, 'Aceptada', 'Servicio', NULL, 0, 800.00, 0.00, 800.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', NULL, NULL, NULL, '2026-04-21 10:40:53'),
(18, 'COT-2026-015', 30, '2026-04-24', 15, 2, 'Pendiente', 'Servicio', NULL, 0, 170.00, 0.00, 170.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', '[{\"id_servicio\":10,\"id_equipo\":7,\"equipo_descripcion\":\"BOMBA SUMERGIBLE\",\"id_producto\":0,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":24,\"id_cliente_planta_area\":25}]', NULL, NULL, NULL),
(19, 'COT-2026-016', 33, '2026-04-24', 15, 1, 'Pendiente', 'Capacitacion', NULL, 0, 680.00, 0.00, 680.00, 'Esta cotización no incluye IGV.', NULL, '[2,1,3]', 'a. Fortalecer los conocimientos del personal a cargo en los temas impartidos por el equipo de QSCI Consulting.\nb. Capacitar a través de metodologías didácticas e interactivas que permitan la interiorización efectiva de los temas a tratar.\nc. Incentivar a los dueños del proceso la importancia de los diferentes temas impartidos y cómo estos pueden causar un impacto positivo en su organización.', NULL),
(20, 'COT-2026-017', 33, '2026-04-24', 14, 1, 'Aceptada', 'Asesoria', '<p><br></p>', 0, 7500.00, 0.00, 7500.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', NULL, '[3,4,5,1]', 'a. Dar soporte técnico para el planteamiento de acciones correctivas que permita levantar las no conformidades detectadas durante la auditoría interna y de esta manera quedar aptos para la auditoría de la DIGESA. \nb. Fortalecer las competencias del equipo HACCP en la aplicación del Sistema de Análisis de Peligros y Puntos Críticos de Control (HACCP) y sus Programas de Prerrequisito. \nc. Asistir a la empresa en el proceso de obtención de la Certificación de la Validación Técnica Oficial del Plan HACCP para la fabricación de sus diferentes productos en concordancia con lo establecido por la normativa nacional aplicable.', '2026-05-08 10:11:46'),
(21, 'COT-2026-018', 33, '2026-04-24', 14, 1, 'Pendiente', 'Capacitacion', NULL, 0, 1000.00, 0.00, 1000.00, 'Esta cotización no incluye IGV.', NULL, '[2,1,3]', 'a. Fortalecer los conocimientos del personal a cargo en los temas impartidos por el equipo de QSCI Consulting.\nb. Capacitar a través de metodologías didácticas e interactivas que permitan la interiorización efectiva de los temas a tratar.\nc. Incentivar a los dueños del proceso la importancia de los diferentes temas impartidos y cómo estos pueden causar un impacto positivo en su organización.', NULL),
(22, 'COT-2026-019', 17, '2026-04-27', 14, 2, 'Aceptada', 'Producto', NULL, 0, 300.00, 0.00, 300.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', NULL, NULL, NULL, '2026-04-28 16:30:09'),
(23, 'COT-2026-020', 20, '2026-04-27', 15, 2, 'Aceptada', 'Servicio', NULL, 0, 360.00, 0.00, 360.00, 'Esta cotización no incluye IGV.', '[{\"id_servicio\":8,\"id_equipo\":6,\"equipo_descripcion\":\"MINI ASPIRADORA\",\"id_producto\":35,\"cantidad\":10,\"observacion\":null,\"id_cliente_planta\":12,\"id_cliente_planta_area\":26},{\"id_servicio\":8,\"id_equipo\":6,\"equipo_descripcion\":\"MINI ASPIRADORA\",\"id_producto\":34,\"cantidad\":300,\"observacion\":null,\"id_cliente_planta\":12,\"id_cliente_planta_area\":26},{\"id_servicio\":8,\"id_equipo\":6,\"equipo_descripcion\":\"MINI ASPIRADORA\",\"id_producto\":36,\"cantidad\":30,\"observacion\":null,\"id_cliente_planta\":12,\"id_cliente_planta_area\":26},{\"id_servicio\":8,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":23,\"cantidad\":2,\"observacion\":null,\"id_cliente_planta\":12,\"id_cliente_planta_area\":26}]', NULL, NULL, '2026-04-27 14:30:32'),
(24, 'COT-2026-021', 20, '2026-04-27', 14, 2, 'Pendiente', 'Servicio', NULL, 0, 470.00, 0.00, 470.00, 'Esta cotización no incluye IGV.', '[{\"id_servicio\":8,\"id_equipo\":6,\"equipo_descripcion\":\"MINI ASPIRADORA\",\"id_producto\":35,\"cantidad\":10,\"observacion\":null,\"id_cliente_planta\":26,\"id_cliente_planta_area\":null},{\"id_servicio\":8,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":33,\"cantidad\":50,\"observacion\":null,\"id_cliente_planta\":26,\"id_cliente_planta_area\":null},{\"id_servicio\":8,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":36,\"cantidad\":60,\"observacion\":null,\"id_cliente_planta\":26,\"id_cliente_planta_area\":null},{\"id_servicio\":8,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":34,\"cantidad\":900,\"observacion\":null,\"id_cliente_planta\":26,\"id_cliente_planta_area\":null}]', NULL, NULL, NULL),
(25, 'COT-2026-022', 18, '2026-04-29', 14, 2, 'Aceptada', 'Producto', NULL, 0, 120.00, 0.00, 120.00, 'Esta cotización no incluye IGV.', NULL, NULL, NULL, '2026-05-08 02:21:32'),
(26, 'COT-2026-023', 40, '2026-04-29', 14, 2, 'Aceptada', 'Servicio', NULL, 0, 350.00, 0.00, 350.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', '[{\"id_servicio\":2,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":19,\"cantidad\":96,\"observacion\":null,\"id_cliente_planta\":53,\"id_cliente_planta_area\":null}]', NULL, NULL, '2026-04-29 09:23:29'),
(27, 'COT-2026-024', 42, '2026-04-30', 14, 2, 'Aceptada', 'Servicio', NULL, 0, 350.00, 0.00, 350.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', '[{\"id_servicio\":2,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":19,\"cantidad\":96,\"observacion\":null,\"id_cliente_planta\":null,\"id_cliente_planta_area\":null}]', NULL, NULL, '2026-04-30 09:41:23'),
(28, 'COT-2026-025', 2, '2026-05-04', 14, 2, 'Aceptada', 'Servicio', NULL, 0, 890.00, 0.00, 890.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', NULL, NULL, NULL, '2026-05-04 11:52:12'),
(29, 'COT-2026-026', 23, '2026-05-05', 14, 2, 'Aceptada', 'Servicio', NULL, 0, 790.00, 0.00, 790.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', '[{\"id_servicio\":13,\"id_equipo\":4,\"equipo_descripcion\":\"PULVERIZADOR MANUAL\",\"id_producto\":42,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":56,\"id_cliente_planta_area\":null}]', NULL, NULL, '2026-05-05 11:01:46'),
(30, 'COT-2026-027', 16, '2026-05-06', 14, 2, 'Pendiente', 'Servicio', NULL, 0, 749.00, 0.00, 749.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', '[{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":5,\"cantidad\":23,\"observacion\":null,\"id_cliente_planta\":61,\"id_cliente_planta_area\":null},{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":6,\"cantidad\":8,\"observacion\":null,\"id_cliente_planta\":61,\"id_cliente_planta_area\":null},{\"id_servicio\":9,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":57,\"cantidad\":11,\"observacion\":\"propiedad del cliente\",\"id_cliente_planta\":60,\"id_cliente_planta_area\":null}]', NULL, NULL, NULL),
(31, 'COT-2026-028', 44, '2026-05-06', 14, 2, 'Aceptada', 'Servicio', NULL, 0, 280.00, 0.00, 280.00, 'Esta cotización no incluye IGV.', '[{\"id_servicio\":13,\"id_equipo\":5,\"equipo_descripcion\":\"PULVERIZADOR MANUAL\",\"id_producto\":42,\"cantidad\":75,\"observacion\":null,\"id_cliente_planta\":62,\"id_cliente_planta_area\":null}]', NULL, NULL, '2026-05-07 16:49:46'),
(32, 'COT-2026-029', 2, '2026-05-07', 14, 2, 'Aceptada', 'Servicio', NULL, 0, 450.00, 0.00, 450.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', NULL, NULL, NULL, '2026-05-07 15:46:12'),
(33, 'COT-2026-030', 36, '2026-05-07', 15, 2, 'Pendiente', 'Servicio', NULL, 0, 380.00, 0.00, 380.00, 'Esta cotización no incluye IGV.', '[{\"id_servicio\":13,\"id_equipo\":4,\"equipo_descripcion\":\"PULVERIZADOR MANUAL\",\"id_producto\":24,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":63,\"id_cliente_planta_area\":null},{\"id_servicio\":13,\"id_equipo\":4,\"equipo_descripcion\":\"PULVERIZADOR MANUAL\",\"id_producto\":19,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":63,\"id_cliente_planta_area\":null}]', NULL, NULL, NULL),
(34, 'COT-2026-031', 4, '2026-05-08', 22, 1, 'Aceptada', 'Auditoria', '<p><br></p>', 0, 450.00, 0.00, 450.00, 'Esta cotización no incluye IGV.', NULL, '[3]', NULL, '2026-05-08 10:13:50'),
(35, 'COT-2026-032', 20, '2026-05-09', 22, 2, 'Aceptada', 'Servicio', NULL, 0, 1450.00, 0.00, 1450.00, 'Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', '[{\"id_servicio\":13,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":5,\"cantidad\":5,\"observacion\":null,\"id_cliente_planta\":7,\"id_cliente_planta_area\":11},{\"id_servicio\":13,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":21,\"cantidad\":3,\"observacion\":null,\"id_cliente_planta\":7,\"id_cliente_planta_area\":11},{\"id_servicio\":13,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":23,\"cantidad\":2,\"observacion\":null,\"id_cliente_planta\":7,\"id_cliente_planta_area\":11},{\"id_servicio\":14,\"id_equipo\":3,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":57,\"cantidad\":5,\"observacion\":null,\"id_cliente_planta\":7,\"id_cliente_planta_area\":11},{\"id_servicio\":8,\"id_equipo\":3,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":23,\"cantidad\":5,\"observacion\":null,\"id_cliente_planta\":7,\"id_cliente_planta_area\":11},{\"id_servicio\":13,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":6,\"cantidad\":3,\"observacion\":null,\"id_cliente_planta\":7,\"id_cliente_planta_area\":11},{\"id_servicio\":13,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":44,\"cantidad\":100,\"observacion\":null,\"id_cliente_planta\":7,\"id_cliente_planta_area\":11},{\"id_servicio\":14,\"id_equipo\":3,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":47,\"cantidad\":100,\"observacion\":null,\"id_cliente_planta\":7,\"id_cliente_planta_area\":11},{\"id_servicio\":8,\"id_equipo\":3,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":19,\"cantidad\":100,\"observacion\":null,\"id_cliente_planta\":7,\"id_cliente_planta_area\":11}]', NULL, NULL, '2026-05-09 18:02:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion_beneficio`
--

CREATE TABLE `cotizacion_beneficio` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_cotizacion` int(11) NOT NULL,
  `id_catalogo_cap_aud` bigint(20) UNSIGNED DEFAULT NULL,
  `nombre_beneficio` varchar(255) NOT NULL,
  `modalidad_sugerida` varchar(80) DEFAULT NULL,
  `horas_capacitacion` decimal(8,2) DEFAULT NULL,
  `precio_referencial` decimal(10,2) NOT NULL DEFAULT 0.00,
  `observacion` varchar(255) DEFAULT NULL,
  `orden` int(10) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion_detalle`
--

CREATE TABLE `cotizacion_detalle` (
  `id` int(11) NOT NULL,
  `id_cotizacion` int(11) NOT NULL,
  `es_servicio_extra` tinyint(1) NOT NULL DEFAULT 0,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_catalogo_cap_aud` bigint(20) UNSIGNED DEFAULT NULL,
  `descripcion_manual` varchar(255) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `frecuencia_sugerida` varchar(100) DEFAULT NULL,
  `modalidad_sugerida` varchar(50) DEFAULT NULL,
  `op_tecnicos` char(4) DEFAULT NULL,
  `supervisor` char(4) DEFAULT NULL,
  `horas_capacitacion` int(11) DEFAULT NULL,
  `num_participantes` int(11) DEFAULT NULL,
  `fecha_servicio` date DEFAULT NULL,
  `medida_tanque` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `fosfina_producto` varchar(200) DEFAULT NULL,
  `fosfina_cantidad` int(11) DEFAULT NULL,
  `meses_implementacion` int(11) DEFAULT NULL,
  `frecuencia_visita` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `horario_auditoria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cotizacion_detalle`
--

INSERT INTO `cotizacion_detalle` (`id`, `id_cotizacion`, `es_servicio_extra`, `id_cliente_planta`, `id_cliente_planta_area`, `id_servicio`, `id_producto`, `id_catalogo_cap_aud`, `descripcion_manual`, `cantidad`, `precio_unitario`, `frecuencia_sugerida`, `modalidad_sugerida`, `op_tecnicos`, `supervisor`, `horas_capacitacion`, `num_participantes`, `fecha_servicio`, `medida_tanque`, `fosfina_producto`, `fosfina_cantidad`, `meses_implementacion`, `frecuencia_visita`, `horario_auditoria`) VALUES
(36, 9, 0, 27, '[12,14]', 16, NULL, NULL, NULL, 1, 500.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 9, 0, 27, '[13]', 13, NULL, NULL, NULL, 1, 350.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(38, 10, 0, NULL, NULL, NULL, 37, NULL, NULL, 4, 48.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 8, 0, 29, NULL, 8, NULL, NULL, NULL, 1, 250.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(42, 13, 0, 29, NULL, 8, NULL, NULL, NULL, 1, 250.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(44, 14, 0, 39, NULL, 13, NULL, NULL, NULL, 1, 735.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(51, 16, 0, NULL, NULL, 10, NULL, NULL, NULL, 1, 350.00, 'A solicitud', NULL, '1', '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 15, 0, 1, NULL, NULL, NULL, 6, NULL, 1, 950.00, NULL, 'Presencial', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, '{\"inicio\":\"14:00\",\"fin\":\"20:00\"}'),
(106, 18, 0, 24, '[25]', 10, NULL, NULL, NULL, 1, 170.00, 'A solicitud', NULL, '2', '1', NULL, NULL, NULL, '[\"0.6\"]', NULL, NULL, NULL, NULL, NULL),
(112, 19, 0, NULL, NULL, NULL, NULL, 7, NULL, 1, 680.00, NULL, 'Presencial', NULL, NULL, 3, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(113, 21, 0, NULL, NULL, NULL, NULL, 1, NULL, 1, 1000.00, NULL, 'Presencial', NULL, NULL, 6, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(116, 23, 0, 12, '[26]', 8, NULL, NULL, NULL, 1, 360.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(117, 24, 0, 26, NULL, 8, NULL, NULL, NULL, 1, 470.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(120, 17, 0, 50, NULL, 10, NULL, NULL, NULL, 1, 800.00, 'A solicitud', NULL, '1', '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(121, 22, 0, NULL, NULL, NULL, 61, NULL, NULL, 30, 10.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(122, 25, 0, NULL, NULL, NULL, 36, NULL, NULL, 2, 50.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(123, 25, 0, NULL, NULL, NULL, 34, NULL, NULL, 1, 20.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(126, 26, 0, 53, NULL, 2, NULL, NULL, NULL, 1, 350.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(128, 27, 0, 54, NULL, 2, NULL, NULL, NULL, 1, 350.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(130, 28, 0, NULL, NULL, 4, NULL, NULL, NULL, 1, 890.00, 'A solicitud', NULL, '0', '0', NULL, NULL, NULL, NULL, 'Pallet', 22, NULL, NULL, NULL),
(136, 29, 0, 56, NULL, 13, NULL, NULL, NULL, 1, 790.00, '3 días a la semana (Martes, Jueves, Domingo)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(139, 30, 0, 61, NULL, 6, NULL, NULL, NULL, 1, 650.00, 'Semanal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(140, 30, 0, 60, NULL, 9, NULL, NULL, NULL, 1, 99.00, 'Mensual', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(141, 31, 0, 62, NULL, 13, NULL, NULL, NULL, 1, 280.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(142, 20, 0, NULL, NULL, NULL, NULL, 5, NULL, 1, 7500.00, NULL, 'Presencial', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, '{\"m1\":{\"p\":3,\"v\":0,\"f\":\"semanal\"},\"m2\":{\"p\":3,\"v\":0,\"f\":\"semanal\"},\"m3\":{\"p\":0,\"v\":0,\"f\":\"semanal\"}}', NULL),
(144, 32, 0, NULL, NULL, 4, NULL, NULL, NULL, 1, 450.00, 'A solicitud', NULL, '0', '0', NULL, NULL, NULL, NULL, 'Pallets de nueces', 4, NULL, NULL, NULL),
(145, 33, 0, 63, NULL, 13, NULL, NULL, NULL, 1, 380.00, 'A solicitud', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(146, 34, 0, 1, '[6]', NULL, NULL, 6, NULL, 1, 450.00, NULL, 'Presencial', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, NULL, '{\"inicio\":\"10:00\",\"fin\":\"12:00\"}'),
(150, 35, 0, 7, '[11]', 13, NULL, NULL, NULL, 1, 450.00, 'Quincenal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(151, 35, 0, 7, '[11]', 14, NULL, NULL, NULL, 1, 650.00, 'Quincenal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(152, 35, 0, 7, '[11]', 8, NULL, NULL, NULL, 1, 350.00, 'Quincenal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_entrada_devolucion_fabricacion`
--

CREATE TABLE `detalle_entrada_devolucion_fabricacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_entrada_devolucion_fabricacion` int(10) UNSIGNED NOT NULL,
  `tipo` enum('EntradaProducto','DevolucionInsumo','ConsumoDiferenciaInsumo') NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_lote` bigint(20) UNSIGNED DEFAULT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_entrega_epp`
--

CREATE TABLE `detalle_entrega_epp` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_entrega_epp` bigint(20) UNSIGNED NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `observacion` varchar(255) DEFAULT NULL,
  `condicion_devolucion` varchar(255) DEFAULT NULL,
  `observacion_devolucion` varchar(255) DEFAULT NULL,
  `estado_item` enum('Activo','Devuelto','Reemplazado') NOT NULL DEFAULT 'Activo',
  `id_entrega_reemplazo` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ordenes_compra`
--

CREATE TABLE `detalle_ordenes_compra` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_compra` bigint(20) UNSIGNED NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_lote` bigint(20) UNSIGNED DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(12,4) NOT NULL,
  `subtotal` decimal(12,4) NOT NULL,
  `observacion` varchar(300) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_ordenes_compra`
--

INSERT INTO `detalle_ordenes_compra` (`id`, `id_orden_compra`, `id_producto`, `id_lote`, `cantidad`, `precio_unitario`, `subtotal`, `observacion`, `created_at`, `updated_at`) VALUES
(1, 1, 28, NULL, 152, 0.3200, 48.6400, NULL, '2026-04-14 20:22:20', '2026-04-14 20:22:20'),
(2, 1, 29, NULL, 224, 0.7100, 159.0400, NULL, '2026-04-14 20:22:20', '2026-04-14 20:22:20'),
(3, 2, 36, NULL, 150, 1.0070, 151.0560, NULL, '2026-04-18 13:38:30', '2026-04-18 13:38:30'),
(4, 3, 61, 1, 30, 3.4000, 102.0000, NULL, '2026-04-30 15:18:56', '2026-04-30 15:18:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_asesoria`
--

CREATE TABLE `detalle_orden_asesoria` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_asesoria` int(10) UNSIGNED NOT NULL,
  `item` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_orden_asesoria`
--

INSERT INTO `detalle_orden_asesoria` (`id`, `id_orden_asesoria`, `item`, `descripcion`) VALUES
(1, 1, 'Detalle', 'Cantidad: 1 | Precio Unitario: S/ 1,000.00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_capacitacion_equipos`
--

CREATE TABLE `detalle_orden_capacitacion_equipos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_capacitacion` int(10) UNSIGNED NOT NULL,
  `equipo` varchar(255) NOT NULL,
  `disposicion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_capacitacion_materiales`
--

CREATE TABLE `detalle_orden_capacitacion_materiales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_capacitacion` int(10) UNSIGNED NOT NULL,
  `material` varchar(255) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `disposicion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_fabricacion`
--

CREATE TABLE `detalle_orden_fabricacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_orden_fabricacion` int(10) UNSIGNED NOT NULL,
  `id_producto_final` int(11) NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `receta_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `insumos_requeridos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_orden_fabricacion`
--

INSERT INTO `detalle_orden_fabricacion` (`id`, `id_orden_fabricacion`, `id_producto_final`, `cantidad`, `receta_snapshot`, `insumos_requeridos`) VALUES
(11, 9, 1, 127.000, '[{\"id_producto_insumo\":2,\"cantidad\":1,\"unidad\":null,\"observacion\":null,\"insumo\":{\"id\":2,\"descripcion\":\"LAMINA 50X10\",\"unidad\":\"Unidad\",\"inventario\":{\"cantidad_disponible\":9605}}},{\"id_producto_insumo\":3,\"cantidad\":1.88,\"unidad\":\"Gramos\",\"observacion\":null,\"insumo\":{\"id\":3,\"descripcion\":\"TEMOCID\",\"unidad\":\"Gramos\",\"inventario\":{\"cantidad_disponible\":10905}}},{\"id_producto_insumo\":4,\"cantidad\":1,\"unidad\":null,\"observacion\":null,\"insumo\":{\"id\":4,\"descripcion\":\"LAMINA ADHESIVA 50X10\",\"unidad\":null,\"inventario\":{\"cantidad_disponible\":5}}}]', '[{\"id_producto_insumo\":2,\"descripcion\":\"LAMINA 50X10\",\"cantidad_requerida\":127,\"unidad\":\"Unidad\"},{\"id_producto_insumo\":3,\"descripcion\":\"TEMOCID\",\"cantidad_requerida\":238.76,\"unidad\":\"Gramos\"},{\"id_producto_insumo\":4,\"descripcion\":\"LAMINA ADHESIVA 50X10\",\"cantidad_requerida\":127,\"unidad\":null}]');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_producto`
--

CREATE TABLE `detalle_orden_producto` (
  `id` int(11) NOT NULL,
  `id_orden_producto` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_lote` bigint(20) UNSIGNED DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `detalle_orden_producto`
--

INSERT INTO `detalle_orden_producto` (`id`, `id_orden_producto`, `id_producto`, `id_lote`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(2, 2, 37, NULL, 4, 48.00, 192.00),
(3, 3, 61, 1, 30, 10.00, 300.00),
(4, 4, 36, NULL, 2, 50.00, 100.00),
(5, 4, 34, NULL, 1, 20.00, 20.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_servicio`
--

CREATE TABLE `detalle_orden_servicio` (
  `id` int(11) NOT NULL,
  `id_orden_servicio` int(11) NOT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `id_servicio` int(11) NOT NULL,
  `local` varchar(100) DEFAULT NULL,
  `frecuencia` varchar(100) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_orden_servicio`
--

INSERT INTO `detalle_orden_servicio` (`id`, `id_orden_servicio`, `id_cliente_planta`, `id_cliente_planta_area`, `id_servicio`, `local`, `frecuencia`, `precio`) VALUES
(51, 8, 39, NULL, 13, NULL, 'A SOLICITUD DEL CLIENTE', 735.00),
(52, 9, 40, NULL, 13, NULL, 'A SOLICITUD DEL CLIENTE', 440.00),
(53, 9, 41, NULL, 13, NULL, 'A SOLICITUD DEL CLIENTE', 450.00),
(54, 9, 42, NULL, 13, NULL, 'A SOLICITUD DEL CLIENTE', 200.00),
(55, 9, 43, NULL, 13, NULL, 'A SOLICITUD DEL CLIENTE', 400.00),
(56, 9, 44, NULL, 13, NULL, 'A SOLICITUD DEL CLIENTE', 200.00),
(57, 9, 45, NULL, 13, NULL, 'A SOLICITUD DEL CLIENTE', 450.00),
(58, 9, 49, '[19]', 20, NULL, 'A SOLICITUD DEL CLIENTE', 1600.00),
(59, 9, 41, '[21]', 21, NULL, 'A SOLICITUD DEL CLIENTE', 600.00),
(60, 9, NULL, NULL, 22, NULL, 'A SOLICITUD DEL CLIENTE', 950.00),
(61, 10, 12, '[26]', 8, NULL, 'A SOLICITUD DEL CLIENTE', 360.00),
(62, 13, 54, NULL, 2, NULL, 'A SOLICITUD DEL CLIENTE', 350.00),
(63, 6, 26, NULL, 8, NULL, 'A SOLICITUD DEL CLIENTE', 470.00),
(67, 14, 55, NULL, 4, NULL, 'Semanal', 890.00),
(68, 16, 64, '[28]', 4, NULL, 'A SOLICITUD DEL CLIENTE', 450.00),
(69, 17, 62, NULL, 13, NULL, 'A SOLICITUD DEL CLIENTE', 280.00),
(70, 18, 7, '[11]', 13, NULL, 'Quincenal', 450.00),
(71, 18, 7, '[11]', 14, NULL, 'Quincenal', 650.00),
(72, 18, 7, '[11]', 8, NULL, 'Quincenal', 350.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrada_devolucion_fabricacion`
--

CREATE TABLE `entrada_devolucion_fabricacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_orden_fabricacion` int(10) UNSIGNED NOT NULL,
  `id_programacion_fabricacion` int(10) UNSIGNED NOT NULL,
  `cantidad_esperada_total` decimal(12,3) NOT NULL DEFAULT 0.000,
  `cantidad_producida_total` decimal(12,3) NOT NULL DEFAULT 0.000,
  `motivo_diferencia` text DEFAULT NULL,
  `tiene_sobrante_materia_prima` tinyint(1) NOT NULL DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `estado` enum('Pendiente','Realizado') NOT NULL DEFAULT 'Pendiente',
  `fecha_realizado` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `tiene_diferencia_materia_prima` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrega_epp`
--

CREATE TABLE `entrega_epp` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero_entrega` varchar(20) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `fecha_entrega` date NOT NULL,
  `fecha_devolucion` date DEFAULT NULL,
  `estado` enum('Entregado','Devuelto') NOT NULL DEFAULT 'Entregado',
  `motivo_entrega` enum('Primera Asignación','Reemplazo por Daño','Reemplazo por Desgaste','Reemplazo por Pérdida','Reposición Periódica','Solicitud del Técnico') NOT NULL DEFAULT 'Primera Asignación',
  `registrado_por` int(11) NOT NULL,
  `devuelto_por` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `motivo_devolucion` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipo`
--

CREATE TABLE `equipo` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `marca` varchar(100) NOT NULL,
  `modelo` varchar(100) NOT NULL,
  `serie` int(11) NOT NULL,
  `encargado` varchar(100) NOT NULL,
  `responsable` varchar(100) NOT NULL,
  `contacto` int(11) NOT NULL,
  `imagen` varchar(500) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `equipo`
--

INSERT INTO `equipo` (`id`, `descripcion`, `marca`, `modelo`, `serie`, `encargado`, `responsable`, `contacto`, `imagen`, `estado`) VALUES
(1, 'TERMONEBULIZADOR', 'VECTOR FOG', 'H200', 3, 'Yordi', 'Yordi', 922824390, 'equipos/vector-fog/termonebulizador-1.png', 'Activo'),
(2, 'MOTOASPERSOR', 'STIHL', 'SR 440', 1, 'Yordi', 'Yordi', 922824390, 'equipos/stihl/motoaspersor-2.png', 'Activo'),
(3, 'MOTOASPERSOR', 'STIHL', 'SR 420', 2, 'Yordi', 'Yordi', 922824390, 'equipos/stihl/motoaspersor-3.png', 'Activo'),
(4, 'PULVERIZADOR MANUAL', 'JACTO', 'PJH', 1, 'Yordi', 'Yordi', 922824390, 'equipos/jacto/pulverizador-manual-4.png', 'Activo'),
(5, 'PULVERIZADOR MANUAL', 'JACTO', 'PJH', 2, 'Yordi', 'Yordi', 922824390, 'equipos/jacto/pulverizador-manual-5.png', 'Activo'),
(6, 'MINI ASPIRADORA', 'ISFOG', 'P25A', 1, 'Yordi', 'Yordi', 922824390, 'equipos/isfog/mini-aspiradora-6.png', 'Activo'),
(7, 'BOMBA SUMERGIBLE', 'MEBA', 'WQD12-18-2.2A', 1, 'Yordi', 'Yordi', 922824390, 'equipos/meba/bomba-sumergible-7.png', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `exponentes`
--

CREATE TABLE `exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `especialidad` varchar(200) DEFAULT NULL,
  `profesion` varchar(200) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `institucion` varchar(200) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `id_tecnico_vinculado` bigint(20) UNSIGNED DEFAULT NULL,
  `presentacion` varchar(5000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `exponentes`
--

INSERT INTO `exponentes` (`id`, `nombre`, `apellidos`, `especialidad`, `profesion`, `telefono`, `email`, `institucion`, `notas`, `estado`, `id_tecnico_vinculado`, `presentacion`) VALUES
(1, 'Sandy Mailin', 'Esteban Aliaga', 'ASESORIA SIG', 'INGENIERIA ALIMENTARIA', '931505488', NULL, 'Universidad Nacional Federico Villarreal (UNFV)', NULL, 'Activo', NULL, 'Bachiller en Ingeniería Alimentaria por la Universidad Nacional Federico Villarreal (UNFV), con formación complementaria en Buenas Prácticas de Manufactura (BPM), Programas de Higiene y Saneamiento (PHS), BRC Global Standard, gestión de alérgenos alimentarios y prevención del fraude alimentario. Cuenta con conocimientos en sistemas de gestión de calidad e inocuidad alimentaria, implementación de HACCP, control sanitario y documentación técnica, además de manejo de herramientas como Microsoft Excel, Word y PowerPoint.\nExperiencia profesional en control de calidad e inocuidad en plantas de alimentos, realizando supervisión del cumplimiento de BPM, POES/PHS y verificación de Puntos Críticos de Control (PCC), inspección de materia prima y producto terminado, trazabilidad de procesos, documentación HACCP y preparación para auditorías internas y externas. Ha participado en capacitaciones al personal, inspecciones sanitarias y procesos de implementación de sistemas de gestión de inocuidad alimentaria en restaurantes y plantas industriales. Actualmente se desempeña como Asistente del Sistema de Gestión de Calidad e Inocuidad en QSCI Consulting Group, participando en proyectos de implementación de PHS, HACCP y BRC.'),
(2, 'Glendy Tatiana', 'Mori Tafur', NULL, 'Ingeniera alimentaria', '954169875', NULL, 'Universidad Nacional Federico Villarreal (UNFV)', NULL, 'Activo', NULL, 'Ingeniera Alimentaria por la Universidad Nacional Federico Villarreal (UNFV), con formación complementaria en HACCP (240 h), Buenas Prácticas de Manufactura (BPM), Legislación Alimentaria, Derivados Lácteos, Supervisor SSOMA y manejo de herramientas de gestión como Excel y Power BI. Experiencia en análisis fisicoquímico y control de calidad bajo normas ISO, AOAC y Codex Alimentarius, así como en implementación y supervisión de Sistemas de Gestión de Calidad e Inocuidad Alimentaria.\nExperiencia profesional como Asistente de Laboratorio en nutrición y bromatología de alimentos, Inspectora de Control de Calidad e Inocuidad en concesionarios de alimentación colectiva y en el sector agroexportador (cacao), además de participación en proyectos de implementación y validación técnica oficial HACCP y certificación BRCGS en empresas del sector alimentario. Actualmente se desempeña como Coordinadora SGCIA en QSCI Group, liderando asesorías en sistemas de gestión e inocuidad para empresas del rubro gastronómico e industrial.'),
(3, 'George', 'Vásquez', NULL, 'Biólogo Microbiólogo', '959 392 137', NULL, 'UNMSM', NULL, 'Activo', NULL, 'Biólogo Microbiólogo (UNMSM), con especialización en Sistemas de Gestión de Calidad e Inocuidad Alimentaria (UNALM), Auditor ISO 9001:2015 (SGS), Auditor HACCP y FSSC 22000, auditor certificado en BRCGS. Diplomado en Gestión de Calidad y Procesos (UNI) y Diplomado de Lean Six Sigma Green Belt (PUCP). Experiencia profesional en Mondelez International como especialista de Seguridad Alimentaria, así como jefe de Aseguramiento de Calidad en empresas del sector cárnico y agroindustrial. Actualmente Gerente de Calidad, Inocuidad Alimentaria y Laboratorios de QSCI Consulting.'),
(4, 'Lucero', 'Raymondi', NULL, 'Ingeniera  Alimentaria', NULL, NULL, 'Universidad Federico Villareal', NULL, 'Activo', NULL, 'Ingeniera de Industrias Alimentarias de la Universidad Federico Villareal, con más de 9 años de experiencia en la fabricación de alimentos. Experiencia profesional en la elaboración e implementación  de Planes BPM, HACCP, POES, SISTEMA BASC de Almacenamiento de Productos Hidrobiológicos. Actualmente jefa de Calidad en Gelateria Laritza y Asesor Senior en Calidad e Inocuidad Alimentaria en QSCI Group.'),
(5, 'Yahayra', 'Ramirez Arrollo', NULL, NULL, NULL, NULL, 'Universidad Peruana Unión (UPeU)', NULL, 'Activo', NULL, 'Ingeniera de Industrias Alimentarias de la Universidad Peruana Unión (UPeU), con mas de 6 años de experiencia en redacción, verificación e implementación de documentos relacionados con BPM, PHS y HACCP. Posee conocimientos sólidos y experiencia en BPM, HACCP, PGH y RAINFOREST. Además de experiencia en Control del sistema de gestión para la exportación a la Unión Europea. Actualmente Asesora, implementadora y Auditora Senior en Calidad e Inocuidad alimentaria en QSCI Group.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fichas_operacionales`
--

CREATE TABLE `fichas_operacionales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_programacion_servicio` int(11) NOT NULL,
  `id_grupo_programacion` int(11) DEFAULT NULL,
  `id_usuario_creador` int(11) DEFAULT NULL,
  `correlativo` varchar(20) DEFAULT NULL,
  `estado` enum('borrador','completada') NOT NULL DEFAULT 'borrador',
  `cliente` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora_llegada` time DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_final` time DEFAULT NULL,
  `giro` varchar(255) DEFAULT NULL,
  `diagnostico` text DEFAULT NULL,
  `condicion_sanitaria` text DEFAULT NULL,
  `actividades_realizadas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`actividades_realizadas`)),
  `equipos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`equipos`)),
  `insumos_utilizados` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`insumos_utilizados`)),
  `areas_tratadas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`areas_tratadas`)),
  `acciones_correctivas` text DEFAULT NULL,
  `recomendaciones` text DEFAULT NULL,
  `firmas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`firmas`)),
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `fecha_finalizacion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `fichas_operacionales`
--

INSERT INTO `fichas_operacionales` (`id`, `id_programacion_servicio`, `id_grupo_programacion`, `id_usuario_creador`, `correlativo`, `estado`, `cliente`, `direccion`, `fecha`, `hora_llegada`, `hora_inicio`, `hora_final`, `giro`, `diagnostico`, `condicion_sanitaria`, `actividades_realizadas`, `equipos`, `insumos_utilizados`, `areas_tratadas`, `acciones_correctivas`, `recomendaciones`, `firmas`, `observaciones`, `created_at`, `updated_at`, `fecha_finalizacion`) VALUES
(22, 345, NULL, 23, 'FO-0001', 'completada', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-10', '06:00:00', '06:00:00', '08:00:00', NULL, 'Todo bien', 'Todo en orden', '[\"FUMIGACION\"]', '[\"Termonebulizacion\"]', '[{\"id_producto\":44,\"producto\":\"DRAGON\",\"metodo\":\"Termonebulizacion\",\"lote\":\"L2026-01\",\"vencimiento\":\"2029-07-08T05:00:00.000000Z\",\"unidad\":null,\"concentracion\":\"20\",\"cantidad\":\"100\"}]', '[\"Areas en General\"]', 'S/N', 'Mantener todo ordenado y limpio', NULL, NULL, '2026-05-11 01:13:03', '2026-05-11 01:13:04', '2026-05-11 01:13:04'),
(23, 362, NULL, 23, 'FO-0002', 'completada', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-10', '08:01:00', '08:01:00', '10:00:00', NULL, 'Todo bien', 'Todo en orden', '[\"FUMIGACION Y DESINFECCION\"]', '[\"Aspersion a motor\"]', '[{\"id_producto\":47,\"producto\":\"BIOINSECT\",\"metodo\":\"Aspersion a motor\",\"lote\":\"L2026-01\",\"vencimiento\":\"2028-08-07T05:00:00.000000Z\",\"unidad\":null,\"concentracion\":\"20\",\"cantidad\":\"100\"}]', '[\"Areas en General\"]', 'S/N', 'Mantener todo ordenado y limpio', NULL, NULL, '2026-05-11 01:15:45', '2026-05-11 01:15:46', '2026-05-11 01:15:46'),
(24, 379, NULL, 23, 'FO-0003', 'completada', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-10', '10:01:00', '10:01:00', '12:00:00', NULL, 'Todo bien', 'Todo en orden', '[\"INTERVENCION POR CUCARACHAS\"]', '[\"Termonebulizacion\"]', '[{\"id_producto\":19,\"producto\":\"BETAFOX\",\"metodo\":\"Termonebulizacion\",\"lote\":\"L2026-01\",\"vencimiento\":\"2029-07-08T05:00:00.000000Z\",\"unidad\":null,\"concentracion\":\"20\",\"cantidad\":\"100\"}]', '[\"Areas en General\"]', 'S/N', 'Mantener todo limpio y ordenado', NULL, NULL, '2026-05-11 01:18:24', '2026-05-11 01:18:25', '2026-05-11 01:18:25'),
(25, 380, NULL, 23, 'FO-0004', 'completada', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-10', '10:01:00', '10:01:00', '12:00:00', NULL, 'Todo en orden', 'Todo bien', '[\"INTERVENCION POR CUCARACHAS\"]', '[\"Termonebulizacion\"]', '[{\"id_producto\":19,\"producto\":\"BETAFOX\",\"metodo\":\"Termonebulizacion\",\"lote\":\"L2026-01\",\"vencimiento\":\"2029-07-08T05:00:00.000000Z\",\"unidad\":null,\"concentracion\":\"20\",\"cantidad\":\"100\"}]', '[\"Areas en General\"]', 'S/N', 'Mantener todo ordenado y limpio', NULL, NULL, '2026-05-11 01:21:30', '2026-05-11 01:21:31', '2026-05-11 01:21:31'),
(26, 346, NULL, 23, 'FO-0005', 'completada', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-10', '06:00:00', '06:00:00', '08:00:00', NULL, 'Todo bien', 'Todo en orden', '[\"FUMIGACION\"]', '[\"Aspersion manual\"]', '[{\"id_producto\":44,\"producto\":\"DRAGON\",\"metodo\":\"Aspersion manual\",\"lote\":\"L2026-01\",\"vencimiento\":\"2029-07-08T05:00:00.000000Z\",\"unidad\":null,\"concentracion\":\"20\",\"cantidad\":\"100\"}]', '[\"Areas en General\"]', 'S/N', 'Mantener todo ordenado y limpio', NULL, NULL, '2026-05-11 01:23:57', '2026-05-11 01:23:57', '2026-05-11 01:23:57'),
(27, 363, NULL, 23, 'FO-0006', 'completada', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-10', '08:01:00', '08:01:00', '10:00:00', NULL, 'Todo en orden', 'Todo bien', '[\"FUMIGACION Y DESINFECCION\"]', '[\"Termonebulizacion\"]', '[{\"id_producto\":47,\"producto\":\"BIOINSECT\",\"metodo\":\"Termonebulizacion\",\"lote\":\"L2026-01\",\"vencimiento\":\"2028-08-07T05:00:00.000000Z\",\"unidad\":null,\"concentracion\":\"20\",\"cantidad\":\"100\"}]', '[\"Areas en General\"]', 'S/N', 'Mantener todo ordenado y limpio', NULL, NULL, '2026-05-11 01:26:01', '2026-05-11 01:26:02', '2026-05-11 01:26:02'),
(28, 347, NULL, 23, 'FO-0007', 'completada', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-10', '06:00:00', '06:00:00', '08:00:00', NULL, 'Todo bien', 'Todo en orden', '[\"FUMIGACION\"]', '[\"Termonebulizacion\"]', '[{\"id_producto\":44,\"producto\":\"DRAGON\",\"metodo\":\"Termonebulizacion\",\"lote\":\"L2026-01\",\"vencimiento\":\"2029-07-08T05:00:00.000000Z\",\"unidad\":null,\"concentracion\":\"20\",\"cantidad\":\"100\"}]', '[\"Areas en General\"]', 'S/N', 'Mantener todo ordenado y limpio', NULL, NULL, '2026-05-11 01:52:33', '2026-05-11 01:52:34', '2026-05-11 01:52:34'),
(29, 364, NULL, 23, 'FO-0008', 'completada', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-10', '08:01:00', '08:01:00', '10:00:00', NULL, 'Todo bien', 'Todo en orden', '[\"FUMIGACION Y DESINFECCION\"]', '[\"Aspersion a motor\"]', '[{\"id_producto\":47,\"producto\":\"BIOINSECT\",\"metodo\":\"Aspersion a motor\",\"lote\":\"L2026-01\",\"vencimiento\":\"2028-08-07T05:00:00.000000Z\",\"unidad\":null,\"concentracion\":\"20\",\"cantidad\":\"100\"}]', '[\"Areas en General\"]', 'S/N', 'Mantener todo ordenado y limpio', NULL, NULL, '2026-05-11 01:54:31', '2026-05-11 01:54:32', '2026-05-11 01:54:32'),
(30, 381, NULL, 23, 'FO-0009', 'completada', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-10', '10:01:00', '10:01:00', '12:00:00', NULL, 'Todo bien', 'Todo en orden', '[\"INTERVENCION POR CUCARACHAS\"]', '[\"Aspersion a motor\"]', '[{\"id_producto\":19,\"producto\":\"BETAFOX\",\"metodo\":\"Aspersion a motor\",\"lote\":\"L2026-01\",\"vencimiento\":\"2029-07-08T05:00:00.000000Z\",\"unidad\":null,\"concentracion\":\"20\",\"cantidad\":\"100\"}]', '[\"Areas en General\"]', 'S/N', 'Mantener todo limpio y ordenado', NULL, NULL, '2026-05-11 01:56:30', '2026-05-11 01:56:30', '2026-05-11 01:56:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formatos_operacionales`
--

CREATE TABLE `formatos_operacionales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `codigo_documento` varchar(30) NOT NULL DEFAULT 'FO-OP-002',
  `version` varchar(10) NOT NULL DEFAULT '01',
  `id_programacion_servicio` bigint(20) UNSIGNED NOT NULL,
  `id_grupo_programacion` int(10) UNSIGNED DEFAULT NULL,
  `id_usuario_creador` bigint(20) UNSIGNED DEFAULT NULL,
  `correlativo` varchar(20) DEFAULT NULL,
  `estado` enum('borrador','completada') NOT NULL DEFAULT 'borrador',
  `cliente` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora_llegada` time DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_final` time DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `fecha_finalizacion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `formatos_operacionales`
--

INSERT INTO `formatos_operacionales` (`id`, `codigo_documento`, `version`, `id_programacion_servicio`, `id_grupo_programacion`, `id_usuario_creador`, `correlativo`, `estado`, `cliente`, `direccion`, `fecha`, `hora_llegada`, `hora_inicio`, `hora_final`, `observaciones`, `created_at`, `updated_at`, `fecha_finalizacion`) VALUES
(19, 'FO-OP-002', '01', 345, NULL, 22, 'FO-OP-0001', 'borrador', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-01', '06:00:00', '06:00:00', '08:00:00', NULL, '2026-05-11 01:10:42', '2026-05-11 01:14:40', NULL),
(20, 'FO-OP-002', '01', 362, NULL, 22, 'FO-OP-0002', 'borrador', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-01', '08:01:00', '08:01:00', '10:00:00', NULL, '2026-05-11 01:10:47', '2026-05-11 01:17:13', NULL),
(21, 'FO-OP-002', '01', 379, NULL, 22, 'FO-OP-0003', 'borrador', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-01', '10:01:00', '10:01:00', '12:00:00', NULL, '2026-05-11 01:10:56', '2026-05-11 01:19:04', NULL),
(22, 'FO-OP-002', '01', 380, NULL, 23, 'FO-OP-0004', 'borrador', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-16', '10:01:00', '10:01:00', '12:00:00', NULL, '2026-05-11 01:22:31', '2026-05-11 01:22:31', NULL),
(23, 'FO-OP-002', '01', 346, NULL, 23, 'FO-OP-0005', 'borrador', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-16', '06:00:00', '06:00:00', '08:00:00', NULL, '2026-05-11 01:25:03', '2026-05-11 01:25:03', NULL),
(24, 'FO-OP-002', '01', 363, NULL, 23, 'FO-OP-0006', 'borrador', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-16', '08:01:00', '08:01:00', '10:00:00', NULL, '2026-05-11 01:27:00', '2026-05-11 01:27:00', NULL),
(25, 'FO-OP-002', '01', 347, NULL, 23, 'FO-OP-0007', 'borrador', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-31', '06:00:00', '06:00:00', '08:00:00', NULL, '2026-05-11 01:53:34', '2026-05-11 01:53:34', NULL),
(26, 'FO-OP-002', '01', 364, NULL, 23, 'FO-OP-0008', 'borrador', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-31', '08:01:00', '08:01:00', '10:00:00', NULL, '2026-05-11 01:55:40', '2026-05-11 01:55:40', NULL),
(27, 'FO-OP-002', '01', 381, NULL, 23, 'FO-OP-0009', 'borrador', 'GELATERIA LARITZA D SA', 'Av. Comandante Espinar 800, Miraflores 15074', '2026-05-31', '10:01:00', '10:01:00', '12:00:00', NULL, '2026-05-11 01:57:06', '2026-05-11 01:57:06', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formato_operacional_detalles`
--

CREATE TABLE `formato_operacional_detalles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_formato_operacional` bigint(20) UNSIGNED NOT NULL,
  `tipo_seccion` enum('cebo','lamina','trampa_luz','jaula','otros') NOT NULL DEFAULT 'otros',
  `codigo_caja` varchar(15) NOT NULL,
  `orden_caja` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `estado_dispositivo` varchar(20) DEFAULT NULL,
  `estado_dispositivo_verdadera` varchar(20) DEFAULT NULL,
  `estado_dispositivo_auditiva` varchar(20) DEFAULT NULL,
  `hallazgo` varchar(30) DEFAULT NULL,
  `hallazgo_verdadera` varchar(30) DEFAULT NULL,
  `hallazgo_auditiva` varchar(30) DEFAULT NULL,
  `senales_presencia` varchar(30) DEFAULT NULL,
  `senales_presencia_verdadera` varchar(30) DEFAULT NULL,
  `senales_presencia_auditiva` varchar(30) DEFAULT NULL,
  `conteo_insectos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`conteo_insectos`)),
  `estado_lamina` varchar(10) DEFAULT NULL,
  `estado_lamina_verdadera` varchar(10) DEFAULT NULL,
  `estado_lamina_auditiva` varchar(10) DEFAULT NULL,
  `estadio` varchar(20) DEFAULT NULL,
  `conteo_estadio` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`conteo_estadio`)),
  `conteo_estadio_verdadera` int(10) UNSIGNED DEFAULT NULL,
  `conteo_estadio_falsa` int(10) UNSIGNED DEFAULT NULL,
  `numero_lote` varchar(60) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `formato_operacional_detalles`
--

INSERT INTO `formato_operacional_detalles` (`id`, `id_formato_operacional`, `tipo_seccion`, `codigo_caja`, `orden_caja`, `id_producto`, `descripcion`, `ubicacion`, `estado_dispositivo`, `estado_dispositivo_verdadera`, `estado_dispositivo_auditiva`, `hallazgo`, `hallazgo_verdadera`, `hallazgo_auditiva`, `senales_presencia`, `senales_presencia_verdadera`, `senales_presencia_auditiva`, `conteo_insectos`, `estado_lamina`, `estado_lamina_verdadera`, `estado_lamina_auditiva`, `estadio`, `conteo_estadio`, `conteo_estadio_verdadera`, `conteo_estadio_falsa`, `numero_lote`, `created_at`, `updated_at`) VALUES
(212, 19, 'cebo', 'C-01', 1, NULL, 'Cajas cebaderas con cebo', 'Almacen 1', 'B', 'B', 'B', 'C-TP', 'C-TP', '-', 'H', 'H', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:14:40', '2026-05-11 01:14:40'),
(213, 19, 'cebo', 'C-02', 2, NULL, 'Cajas cebaderas con cebo', 'Almacen 2', 'D', 'D', 'B', 'C-R', 'C-R', '-', 'O', 'O', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:14:40', '2026-05-11 01:14:40'),
(214, 19, 'cebo', 'C-03', 3, NULL, 'Cajas cebaderas con cebo', 'Almacen 3', 'B', 'B', 'B', 'C-TP', 'C-TP', 'C-TP', 'H', 'H', 'H', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:14:40', '2026-05-11 01:14:40'),
(215, 19, 'lamina', 'C-04', 4, NULL, 'Cajas cebaderas con lámina pegante', 'Almacen 4', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:14:40', '2026-05-11 01:14:40'),
(216, 19, 'lamina', 'C-05', 5, NULL, 'Cajas cebaderas con lámina pegante', 'Almacen 5', 'B', 'B', 'B', 'C-R', 'C-R', '-', 'H', 'H', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:14:40', '2026-05-11 01:14:40'),
(217, 19, 'jaula', 'J-01', 6, NULL, 'Jaulas', 'Patio', 'B', 'B', 'B', 'C-J', 'C-J', 'C-J', 'H', 'H', 'H', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:14:40', '2026-05-11 01:14:40'),
(218, 19, 'jaula', 'J-02', 7, NULL, 'Jaulas', 'Exterior', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:14:40', '2026-05-11 01:14:40'),
(219, 19, 'jaula', 'J-03', 8, NULL, 'Jaulas', 'Oficina', 'B', 'B', 'B', 'C-J', 'C-J', '-', 'P', 'P', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:14:40', '2026-05-11 01:14:40'),
(220, 20, 'trampa_luz', 'TL-01', 1, NULL, 'Trampa de luz', 'Almacen', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":9,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":8},\"phoridae\":{\"verdadera\":5,\"auditiva\":0},\"psychodidae\":{\"verdadera\":0,\"auditiva\":4},\"chironomidae\":{\"verdadera\":6,\"auditiva\":0},\"culicidae\":{\"verdadera\":0,\"auditiva\":1},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":0,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":4,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:17:13', '2026-05-11 01:17:13'),
(221, 20, 'trampa_luz', 'TL-02', 2, NULL, 'Trampa de luz', 'Exterior', 'A', 'A', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":0,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":0},\"phoridae\":{\"verdadera\":0,\"auditiva\":0},\"psychodidae\":{\"verdadera\":0,\"auditiva\":0},\"chironomidae\":{\"verdadera\":0,\"auditiva\":0},\"culicidae\":{\"verdadera\":0,\"auditiva\":0},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":0,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":0,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:17:13', '2026-05-11 01:17:13'),
(222, 20, 'trampa_luz', 'TL-03', 3, NULL, 'Trampa de luz', 'Oficina', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":2,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":0},\"phoridae\":{\"verdadera\":0,\"auditiva\":3},\"psychodidae\":{\"verdadera\":0,\"auditiva\":0},\"chironomidae\":{\"verdadera\":0,\"auditiva\":0},\"culicidae\":{\"verdadera\":7,\"auditiva\":0},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":5,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":8,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:17:13', '2026-05-11 01:17:13'),
(223, 20, 'trampa_luz', 'TL-04', 4, NULL, 'Trampa de luz', 'Recepción', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":3,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":0},\"phoridae\":{\"verdadera\":2,\"auditiva\":0},\"psychodidae\":{\"verdadera\":0,\"auditiva\":0},\"chironomidae\":{\"verdadera\":5,\"auditiva\":0},\"culicidae\":{\"verdadera\":0,\"auditiva\":0},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":6,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":0,\"auditiva\":5},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:17:13', '2026-05-11 01:17:13'),
(224, 20, 'trampa_luz', 'TL-05', 5, NULL, 'Trampa de luz', 'Terraza', 'AP', 'AP', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":1,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":1},\"phoridae\":{\"verdadera\":3,\"auditiva\":0},\"psychodidae\":{\"verdadera\":2,\"auditiva\":0},\"chironomidae\":{\"verdadera\":5,\"auditiva\":0},\"culicidae\":{\"verdadera\":0,\"auditiva\":1},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":7,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":6,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:17:13', '2026-05-11 01:17:13'),
(225, 21, 'lamina', 'L-01', 1, NULL, 'Láminas pegantes', 'Exterior', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, 'B', 'B', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":0,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":0},\"Ooteca\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:19:04', '2026-05-11 01:19:04'),
(226, 21, 'lamina', 'L-02', 2, NULL, 'Láminas pegantes', 'Exterior', 'M', 'M', 'B', '-', '-', '-', '-', '-', '-', NULL, 'M', 'M', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":2,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":1},\"Ooteca\":{\"verdadera\":3,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:19:04', '2026-05-11 01:19:04'),
(227, 21, 'lamina', 'L-03', 3, NULL, 'Láminas pegantes', 'Exterior', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, 'B', 'B', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":1,\"auditiva\":0},\"Ninfa\":{\"verdadera\":1,\"auditiva\":0},\"Ooteca\":{\"verdadera\":1,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:19:04', '2026-05-11 01:19:04'),
(228, 21, 'lamina', 'L-04', 4, NULL, 'Láminas pegantes', 'Oficina', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, 'B', 'B', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":2,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":2},\"Ooteca\":{\"verdadera\":2,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:19:04', '2026-05-11 01:19:04'),
(229, 21, 'lamina', 'L-05', 5, NULL, 'Láminas pegantes', 'Oficina', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, 'B', 'B', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":0,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":0},\"Ooteca\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:19:04', '2026-05-11 01:19:04'),
(230, 22, 'lamina', 'L-01', 1, NULL, 'Láminas pegantes', 'Exterior', 'B', 'B', 'M', '-', '-', '-', '-', '-', '-', NULL, 'B', 'B', 'M', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":2,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":1},\"Ooteca\":{\"verdadera\":2,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:22:31', '2026-05-11 01:22:31'),
(231, 22, 'lamina', 'L-02', 2, NULL, 'Láminas pegantes', 'Exterior', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, 'B', 'B', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":0,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":0},\"Ooteca\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:22:31', '2026-05-11 01:22:31'),
(232, 22, 'lamina', 'L-03', 3, NULL, 'Láminas pegantes', 'Exterior', 'M', 'M', 'B', '-', '-', '-', '-', '-', '-', NULL, 'M', 'M', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":1,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":2},\"Ooteca\":{\"verdadera\":2,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:22:31', '2026-05-11 01:22:31'),
(233, 22, 'lamina', 'L-04', 4, NULL, 'Láminas pegantes', 'Oficina', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, 'B', 'B', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":0,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":0},\"Ooteca\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:22:31', '2026-05-11 01:22:31'),
(234, 22, 'lamina', 'L-05', 5, NULL, 'Láminas pegantes', 'Oficina', 'M', 'M', 'B', '-', '-', '-', '-', '-', '-', NULL, 'M', 'M', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":5,\"auditiva\":1},\"Ninfa\":{\"verdadera\":6,\"auditiva\":1},\"Ooteca\":{\"verdadera\":7,\"auditiva\":1}}', NULL, NULL, NULL, '2026-05-11 01:22:31', '2026-05-11 01:22:31'),
(235, 23, 'cebo', 'C-01', 1, NULL, 'Cajas cebaderas con cebo', 'Almacen 1', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:25:03', '2026-05-11 01:25:03'),
(236, 23, 'cebo', 'C-02', 2, NULL, 'Cajas cebaderas con cebo', 'Almacen 2', 'D', 'D', 'B', 'C-TP', 'C-TP', 'C-TP', 'E', 'E', 'O', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:25:03', '2026-05-11 01:25:03'),
(237, 23, 'cebo', 'C-03', 3, NULL, 'Cajas cebaderas con cebo', 'Almacen 3', 'B', 'B', 'B', 'C-TP', 'C-TP', '-', 'O', 'O', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:25:03', '2026-05-11 01:25:03'),
(238, 23, 'lamina', 'C-04', 4, NULL, 'Cajas cebaderas con lámina pegante', 'Almacen 4', 'A', 'A', 'B', 'C-TP', 'C-TP', '-', 'H', 'H', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:25:03', '2026-05-11 01:25:03'),
(239, 23, 'lamina', 'C-05', 5, NULL, 'Cajas cebaderas con lámina pegante', 'Almacen 5', 'N', 'N', 'B', 'C-TP', 'C-TP', '-', 'H', 'H', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:25:03', '2026-05-11 01:25:03'),
(240, 23, 'jaula', 'J-01', 6, NULL, 'Jaulas', 'Patio', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:25:03', '2026-05-11 01:25:03'),
(241, 23, 'jaula', 'J-02', 7, NULL, 'Jaulas', 'Exterior', 'A', 'A', 'B', 'C-J', 'C-J', 'C-J', 'H', 'H', 'E', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:25:03', '2026-05-11 01:25:03'),
(242, 23, 'jaula', 'J-03', 8, NULL, 'Jaulas', 'Oficina', 'B', 'B', 'B', 'CNT-SC', 'CNT-SC', 'C-J', 'H', 'H', 'H', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:25:03', '2026-05-11 01:25:03'),
(243, 24, 'trampa_luz', 'TL-01', 1, NULL, 'Trampa de luz', 'Almacen', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":0,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":0},\"phoridae\":{\"verdadera\":0,\"auditiva\":0},\"psychodidae\":{\"verdadera\":0,\"auditiva\":0},\"chironomidae\":{\"verdadera\":0,\"auditiva\":0},\"culicidae\":{\"verdadera\":0,\"auditiva\":0},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":0,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":0,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:27:00', '2026-05-11 01:27:00'),
(244, 24, 'trampa_luz', 'TL-02', 2, NULL, 'Trampa de luz', 'Exterior', 'AP', 'AP', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":1,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":0},\"phoridae\":{\"verdadera\":2,\"auditiva\":1},\"psychodidae\":{\"verdadera\":0,\"auditiva\":0},\"chironomidae\":{\"verdadera\":6,\"auditiva\":1},\"culicidae\":{\"verdadera\":0,\"auditiva\":0},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":6,\"auditiva\":1},\"sarcophagidae_calliphoridae\":{\"verdadera\":2,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:27:00', '2026-05-11 01:27:00'),
(245, 24, 'trampa_luz', 'TL-03', 3, NULL, 'Trampa de luz', 'Oficina', 'B', 'B', 'AP', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":2,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":0},\"phoridae\":{\"verdadera\":3,\"auditiva\":0},\"psychodidae\":{\"verdadera\":0,\"auditiva\":1},\"chironomidae\":{\"verdadera\":0,\"auditiva\":0},\"culicidae\":{\"verdadera\":5,\"auditiva\":0},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":0,\"auditiva\":4},\"sarcophagidae_calliphoridae\":{\"verdadera\":1,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:27:00', '2026-05-11 01:27:00'),
(246, 24, 'trampa_luz', 'TL-04', 4, NULL, 'Trampa de luz', 'Recepción', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":3,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":0},\"phoridae\":{\"verdadera\":0,\"auditiva\":2},\"psychodidae\":{\"verdadera\":0,\"auditiva\":0},\"chironomidae\":{\"verdadera\":5,\"auditiva\":0},\"culicidae\":{\"verdadera\":0,\"auditiva\":6},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":0,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":8,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":9,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:27:00', '2026-05-11 01:27:00'),
(247, 24, 'trampa_luz', 'TL-05', 5, NULL, 'Trampa de luz', 'Terraza', 'D', 'D', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":0,\"auditiva\":2},\"drosophilidae\":{\"verdadera\":5,\"auditiva\":0},\"phoridae\":{\"verdadera\":0,\"auditiva\":1},\"psychodidae\":{\"verdadera\":0,\"auditiva\":0},\"chironomidae\":{\"verdadera\":0,\"auditiva\":0},\"culicidae\":{\"verdadera\":6,\"auditiva\":1},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":0,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":7,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:27:00', '2026-05-11 01:27:00'),
(248, 25, 'cebo', 'C-01', 1, NULL, 'Cajas cebaderas con cebo', 'Almacen 1', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:53:34', '2026-05-11 01:53:34'),
(249, 25, 'cebo', 'C-02', 2, NULL, 'Cajas cebaderas con cebo', 'Almacen 2', 'N', 'N', 'B', 'C-TP', 'C-TP', '-', 'E', 'E', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:53:34', '2026-05-11 01:53:34'),
(250, 25, 'cebo', 'C-03', 3, NULL, 'Cajas cebaderas con cebo', 'Almacen 3', 'B', 'B', 'B', 'CNT-SC', 'CNT-SC', '-', 'P', 'P', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:53:34', '2026-05-11 01:53:34'),
(251, 25, 'lamina', 'C-04', 4, NULL, 'Cajas cebaderas con lámina pegante', 'Almacen 4', 'D', 'D', 'B', 'C-R', 'C-R', '-', 'O', 'O', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:53:34', '2026-05-11 01:53:34'),
(252, 25, 'lamina', 'C-05', 5, NULL, 'Cajas cebaderas con lámina pegante', 'Almacen 5', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:53:34', '2026-05-11 01:53:34'),
(253, 25, 'jaula', 'J-01', 6, NULL, 'Jaulas', 'Patio', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:53:34', '2026-05-11 01:53:34'),
(254, 25, 'jaula', 'J-02', 7, NULL, 'Jaulas', 'Exterior', 'A', 'A', 'B', 'C-J', 'C-J', '-', 'O', 'O', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:53:34', '2026-05-11 01:53:34'),
(255, 25, 'jaula', 'J-03', 8, NULL, 'Jaulas', 'Oficina', 'B', 'B', 'B', 'C-J', 'C-J', 'C-J', 'O', 'O', 'H', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:53:34', '2026-05-11 01:53:34'),
(256, 26, 'trampa_luz', 'TL-01', 1, NULL, 'Trampa de luz', 'Almacen', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":2,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":3,\"auditiva\":0},\"phoridae\":{\"verdadera\":0,\"auditiva\":0},\"psychodidae\":{\"verdadera\":1,\"auditiva\":0},\"chironomidae\":{\"verdadera\":0,\"auditiva\":0},\"culicidae\":{\"verdadera\":2,\"auditiva\":0},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":0,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":5,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:55:40', '2026-05-11 01:55:40'),
(257, 26, 'trampa_luz', 'TL-02', 2, NULL, 'Trampa de luz', 'Exterior', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":0,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":0},\"phoridae\":{\"verdadera\":0,\"auditiva\":0},\"psychodidae\":{\"verdadera\":0,\"auditiva\":0},\"chironomidae\":{\"verdadera\":0,\"auditiva\":0},\"culicidae\":{\"verdadera\":0,\"auditiva\":0},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":0,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":0,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:55:40', '2026-05-11 01:55:40'),
(258, 26, 'trampa_luz', 'TL-03', 3, NULL, 'Trampa de luz', 'Oficina', 'A', 'A', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":2,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":0},\"phoridae\":{\"verdadera\":6,\"auditiva\":1},\"psychodidae\":{\"verdadera\":0,\"auditiva\":1},\"chironomidae\":{\"verdadera\":4,\"auditiva\":1},\"culicidae\":{\"verdadera\":0,\"auditiva\":0},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":5,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":6,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:55:40', '2026-05-11 01:55:40'),
(259, 26, 'trampa_luz', 'TL-04', 4, NULL, 'Trampa de luz', 'Recepción', 'AP', 'AP', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":2,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":3,\"auditiva\":0},\"phoridae\":{\"verdadera\":5,\"auditiva\":0},\"psychodidae\":{\"verdadera\":7,\"auditiva\":0},\"chironomidae\":{\"verdadera\":0,\"auditiva\":1},\"culicidae\":{\"verdadera\":0,\"auditiva\":1},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":0,\"auditiva\":1},\"sarcophagidae_calliphoridae\":{\"verdadera\":5,\"auditiva\":0},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:55:40', '2026-05-11 01:55:40'),
(260, 26, 'trampa_luz', 'TL-05', 5, NULL, 'Trampa de luz', 'Terraza', 'D', 'D', 'B', '-', '-', '-', '-', '-', '-', '{\"muscidae\":{\"verdadera\":2,\"auditiva\":0},\"drosophilidae\":{\"verdadera\":0,\"auditiva\":1},\"phoridae\":{\"verdadera\":3,\"auditiva\":0},\"psychodidae\":{\"verdadera\":0,\"auditiva\":1},\"chironomidae\":{\"verdadera\":4,\"auditiva\":0},\"culicidae\":{\"verdadera\":0,\"auditiva\":1},\"pyralidae_tineridae_gelechidae\":{\"verdadera\":5,\"auditiva\":0},\"sarcophagidae_calliphoridae\":{\"verdadera\":0,\"auditiva\":2},\"otros_no_identificados\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-11 01:55:40', '2026-05-11 01:55:40'),
(261, 27, 'lamina', 'L-01', 1, NULL, 'Láminas pegantes', 'Exterior', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, 'B', 'B', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":2,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":1},\"Ooteca\":{\"verdadera\":1,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:57:06', '2026-05-11 01:57:06'),
(262, 27, 'lamina', 'L-02', 2, NULL, 'Láminas pegantes', 'Exterior', 'M', 'M', 'B', '-', '-', '-', '-', '-', '-', NULL, 'M', 'M', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":2,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":1},\"Ooteca\":{\"verdadera\":3,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:57:06', '2026-05-11 01:57:06'),
(263, 27, 'lamina', 'L-03', 3, NULL, 'Láminas pegantes', 'Exterior', 'D', 'D', 'B', '-', '-', '-', '-', '-', '-', NULL, 'D', 'D', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":0,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":0},\"Ooteca\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:57:06', '2026-05-11 01:57:06'),
(264, 27, 'lamina', 'L-04', 4, NULL, 'Láminas pegantes', 'Oficina', 'B', 'B', 'B', '-', '-', '-', '-', '-', '-', NULL, 'B', 'B', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":0,\"auditiva\":0},\"Ninfa\":{\"verdadera\":0,\"auditiva\":0},\"Ooteca\":{\"verdadera\":0,\"auditiva\":0}}', NULL, NULL, NULL, '2026-05-11 01:57:06', '2026-05-11 01:57:06'),
(265, 27, 'lamina', 'L-05', 5, NULL, 'Láminas pegantes', 'Oficina', 'D', 'D', 'B', '-', '-', '-', '-', '-', '-', NULL, 'D', 'D', 'B', 'MULTIPLE', '{\"Adulto\":{\"verdadera\":2,\"auditiva\":1},\"Ninfa\":{\"verdadera\":4,\"auditiva\":1},\"Ooteca\":{\"verdadera\":5,\"auditiva\":1}}', NULL, NULL, NULL, '2026-05-11 01:57:06', '2026-05-11 01:57:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id` int(11) NOT NULL,
  `id_productos` int(11) DEFAULT NULL,
  `cantidad_disponible` int(11) NOT NULL,
  `stock_seguridad` int(11) NOT NULL,
  `Tipo` enum('Entrada','Salida') DEFAULT NULL,
  `Cantidad_total` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id`, `id_productos`, `cantidad_disponible`, `stock_seguridad`, `Tipo`, `Cantidad_total`) VALUES
(1, 1, 1340, 50, 'Entrada', 0),
(2, 2, 9465, 25, 'Entrada', 0),
(3, 3, 10653, 2250, 'Entrada', 0),
(4, 4, 60, 100, 'Entrada', 0),
(5, 5, 14935, 12, 'Entrada', 15000),
(6, 6, 14961, 20, 'Entrada', 15000),
(7, 7, 0, 6, 'Entrada', 0),
(8, 8, 3, 1, 'Entrada', 0),
(9, 9, 2, 1, 'Entrada', 0),
(10, 10, 2, 1, 'Entrada', 0),
(11, 11, 1, 1, 'Entrada', 0),
(12, 12, 3, 1, 'Entrada', 0),
(13, 13, 2, 1, 'Entrada', 0),
(14, 14, 3, 1, 'Entrada', 0),
(15, 15, 2, 1, 'Entrada', 0),
(16, 16, 5, 1, 'Entrada', 0),
(17, 17, 0, 1, 'Entrada', 0),
(18, 18, 1, 1, 'Entrada', 0),
(19, 19, 13700, 2000, 'Entrada', 15000),
(20, 20, 0, 500, 'Entrada', 0),
(21, 21, 14961, 200, 'Entrada', 15000),
(22, 22, 72, 500, 'Entrada', 0),
(23, 23, 149909, 36, 'Entrada', 150000),
(24, 24, 150000, 2000, 'Entrada', 150000),
(25, 25, 12, 6, 'Entrada', 0),
(26, 26, 56, 10, 'Entrada', 0),
(27, 27, 0, 100, 'Entrada', 0),
(28, 28, 152, 20, 'Entrada', 0),
(29, 29, 224, 20, 'Entrada', 0),
(30, 30, 0, 20, 'Entrada', 0),
(31, 31, 0, 20, 'Entrada', 0),
(32, 32, 0, 1, 'Entrada', 0),
(33, 33, 0, 30, 'Entrada', 0),
(34, 34, 0, 900, 'Entrada', 0),
(35, 35, 0, 200, 'Entrada', 0),
(36, 36, 150, 90, 'Entrada', 0),
(37, 37, 16, 3, 'Entrada', 0),
(38, 38, 0, 2000, 'Entrada', 0),
(39, 39, 0, 1000, 'Entrada', 0),
(40, 40, 0, 3750, 'Entrada', 0),
(41, 41, 0, 1000, 'Entrada', 0),
(42, 42, 0, 2000, 'Entrada', 0),
(43, 43, 0, 1500, 'Entrada', 0),
(44, 44, 148700, 500, 'Entrada', 150000),
(45, 45, 0, 1000, 'Entrada', 0),
(46, 46, 0, 1000, 'Entrada', 0),
(47, 47, 13700, 1000, 'Entrada', 15000),
(48, 48, 0, 500, 'Entrada', 0),
(49, 49, 0, 500, 'Entrada', 0),
(50, 50, 0, 500, 'Entrada', 0),
(51, 51, 0, 50, 'Entrada', 0),
(52, 52, 0, 6, 'Entrada', 0),
(53, 53, 0, 11, 'Entrada', 0),
(54, 54, 0, 2, 'Entrada', 0),
(55, 55, 0, 10, 'Entrada', 0),
(56, 56, 0, 10, 'Entrada', 0),
(57, 57, 14935, 1, 'Entrada', 15000),
(58, 58, 0, 500, 'Entrada', 0),
(59, 59, 0, 1, 'Entrada', 0),
(60, 60, 0, 1, 'Entrada', 0),
(61, 61, 2, 1, 'Entrada', 32);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_ajustes`
--

CREATE TABLE `inventario_ajustes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_lote` bigint(20) UNSIGNED DEFAULT NULL,
  `stock_anterior` int(11) NOT NULL,
  `stock_nuevo` int(11) NOT NULL,
  `diferencia` int(11) NOT NULL,
  `tipo_ajuste` enum('Entrada','Salida') NOT NULL,
  `motivo` varchar(120) NOT NULL,
  `observacion` text DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `fecha_ajuste` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_kardex` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inventario_ajustes`
--

INSERT INTO `inventario_ajustes` (`id`, `id_producto`, `id_lote`, `stock_anterior`, `stock_nuevo`, `diferencia`, `tipo_ajuste`, `motivo`, `observacion`, `id_usuario`, `fecha_ajuste`, `id_kardex`) VALUES
(5, 9, NULL, 0, 2, 2, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:03:29', 68),
(6, 8, NULL, 0, 3, 3, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:03:51', 69),
(7, 10, NULL, 0, 2, 2, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:04:00', 70),
(8, 11, NULL, 0, 1, 1, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:04:18', 71),
(9, 12, NULL, 0, 3, 3, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:04:33', 72),
(10, 13, NULL, 0, 2, 2, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:04:46', 73),
(11, 14, NULL, 0, 3, 3, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:05:09', 74),
(12, 15, NULL, 0, 2, 2, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:05:24', 75),
(13, 16, NULL, 0, 5, 5, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:05:37', 76),
(14, 18, NULL, 0, 1, 1, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:05:49', 77),
(15, 25, NULL, 0, 16, 16, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 17:47:14', 84),
(16, 5, NULL, 0, 31, 31, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 17:51:19', 85),
(17, 26, NULL, 0, 48, 48, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 17:51:35', 86),
(18, 6, NULL, 0, 10, 10, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 17:52:05', 87),
(19, 4, NULL, 5, 127, 122, 'Entrada', 'Conteo físico', 'prueba', 7, '2026-04-13 18:02:40', 89),
(20, 4, NULL, 127, 200, 73, 'Entrada', 'Conteo físico', 'prueba', 7, '2026-04-13 18:03:05', 90),
(21, 25, NULL, 14, 12, -2, 'Salida', 'Regularización', 'VENTA AGRICOLA ECOLOGICA', 7, '2026-04-14 21:21:31', 100),
(22, 37, NULL, 0, 20, 20, 'Entrada', 'Conteo físico', NULL, 17, '2026-04-18 13:03:45', 106);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `kardex`
--

CREATE TABLE `kardex` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_lote` bigint(20) UNSIGNED DEFAULT NULL,
  `tipo_movimiento` enum('Entrada','Salida') NOT NULL,
  `cantidad` int(11) NOT NULL,
  `stock_anterior` int(11) NOT NULL,
  `stock_posterior` int(11) NOT NULL,
  `motivo` varchar(100) NOT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `id_referencia` bigint(20) UNSIGNED DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `fecha_movimiento` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `kardex`
--

INSERT INTO `kardex` (`id`, `id_producto`, `id_lote`, `tipo_movimiento`, `cantidad`, `stock_anterior`, `stock_posterior`, `motivo`, `referencia`, `id_referencia`, `id_usuario`, `observacion`, `fecha_movimiento`) VALUES
(68, 9, NULL, 'Entrada', 2, 0, 2, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 14:03:29'),
(69, 8, NULL, 'Entrada', 3, 0, 3, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 14:03:51'),
(70, 10, NULL, 'Entrada', 2, 0, 2, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 14:04:00'),
(71, 11, NULL, 'Entrada', 1, 0, 1, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 14:04:18'),
(72, 12, NULL, 'Entrada', 3, 0, 3, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 14:04:33'),
(73, 13, NULL, 'Entrada', 2, 0, 2, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 14:04:46'),
(74, 14, NULL, 'Entrada', 3, 0, 3, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 14:05:09'),
(75, 15, NULL, 'Entrada', 2, 0, 2, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 14:05:24'),
(76, 16, NULL, 'Entrada', 5, 0, 5, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 14:05:37'),
(77, 18, NULL, 'Entrada', 1, 0, 1, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 14:05:49'),
(78, 11, NULL, 'Salida', 1, 1, 0, 'Entrega EPP', 'EPP-2026-001', 1, NULL, 'Entrega EPP EPP-2026-001 a técnico', '2026-04-13 15:23:50'),
(79, 16, NULL, 'Salida', 1, 5, 4, 'Entrega EPP', 'EPP-2026-001', 1, NULL, 'Entrega EPP EPP-2026-001 a técnico', '2026-04-13 15:23:50'),
(80, 9, NULL, 'Salida', 1, 2, 1, 'Entrega EPP', 'EPP-2026-001', 1, NULL, 'Entrega EPP EPP-2026-001 a técnico', '2026-04-13 15:23:50'),
(81, 11, NULL, 'Entrada', 1, 0, 1, 'Devolución EPP', 'EPP-2026-001', 1, NULL, 'Devolución EPP EPP-2026-001', '2026-04-13 15:25:25'),
(82, 16, NULL, 'Entrada', 1, 4, 5, 'Devolución EPP', 'EPP-2026-001', 1, NULL, 'Devolución EPP EPP-2026-001', '2026-04-13 15:25:25'),
(83, 9, NULL, 'Entrada', 1, 1, 2, 'Devolución EPP', 'EPP-2026-001', 1, NULL, 'Devolución EPP EPP-2026-001', '2026-04-13 15:25:25'),
(84, 25, NULL, 'Entrada', 16, 0, 16, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 17:47:14'),
(85, 5, NULL, 'Entrada', 31, 0, 31, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 17:51:19'),
(86, 26, NULL, 'Entrada', 48, 0, 48, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 17:51:35'),
(87, 6, NULL, 'Entrada', 10, 0, 10, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, NULL, '2026-04-13 17:52:05'),
(88, 25, NULL, 'Salida', 2, 16, 14, 'Orden Producto', 'OP-2026-001', 1, NULL, 'Salida confirmada por almacén.', '2026-04-13 17:56:17'),
(89, 4, NULL, 'Entrada', 122, 5, 127, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, 'prueba', '2026-04-13 18:02:40'),
(90, 4, NULL, 'Entrada', 73, 127, 200, 'Conteo físico', 'Ajuste de Inventario', NULL, NULL, 'prueba', '2026-04-13 18:03:05'),
(91, 2, NULL, 'Salida', 127, 9605, 9478, 'Salida Programación Fabricación', 'PROGFAB-10', 10, NULL, 'Salida confirmada por almacén.', '2026-04-13 18:03:23'),
(92, 3, NULL, 'Salida', 239, 10905, 10666, 'Salida Programación Fabricación', 'PROGFAB-10', 10, NULL, 'Salida confirmada por almacén.', '2026-04-13 18:03:23'),
(93, 4, NULL, 'Salida', 127, 200, 73, 'Salida Programación Fabricación', 'PROGFAB-10', 10, NULL, 'Salida confirmada por almacén.', '2026-04-13 18:03:23'),
(94, 1, NULL, 'Entrada', 150, 1190, 1340, 'Entrada por fabricación', 'CIERRE-PROGFAB-10', 10, NULL, 'Ingreso de producto terminado por cierre de fabricación.', '2026-04-13 18:04:11'),
(95, 2, NULL, 'Salida', 13, 9478, 9465, 'Salida por diferencia de fabricación', 'CIERRE-PROGFAB-10', 10, NULL, 'Consumo adicional de materia prima por fabricación mayor a la esperada.', '2026-04-13 18:04:11'),
(96, 3, NULL, 'Salida', 13, 10666, 10653, 'Salida por diferencia de fabricación', 'CIERRE-PROGFAB-10', 10, NULL, 'Consumo adicional de materia prima por fabricación mayor a la esperada.', '2026-04-13 18:04:11'),
(97, 4, NULL, 'Salida', 13, 73, 60, 'Salida por diferencia de fabricación', 'CIERRE-PROGFAB-10', 10, NULL, 'Consumo adicional de materia prima por fabricación mayor a la esperada.', '2026-04-13 18:04:11'),
(98, 28, NULL, 'Entrada', 152, 0, 152, 'Orden de Compra', 'OC-2026-0001', 1, NULL, 'Recepción OC: FF01-001460', '2026-04-14 20:22:30'),
(99, 29, NULL, 'Entrada', 224, 0, 224, 'Orden de Compra', 'OC-2026-0001', 1, NULL, 'Recepción OC: FF01-001460', '2026-04-14 20:22:30'),
(100, 25, NULL, 'Salida', 2, 14, 12, 'Regularización', 'Ajuste de Inventario', NULL, NULL, 'VENTA AGRICOLA ECOLOGICA', '2026-04-14 21:21:31'),
(101, 5, NULL, 'Entrada', 20, 31, 51, 'Devolución Programación', 'PROG-105', 105, 11, 'Devolución por eliminación de programación #105', '2026-04-15 16:30:44'),
(102, 6, NULL, 'Entrada', 24, 10, 34, 'Devolución Programación', 'PROG-105', 105, 11, 'Devolución por eliminación de programación #105', '2026-04-15 16:30:44'),
(103, 26, NULL, 'Entrada', 8, 48, 56, 'Devolución Programación', 'PROG-105', 105, 11, 'Devolución por eliminación de programación #105', '2026-04-15 16:30:44'),
(104, 21, NULL, 'Entrada', 20, 0, 20, 'Devolución Programación', 'PROG-105', 105, 11, 'Devolución por eliminación de programación #105', '2026-04-15 16:30:44'),
(105, 22, NULL, 'Entrada', 72, 0, 72, 'Devolución Programación', 'PROG-105', 105, 11, 'Devolución por eliminación de programación #105', '2026-04-15 16:30:44'),
(106, 37, NULL, 'Entrada', 20, 0, 20, 'Conteo físico', 'Ajuste de Inventario', NULL, 17, NULL, '2026-04-18 13:03:45'),
(107, 37, NULL, 'Salida', 4, 20, 16, 'Orden Producto', 'OP-2026-002', 2, 17, 'Salida confirmada por almacén.', '2026-04-18 13:04:00'),
(108, 36, NULL, 'Entrada', 150, 0, 150, 'Orden de Compra', 'OC-2026-0002', 2, 17, 'Recepción OC: F002-00003201', '2026-04-18 13:38:38'),
(109, 61, 1, 'Entrada', 30, 0, 30, 'Orden de Compra', 'OC-2026-0003', 3, 17, 'Recepción OC: F201-7134', '2026-04-30 15:19:03'),
(110, 61, 1, 'Salida', 30, 32, 2, 'Orden Producto', 'OP-2026-003', 3, 17, 'Salida confirmada por almacén.', '2026-04-30 15:24:01'),
(111, 5, 11, 'Salida', 5, 15000, 14995, 'Salida Programación', 'GRUPO-PROGS', 141, 22, 'Salida confirmada por almacén. Progs: [141,158,175]. ', '2026-05-09 23:11:04'),
(112, 21, 6, 'Salida', 3, 15000, 14997, 'Salida Programación', 'GRUPO-PROGS', 141, 22, 'Salida confirmada por almacén. Progs: [141,158,175]. ', '2026-05-09 23:11:04'),
(113, 23, 9, 'Salida', 7, 150000, 149993, 'Salida Programación', 'GRUPO-PROGS', 141, 22, 'Salida confirmada por almacén. Progs: [141,158,175]. ', '2026-05-09 23:11:04'),
(114, 6, 8, 'Salida', 3, 15000, 14997, 'Salida Programación', 'GRUPO-PROGS', 141, 22, 'Salida confirmada por almacén. Progs: [141,158,175]. ', '2026-05-09 23:11:04'),
(115, 44, 7, 'Salida', 100, 150000, 149900, 'Salida Programación', 'GRUPO-PROGS', 141, 22, 'Salida confirmada por almacén. Progs: [141,158,175]. ', '2026-05-09 23:11:04'),
(116, 57, 10, 'Salida', 5, 15000, 14995, 'Salida Programación', 'GRUPO-PROGS', 141, 22, 'Salida confirmada por almacén. Progs: [141,158,175]. ', '2026-05-09 23:11:04'),
(117, 47, 4, 'Salida', 100, 15000, 14900, 'Salida Programación', 'GRUPO-PROGS', 141, 22, 'Salida confirmada por almacén. Progs: [141,158,175]. ', '2026-05-09 23:11:04'),
(118, 19, 3, 'Salida', 100, 15000, 14900, 'Salida Programación', 'GRUPO-PROGS', 141, 22, 'Salida confirmada por almacén. Progs: [141,158,175]. ', '2026-05-09 23:11:04'),
(119, 5, 11, 'Salida', 5, 14995, 14990, 'Salida Programación', 'PROG-193', 193, 22, 'Salida confirmada por almacén. Progs: [193]. ', '2026-05-10 03:10:28'),
(120, 21, 6, 'Salida', 3, 14997, 14994, 'Salida Programación', 'PROG-193', 193, 22, 'Salida confirmada por almacén. Progs: [193]. ', '2026-05-10 03:10:28'),
(121, 23, 9, 'Salida', 2, 149993, 149991, 'Salida Programación', 'PROG-193', 193, 22, 'Salida confirmada por almacén. Progs: [193]. ', '2026-05-10 03:10:28'),
(122, 6, 8, 'Salida', 3, 14997, 14994, 'Salida Programación', 'PROG-193', 193, 22, 'Salida confirmada por almacén. Progs: [193]. ', '2026-05-10 03:10:28'),
(123, 44, 7, 'Salida', 100, 149900, 149800, 'Salida Programación', 'PROG-193', 193, 22, 'Salida confirmada por almacén. Progs: [193]. ', '2026-05-10 03:10:28'),
(124, 5, 11, 'Salida', 5, 14990, 14985, 'Salida Programación', 'PROG-192', 192, 22, 'Salida confirmada por almacén. Progs: [192]. ', '2026-05-10 03:11:03'),
(125, 21, 6, 'Salida', 3, 14994, 14991, 'Salida Programación', 'PROG-192', 192, 22, 'Salida confirmada por almacén. Progs: [192]. ', '2026-05-10 03:11:03'),
(126, 23, 9, 'Salida', 2, 149991, 149989, 'Salida Programación', 'PROG-192', 192, 22, 'Salida confirmada por almacén. Progs: [192]. ', '2026-05-10 03:11:03'),
(127, 6, 8, 'Salida', 3, 14994, 14991, 'Salida Programación', 'PROG-192', 192, 22, 'Salida confirmada por almacén. Progs: [192]. ', '2026-05-10 03:11:03'),
(128, 44, 7, 'Salida', 100, 149800, 149700, 'Salida Programación', 'PROG-192', 192, 22, 'Salida confirmada por almacén. Progs: [192]. ', '2026-05-10 03:11:03'),
(129, 57, 10, 'Salida', 5, 14995, 14990, 'Salida Programación', 'PROG-209', 209, 22, 'Salida confirmada por almacén. Progs: [209]. ', '2026-05-10 03:11:08'),
(130, 47, 4, 'Salida', 100, 14900, 14800, 'Salida Programación', 'PROG-209', 209, 22, 'Salida confirmada por almacén. Progs: [209]. ', '2026-05-10 03:11:08'),
(131, 23, 9, 'Salida', 5, 149989, 149984, 'Salida Programación', 'PROG-226', 226, 22, 'Salida confirmada por almacén. Progs: [226]. ', '2026-05-10 03:11:14'),
(132, 19, 3, 'Salida', 100, 14900, 14800, 'Salida Programación', 'PROG-226', 226, 22, 'Salida confirmada por almacén. Progs: [226]. ', '2026-05-10 03:11:14'),
(133, 57, 10, 'Salida', 5, 14990, 14985, 'Salida Programación', 'PROG-210', 210, 22, 'Salida confirmada por almacén. Progs: [210]. ', '2026-05-10 03:11:20'),
(134, 47, 4, 'Salida', 100, 14800, 14700, 'Salida Programación', 'PROG-210', 210, 22, 'Salida confirmada por almacén. Progs: [210]. ', '2026-05-10 03:11:20'),
(135, 23, 9, 'Salida', 5, 149984, 149979, 'Salida Programación', 'PROG-227', 227, 22, 'Salida confirmada por almacén. Progs: [227]. ', '2026-05-10 03:11:28'),
(136, 19, 3, 'Salida', 100, 14800, 14700, 'Salida Programación', 'PROG-227', 227, 22, 'Salida confirmada por almacén. Progs: [227]. ', '2026-05-10 03:11:28'),
(137, 5, 11, 'Salida', 5, 14985, 14980, 'Salida Programación', 'PROG-194', 194, 22, 'Salida confirmada por almacén. Progs: [194]. ', '2026-05-10 03:11:35'),
(138, 21, 6, 'Salida', 3, 14991, 14988, 'Salida Programación', 'PROG-194', 194, 22, 'Salida confirmada por almacén. Progs: [194]. ', '2026-05-10 03:11:35'),
(139, 23, 9, 'Salida', 2, 149979, 149977, 'Salida Programación', 'PROG-194', 194, 22, 'Salida confirmada por almacén. Progs: [194]. ', '2026-05-10 03:11:35'),
(140, 6, 8, 'Salida', 3, 14991, 14988, 'Salida Programación', 'PROG-194', 194, 22, 'Salida confirmada por almacén. Progs: [194]. ', '2026-05-10 03:11:35'),
(141, 44, 7, 'Salida', 100, 149700, 149600, 'Salida Programación', 'PROG-194', 194, 22, 'Salida confirmada por almacén. Progs: [194]. ', '2026-05-10 03:11:35'),
(142, 57, 10, 'Salida', 5, 14985, 14980, 'Salida Programación', 'PROG-211', 211, 22, 'Salida confirmada por almacén. Progs: [211]. ', '2026-05-10 03:11:42'),
(143, 47, 4, 'Salida', 100, 14700, 14600, 'Salida Programación', 'PROG-211', 211, 22, 'Salida confirmada por almacén. Progs: [211]. ', '2026-05-10 03:11:42'),
(144, 23, 9, 'Salida', 5, 149977, 149972, 'Salida Programación', 'PROG-228', 228, 22, 'Salida confirmada por almacén. Progs: [228]. ', '2026-05-10 03:11:48'),
(145, 19, 3, 'Salida', 100, 14700, 14600, 'Salida Programación', 'PROG-228', 228, 22, 'Salida confirmada por almacén. Progs: [228]. ', '2026-05-10 03:11:48'),
(146, 5, 11, 'Salida', 5, 14980, 14975, 'Salida Programación', 'PROG-243', 243, 22, 'Salida confirmada por almacén. Progs: [243]. ', '2026-05-10 17:59:14'),
(147, 21, 6, 'Salida', 3, 14988, 14985, 'Salida Programación', 'PROG-243', 243, 22, 'Salida confirmada por almacén. Progs: [243]. ', '2026-05-10 17:59:14'),
(148, 23, 9, 'Salida', 2, 149972, 149970, 'Salida Programación', 'PROG-243', 243, 22, 'Salida confirmada por almacén. Progs: [243]. ', '2026-05-10 17:59:14'),
(149, 6, 8, 'Salida', 3, 14988, 14985, 'Salida Programación', 'PROG-243', 243, 22, 'Salida confirmada por almacén. Progs: [243]. ', '2026-05-10 17:59:14'),
(150, 44, 7, 'Salida', 100, 149600, 149500, 'Salida Programación', 'PROG-243', 243, 22, 'Salida confirmada por almacén. Progs: [243]. ', '2026-05-10 17:59:14'),
(151, 57, 10, 'Salida', 5, 14980, 14975, 'Salida Programación', 'PROG-260', 260, 22, 'Salida confirmada por almacén. Progs: [260]. ', '2026-05-10 17:59:21'),
(152, 47, 4, 'Salida', 100, 14600, 14500, 'Salida Programación', 'PROG-260', 260, 22, 'Salida confirmada por almacén. Progs: [260]. ', '2026-05-10 17:59:21'),
(153, 23, 9, 'Salida', 5, 149970, 149965, 'Salida Programación', 'PROG-277', 277, 22, 'Salida confirmada por almacén. Progs: [277]. ', '2026-05-10 17:59:27'),
(154, 19, 3, 'Salida', 100, 14600, 14500, 'Salida Programación', 'PROG-277', 277, 22, 'Salida confirmada por almacén. Progs: [277]. ', '2026-05-10 17:59:27'),
(155, 5, 11, 'Salida', 5, 14975, 14970, 'Salida Programación', 'PROG-244', 244, 22, 'Salida confirmada por almacén. Progs: [244]. ', '2026-05-10 17:59:33'),
(156, 21, 6, 'Salida', 3, 14985, 14982, 'Salida Programación', 'PROG-244', 244, 22, 'Salida confirmada por almacén. Progs: [244]. ', '2026-05-10 17:59:33'),
(157, 23, 9, 'Salida', 2, 149965, 149963, 'Salida Programación', 'PROG-244', 244, 22, 'Salida confirmada por almacén. Progs: [244]. ', '2026-05-10 17:59:33'),
(158, 6, 8, 'Salida', 3, 14985, 14982, 'Salida Programación', 'PROG-244', 244, 22, 'Salida confirmada por almacén. Progs: [244]. ', '2026-05-10 17:59:33'),
(159, 44, 7, 'Salida', 100, 149500, 149400, 'Salida Programación', 'PROG-244', 244, 22, 'Salida confirmada por almacén. Progs: [244]. ', '2026-05-10 17:59:33'),
(160, 57, 10, 'Salida', 5, 14975, 14970, 'Salida Programación', 'PROG-261', 261, 22, 'Salida confirmada por almacén. Progs: [261]. ', '2026-05-10 17:59:38'),
(161, 47, 4, 'Salida', 100, 14500, 14400, 'Salida Programación', 'PROG-261', 261, 22, 'Salida confirmada por almacén. Progs: [261]. ', '2026-05-10 17:59:38'),
(162, 23, 9, 'Salida', 5, 149963, 149958, 'Salida Programación', 'PROG-278', 278, 22, 'Salida confirmada por almacén. Progs: [278]. ', '2026-05-10 17:59:43'),
(163, 19, 3, 'Salida', 100, 14500, 14400, 'Salida Programación', 'PROG-278', 278, 22, 'Salida confirmada por almacén. Progs: [278]. ', '2026-05-10 17:59:43'),
(164, 5, 11, 'Salida', 5, 14970, 14965, 'Salida Programación', 'PROG-245', 245, 22, 'Salida confirmada por almacén. Progs: [245]. ', '2026-05-10 17:59:49'),
(165, 21, 6, 'Salida', 3, 14982, 14979, 'Salida Programación', 'PROG-245', 245, 22, 'Salida confirmada por almacén. Progs: [245]. ', '2026-05-10 17:59:49'),
(166, 23, 9, 'Salida', 2, 149958, 149956, 'Salida Programación', 'PROG-245', 245, 22, 'Salida confirmada por almacén. Progs: [245]. ', '2026-05-10 17:59:49'),
(167, 6, 8, 'Salida', 3, 14982, 14979, 'Salida Programación', 'PROG-245', 245, 22, 'Salida confirmada por almacén. Progs: [245]. ', '2026-05-10 17:59:49'),
(168, 44, 7, 'Salida', 100, 149400, 149300, 'Salida Programación', 'PROG-245', 245, 22, 'Salida confirmada por almacén. Progs: [245]. ', '2026-05-10 17:59:49'),
(169, 57, 10, 'Salida', 5, 14970, 14965, 'Salida Programación', 'PROG-262', 262, 22, 'Salida confirmada por almacén. Progs: [262]. ', '2026-05-10 17:59:54'),
(170, 47, 4, 'Salida', 100, 14400, 14300, 'Salida Programación', 'PROG-262', 262, 22, 'Salida confirmada por almacén. Progs: [262]. ', '2026-05-10 17:59:54'),
(171, 23, 9, 'Salida', 5, 149956, 149951, 'Salida Programación', 'PROG-279', 279, 22, 'Salida confirmada por almacén. Progs: [279]. ', '2026-05-10 17:59:59'),
(172, 19, 3, 'Salida', 100, 14400, 14300, 'Salida Programación', 'PROG-279', 279, 22, 'Salida confirmada por almacén. Progs: [279]. ', '2026-05-10 17:59:59'),
(173, 5, 11, 'Salida', 5, 14965, 14960, 'Salida Programación', 'PROG-294', 294, 22, 'Salida confirmada por almacén. Progs: [294]. ', '2026-05-10 18:25:08'),
(174, 21, 6, 'Salida', 3, 14979, 14976, 'Salida Programación', 'PROG-294', 294, 22, 'Salida confirmada por almacén. Progs: [294]. ', '2026-05-10 18:25:08'),
(175, 23, 9, 'Salida', 2, 149951, 149949, 'Salida Programación', 'PROG-294', 294, 22, 'Salida confirmada por almacén. Progs: [294]. ', '2026-05-10 18:25:08'),
(176, 6, 8, 'Salida', 3, 14979, 14976, 'Salida Programación', 'PROG-294', 294, 22, 'Salida confirmada por almacén. Progs: [294]. ', '2026-05-10 18:25:08'),
(177, 44, 7, 'Salida', 100, 149300, 149200, 'Salida Programación', 'PROG-294', 294, 22, 'Salida confirmada por almacén. Progs: [294]. ', '2026-05-10 18:25:08'),
(178, 57, 10, 'Salida', 5, 14965, 14960, 'Salida Programación', 'PROG-311', 311, 22, 'Salida confirmada por almacén. Progs: [311]. ', '2026-05-10 18:25:34'),
(179, 47, 4, 'Salida', 100, 14300, 14200, 'Salida Programación', 'PROG-311', 311, 22, 'Salida confirmada por almacén. Progs: [311]. ', '2026-05-10 18:25:34'),
(180, 23, 9, 'Salida', 5, 149949, 149944, 'Salida Programación', 'PROG-328', 328, 22, 'Salida confirmada por almacén. Progs: [328]. ', '2026-05-10 18:25:56'),
(181, 19, 3, 'Salida', 100, 14300, 14200, 'Salida Programación', 'PROG-328', 328, 22, 'Salida confirmada por almacén. Progs: [328]. ', '2026-05-10 18:25:56'),
(182, 5, 11, 'Salida', 5, 14960, 14955, 'Salida Programación', 'PROG-295', 295, 22, 'Salida confirmada por almacén. Progs: [295]. ', '2026-05-10 18:26:08'),
(183, 21, 6, 'Salida', 3, 14976, 14973, 'Salida Programación', 'PROG-295', 295, 22, 'Salida confirmada por almacén. Progs: [295]. ', '2026-05-10 18:26:08'),
(184, 23, 9, 'Salida', 2, 149944, 149942, 'Salida Programación', 'PROG-295', 295, 22, 'Salida confirmada por almacén. Progs: [295]. ', '2026-05-10 18:26:08'),
(185, 6, 8, 'Salida', 3, 14976, 14973, 'Salida Programación', 'PROG-295', 295, 22, 'Salida confirmada por almacén. Progs: [295]. ', '2026-05-10 18:26:08'),
(186, 44, 7, 'Salida', 100, 149200, 149100, 'Salida Programación', 'PROG-295', 295, 22, 'Salida confirmada por almacén. Progs: [295]. ', '2026-05-10 18:26:08'),
(187, 57, 10, 'Salida', 5, 14960, 14955, 'Salida Programación', 'PROG-312', 312, 22, 'Salida confirmada por almacén. Progs: [312]. ', '2026-05-10 18:26:26'),
(188, 47, 4, 'Salida', 100, 14200, 14100, 'Salida Programación', 'PROG-312', 312, 22, 'Salida confirmada por almacén. Progs: [312]. ', '2026-05-10 18:26:26'),
(189, 23, 9, 'Salida', 5, 149942, 149937, 'Salida Programación', 'PROG-329', 329, 22, 'Salida confirmada por almacén. Progs: [329]. ', '2026-05-10 18:26:32'),
(190, 19, 3, 'Salida', 100, 14200, 14100, 'Salida Programación', 'PROG-329', 329, 22, 'Salida confirmada por almacén. Progs: [329]. ', '2026-05-10 18:26:32'),
(191, 5, 11, 'Salida', 5, 14955, 14950, 'Salida Programación', 'PROG-296', 296, 22, 'Salida confirmada por almacén. Progs: [296]. ', '2026-05-10 18:26:39'),
(192, 21, 6, 'Salida', 3, 14973, 14970, 'Salida Programación', 'PROG-296', 296, 22, 'Salida confirmada por almacén. Progs: [296]. ', '2026-05-10 18:26:39'),
(193, 23, 9, 'Salida', 2, 149937, 149935, 'Salida Programación', 'PROG-296', 296, 22, 'Salida confirmada por almacén. Progs: [296]. ', '2026-05-10 18:26:39'),
(194, 6, 8, 'Salida', 3, 14973, 14970, 'Salida Programación', 'PROG-296', 296, 22, 'Salida confirmada por almacén. Progs: [296]. ', '2026-05-10 18:26:39'),
(195, 44, 7, 'Salida', 100, 149100, 149000, 'Salida Programación', 'PROG-296', 296, 22, 'Salida confirmada por almacén. Progs: [296]. ', '2026-05-10 18:26:39'),
(196, 57, 10, 'Salida', 5, 14955, 14950, 'Salida Programación', 'PROG-313', 313, 22, 'Salida confirmada por almacén. Progs: [313]. ', '2026-05-10 18:26:46'),
(197, 47, 4, 'Salida', 100, 14100, 14000, 'Salida Programación', 'PROG-313', 313, 22, 'Salida confirmada por almacén. Progs: [313]. ', '2026-05-10 18:26:46'),
(198, 23, 9, 'Salida', 5, 149935, 149930, 'Salida Programación', 'PROG-330', 330, 22, 'Salida confirmada por almacén. Progs: [330]. ', '2026-05-10 18:26:50'),
(199, 19, 3, 'Salida', 100, 14100, 14000, 'Salida Programación', 'PROG-330', 330, 22, 'Salida confirmada por almacén. Progs: [330]. ', '2026-05-10 18:26:50'),
(200, 5, 11, 'Salida', 5, 14950, 14945, 'Salida Programación', 'PROG-345', 345, 22, 'Salida confirmada por almacén. Progs: [345]. ', '2026-05-11 01:08:25'),
(201, 21, 6, 'Salida', 3, 14970, 14967, 'Salida Programación', 'PROG-345', 345, 22, 'Salida confirmada por almacén. Progs: [345]. ', '2026-05-11 01:08:25'),
(202, 23, 9, 'Salida', 2, 149930, 149928, 'Salida Programación', 'PROG-345', 345, 22, 'Salida confirmada por almacén. Progs: [345]. ', '2026-05-11 01:08:25'),
(203, 6, 8, 'Salida', 3, 14970, 14967, 'Salida Programación', 'PROG-345', 345, 22, 'Salida confirmada por almacén. Progs: [345]. ', '2026-05-11 01:08:25'),
(204, 44, 7, 'Salida', 100, 149000, 148900, 'Salida Programación', 'PROG-345', 345, 22, 'Salida confirmada por almacén. Progs: [345]. ', '2026-05-11 01:08:25'),
(205, 57, 10, 'Salida', 5, 14950, 14945, 'Salida Programación', 'PROG-362', 362, 22, 'Salida confirmada por almacén. Progs: [362]. ', '2026-05-11 01:08:32'),
(206, 47, 4, 'Salida', 100, 14000, 13900, 'Salida Programación', 'PROG-362', 362, 22, 'Salida confirmada por almacén. Progs: [362]. ', '2026-05-11 01:08:32'),
(207, 23, 9, 'Salida', 5, 149928, 149923, 'Salida Programación', 'PROG-379', 379, 22, 'Salida confirmada por almacén. Progs: [379]. ', '2026-05-11 01:08:39'),
(208, 19, 3, 'Salida', 100, 14000, 13900, 'Salida Programación', 'PROG-379', 379, 22, 'Salida confirmada por almacén. Progs: [379]. ', '2026-05-11 01:08:39'),
(209, 5, 11, 'Salida', 5, 14945, 14940, 'Salida Programación', 'PROG-346', 346, 22, 'Salida confirmada por almacén. Progs: [346]. ', '2026-05-11 01:08:46'),
(210, 21, 6, 'Salida', 3, 14967, 14964, 'Salida Programación', 'PROG-346', 346, 22, 'Salida confirmada por almacén. Progs: [346]. ', '2026-05-11 01:08:46'),
(211, 23, 9, 'Salida', 2, 149923, 149921, 'Salida Programación', 'PROG-346', 346, 22, 'Salida confirmada por almacén. Progs: [346]. ', '2026-05-11 01:08:46'),
(212, 6, 8, 'Salida', 3, 14967, 14964, 'Salida Programación', 'PROG-346', 346, 22, 'Salida confirmada por almacén. Progs: [346]. ', '2026-05-11 01:08:46'),
(213, 44, 7, 'Salida', 100, 148900, 148800, 'Salida Programación', 'PROG-346', 346, 22, 'Salida confirmada por almacén. Progs: [346]. ', '2026-05-11 01:08:46'),
(214, 57, 10, 'Salida', 5, 14945, 14940, 'Salida Programación', 'PROG-363', 363, 22, 'Salida confirmada por almacén. Progs: [363]. ', '2026-05-11 01:08:55'),
(215, 47, 4, 'Salida', 100, 13900, 13800, 'Salida Programación', 'PROG-363', 363, 22, 'Salida confirmada por almacén. Progs: [363]. ', '2026-05-11 01:08:55'),
(216, 23, 9, 'Salida', 5, 149921, 149916, 'Salida Programación', 'PROG-380', 380, 22, 'Salida confirmada por almacén. Progs: [380]. ', '2026-05-11 01:09:00'),
(217, 19, 3, 'Salida', 100, 13900, 13800, 'Salida Programación', 'PROG-380', 380, 22, 'Salida confirmada por almacén. Progs: [380]. ', '2026-05-11 01:09:00'),
(218, 5, 11, 'Salida', 5, 14940, 14935, 'Salida Programación', 'PROG-347', 347, 22, 'Salida confirmada por almacén. Progs: [347]. ', '2026-05-11 01:09:06'),
(219, 21, 6, 'Salida', 3, 14964, 14961, 'Salida Programación', 'PROG-347', 347, 22, 'Salida confirmada por almacén. Progs: [347]. ', '2026-05-11 01:09:06'),
(220, 23, 9, 'Salida', 2, 149916, 149914, 'Salida Programación', 'PROG-347', 347, 22, 'Salida confirmada por almacén. Progs: [347]. ', '2026-05-11 01:09:06'),
(221, 6, 8, 'Salida', 3, 14964, 14961, 'Salida Programación', 'PROG-347', 347, 22, 'Salida confirmada por almacén. Progs: [347]. ', '2026-05-11 01:09:06'),
(222, 44, 7, 'Salida', 100, 148800, 148700, 'Salida Programación', 'PROG-347', 347, 22, 'Salida confirmada por almacén. Progs: [347]. ', '2026-05-11 01:09:06'),
(223, 57, 10, 'Salida', 5, 14940, 14935, 'Salida Programación', 'PROG-364', 364, 22, 'Salida confirmada por almacén. Progs: [364]. ', '2026-05-11 01:09:12'),
(224, 47, 4, 'Salida', 100, 13800, 13700, 'Salida Programación', 'PROG-364', 364, 22, 'Salida confirmada por almacén. Progs: [364]. ', '2026-05-11 01:09:12'),
(225, 23, 9, 'Salida', 5, 149914, 149909, 'Salida Programación', 'PROG-381', 381, 22, 'Salida confirmada por almacén. Progs: [381]. ', '2026-05-11 01:09:18'),
(226, 19, 3, 'Salida', 100, 13800, 13700, 'Salida Programación', 'PROG-381', 381, 22, 'Salida confirmada por almacén. Progs: [381]. ', '2026-05-11 01:09:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lotes`
--

CREATE TABLE `lotes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_producto` int(11) NOT NULL,
  `numero_lote` varchar(50) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `cantidad` int(11) NOT NULL,
  `cantidad_disponible` int(11) NOT NULL,
  `estado` enum('Activo','Vencido','Descartado') NOT NULL DEFAULT 'Activo',
  `observacion` text DEFAULT NULL,
  `fecha_ingreso` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `lotes`
--

INSERT INTO `lotes` (`id`, `id_producto`, `numero_lote`, `fecha_vencimiento`, `cantidad`, `cantidad_disponible`, `estado`, `observacion`, `fecha_ingreso`) VALUES
(1, 61, 'DOL11726', '2027-04-27', 0, 0, 'Activo', NULL, '2026-04-30 15:18:56'),
(2, 61, 'DOL0126', '2027-12-01', 2, 2, 'Activo', NULL, '2026-04-30 15:23:46'),
(3, 19, 'L2026-01', '2029-07-08', 13700, 13700, 'Activo', NULL, '2026-05-09 23:07:12'),
(4, 47, 'L2026-01', '2028-08-07', 13700, 13700, 'Activo', NULL, '2026-05-09 23:07:37'),
(5, 24, 'L2026-01', '2265-08-07', 150000, 150000, 'Activo', NULL, '2026-05-09 23:07:54'),
(6, 21, 'L2026-01', '2029-08-01', 14961, 14961, 'Activo', NULL, '2026-05-09 23:08:11'),
(7, 44, 'L2026-01', '2029-07-08', 148700, 148700, 'Activo', NULL, '2026-05-09 23:08:36'),
(8, 6, 'L2026-01', '2029-07-08', 14961, 14961, 'Activo', NULL, '2026-05-09 23:08:59'),
(9, 23, 'L2026-01', '2029-08-07', 149909, 149909, 'Activo', NULL, '2026-05-09 23:09:32'),
(10, 57, 'L2026-01', '2029-07-01', 14935, 14935, 'Activo', NULL, '2026-05-09 23:09:58'),
(11, 5, 'L2026-01', '2029-07-08', 14935, 14935, 'Activo', NULL, '2026-05-09 23:10:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimiento`
--

CREATE TABLE `mantenimiento` (
  `id` int(11) NOT NULL,
  `id_programacion` int(10) UNSIGNED DEFAULT NULL,
  `id_equipo` int(11) DEFAULT NULL,
  `id_actmanten` int(11) DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `observaciones` varchar(100) DEFAULT NULL,
  `estado` enum('Pendiente','Realizado','Vencido') NOT NULL DEFAULT 'Pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `mantenimiento`
--

INSERT INTO `mantenimiento` (`id`, `id_programacion`, `id_equipo`, `id_actmanten`, `fecha`, `observaciones`, `estado`) VALUES
(3, 3, 2, 2, '2026-05-09 00:00:00', '', 'Vencido'),
(4, 3, 2, 2, '2026-08-09 00:00:00', '', 'Pendiente'),
(5, 3, 2, 2, '2026-11-09 00:00:00', '', 'Pendiente'),
(6, 4, 3, 2, '2026-05-09 00:00:00', '', 'Vencido'),
(7, 4, 3, 2, '2026-08-09 00:00:00', '', 'Pendiente'),
(8, 4, 3, 2, '2026-11-09 00:00:00', '', 'Pendiente'),
(9, 5, 6, 2, '2026-05-09 00:00:00', '', 'Vencido'),
(10, 5, 6, 2, '2026-08-09 00:00:00', '', 'Pendiente'),
(11, 5, 6, 2, '2026-11-09 00:00:00', '', 'Pendiente'),
(14, 8, 1, 1, '2026-04-17 00:00:00', '', 'Realizado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimiento_vehiculo`
--

CREATE TABLE `mantenimiento_vehiculo` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_programacion` int(10) UNSIGNED DEFAULT NULL,
  `id_vehiculo` int(11) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `tipo_mantenimiento` enum('Preventivo','Correctivo') NOT NULL,
  `fecha_programada` datetime NOT NULL,
  `fecha_realizado` datetime DEFAULT NULL,
  `kilometraje` int(11) DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `estado` enum('Programado','Realizado','Vencido','Cancelado') NOT NULL DEFAULT 'Programado',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_02_07_075051_create_personal_access_tokens_table', 1),
(5, '2026_02_12_053309_add_sku_unidad_precio_to_productos_table', 1),
(6, '2026_02_12_200000_add_contacto_origen_to_cliente_table', 1),
(7, '2026_02_12_210000_add_igv_observaciones_to_cotizacion_table', 1),
(8, '2026_02_16_031948_add_igv_fields_to_orden_producto_table', 1),
(9, '2026_02_16_072301_add_igv_fields_to_orden_servicio_table', 1),
(10, '2026_02_16_185315_create_catalogo_capacitacion_auditoria_table', 1),
(11, '2026_02_16_211438_add_id_catalogo_cap_aud_to_cotizacion_detalle_table', 1),
(12, '2026_02_16_220426_make_id_servicio_nullable_on_orden_capacitacion_auditoria_table', 1),
(13, '2026_02_17_001012_add_aprobacion_to_orden_servicio_and_orden_producto_tables', 1),
(14, '2026_02_17_002349_rename_aprobacion_to_estado_in_order_tables', 1),
(15, '2026_02_19_022215_create_orden_capacitacion_ponentes_table', 1),
(16, '2026_02_20_100000_create_programacion_mantenimiento_table', 1),
(17, '2026_02_20_200000_add_es_prueba_to_programacion_mantenimiento', 1),
(18, '2026_02_22_010000_add_tiempo_extra_to_rrhh_asistencia', 1),
(19, '2026_02_22_020000_setup_auth_areas_personal', 1),
(20, '2026_02_22_030000_add_es_descanso_to_rrhh_horarios', 1),
(21, '2026_02_23_010000_add_almuerzo_to_rrhh_asistencia', 1),
(22, '2026_02_23_010000_create_kardex_table', 1),
(23, '2026_02_23_020000_create_servicio_producto_table', 1),
(24, '2026_02_23_020100_create_orden_servicio_producto_table', 1),
(25, '2026_02_23_020200_create_orden_servicio_equipo_table', 1),
(26, '2026_02_24_015751_create_programacion_tecnicos_table', 1),
(27, '2026_02_24_133516_add_igv_fields_to_orden_capacitacion_auditoria_table', 1),
(28, '2026_02_24_143318_add_fecha_aceptacion_to_orden_producto_table', 1),
(29, '2026_02_24_213826_add_fecha_aceptacion_to_orden_capacitacion_auditoria_table', 1),
(30, '2026_02_26_201013_create_entrega_epp_table', 1),
(31, '2026_02_26_201014_create_detalle_entrega_epp_table', 1),
(32, '2026_02_26_220000_add_devolucion_fields_to_detalle_entrega_epp', 1),
(33, '2026_03_02_100000_add_imagen_to_productos_table', 1),
(34, '2026_03_05_100000_create_proveedores_table', 1),
(35, '2026_03_05_100001_create_ordenes_compra_table', 1),
(36, '2026_03_05_100002_create_detalle_ordenes_compra_table', 1),
(37, '2026_03_05_200000_add_motivo_entrega_to_entrega_epp_table', 1),
(38, '2026_03_05_210000_add_estado_item_to_detalle_entrega_epp_table', 1),
(39, '2026_03_05_230000_add_dias_semana_to_programacion_servicio_table', 1),
(40, '2026_03_07_010000_add_horas_extra_asignacion_to_rrhh_asistencia', 1),
(41, '2026_03_07_020000_create_exponentes_table', 1),
(42, '2026_03_07_020001_add_id_exponente_to_ordenes_pivot', 1),
(43, '2026_03_08_010000_create_cliente_planta_tables', 1),
(44, '2026_03_08_010001_add_planta_area_fk_to_detail_tables', 1),
(45, '2026_03_08_020000_add_estado_to_personal_table', 1),
(46, '2026_03_09_083800_make_id_ponente_nullable_in_orden_capacitacion', 1),
(47, '2026_03_10_100000_add_id_equipo_to_servicio_producto', 1),
(48, '2026_03_10_120000_add_id_servicio_to_orden_servicio_producto_and_equipo', 1),
(49, '2026_03_10_130000_update_unique_constraints_orden_servicio_equipo', 1),
(50, '2026_03_10_170257_add_details_to_orden_capacitacion_auditoria_table', 1),
(51, '2026_03_10_170520_create_orden_capacitacion_materiales_table', 1),
(52, '2026_03_10_170626_create_orden_capacitacion_equipos_table', 1),
(53, '2026_03_11_120000_add_planta_area_to_orden_servicio_producto_and_equipo', 1),
(54, '2026_03_11_130000_update_unique_constraint_orden_servicio_equipo', 1),
(55, '2026_03_12_100000_update_unique_constraint_servicio_producto', 1),
(56, '2026_03_17_120000_add_receta_servicio_to_cotizacion_table', 1),
(57, '2026_03_18_100000_add_imagen_to_equipo_table', 1),
(58, '2026_03_18_130000_create_inventario_ajustes_table', 1),
(59, '2026_03_20_120000_add_id_equipo_to_orden_servicio_producto', 1),
(60, '2026_03_23_181157_add_capacitacion_fields_to_cotizacion_detalle_table', 1),
(61, '2026_03_25_120000_add_exponentes_ids_to_cotizacion_table', 1),
(62, '2026_03_25_130000_create_cotizacion_beneficio_table', 1),
(63, '2026_03_27_180000_add_motivo_fields_to_mantenimiento_catalog', 1),
(64, '2026_03_28_000000_add_asesoria_fields_to_cotizacion_detalle_table', 1),
(65, '2026_03_29_200000_create_programacion_capacitacion_table', 1),
(66, '2026_03_29_200100_create_programacion_capacitacion_exponentes_table', 1),
(67, '2026_03_29_create_programacion_exponentes_table', 1),
(68, '2026_03_30_120000_create_orden_asesoria_table', 1),
(69, '2026_03_30_120100_create_detalle_orden_asesoria_table', 1),
(70, '2026_03_30_120200_create_orden_asesoria_exponentes_table', 1),
(71, '2026_03_30_create_cargo_table', 1),
(72, '2026_03_31_add_id_cargo_to_personal_table', 1),
(73, '2026_03_31_convert_area_to_json', 1),
(74, '2026_04_01_000000_create_programacion_asesoria_table', 1),
(75, '2026_04_01_000100_create_programacion_asesoria_exponentes_table', 1),
(76, '2026_04_01_000200_add_modalidad_visita_to_programacion_asesoria_table', 1),
(77, '2026_04_01_000300_add_planta_area_to_orden_asesoria_table', 1),
(78, '2026_04_04_120000_add_motivo_to_programacion_mantenimiento', 1),
(79, '2026_04_06_000000_create_programacion_visita_table', 1),
(80, '2026_04_06_000001_create_programacion_mantenimiento_vehiculo_table', 1),
(81, '2026_04_06_000002_create_mantenimiento_vehiculo_table', 1),
(82, '2026_04_06_010000_change_programacion_visita_id_supervisor_to_json', 1),
(83, '2026_04_06_020000_change_programacion_servicio_id_supervisor_to_json', 1),
(84, '2026_04_06_030000_make_programacion_visita_tecnico_nullable', 1),
(85, '2026_04_07_000002_change_medida_tanque_to_json_in_cotizacion_detalle', 1),
(86, '2026_04_07_120000_add_fabricable_and_receta_to_productos', 1),
(87, '2026_04_08_130000_create_programacion_fabricacion_table', 1),
(88, '2026_04_08_170000_create_orden_fabricacion_tables', 1),
(89, '2026_04_08_170100_add_id_orden_fabricacion_to_programacion_fabricacion', 1),
(90, '2026_04_08_180000_add_tecnico_exponente_vinculo_fields', 1),
(91, '2026_04_08_180000_create_entrada_devolucion_fabricacion_tables', 1),
(92, '2026_04_08_190000_add_estado_to_entrada_devolucion_fabricacion', 1),
(93, '2026_04_09_120000_create_programacion_otros_table', 1),
(94, '2026_04_11_120000_add_diferencia_materia_prima_to_entrada_devolucion_fabricacion', 1),
(95, '2026_04_13_120000_add_recursos_pendientes_to_programacion_servicio', 1),
(96, '2026_04_13_150000_make_programacion_servicio_tecnico_nullable_and_normalize_pendientes', 1),
(97, '0001_01_01_000000_create_users_table', 1),
(98, '0001_01_01_000001_create_cache_table', 1),
(99, '0001_01_01_000002_create_jobs_table', 1),
(100, '2026_02_07_075051_create_personal_access_tokens_table', 1),
(101, '2026_02_12_053309_add_sku_unidad_precio_to_productos_table', 1),
(102, '2026_02_12_200000_add_contacto_origen_to_cliente_table', 1),
(103, '2026_02_12_210000_add_igv_observaciones_to_cotizacion_table', 1),
(104, '2026_02_16_031948_add_igv_fields_to_orden_producto_table', 1),
(105, '2026_02_16_072301_add_igv_fields_to_orden_servicio_table', 1),
(106, '2026_02_16_185315_create_catalogo_capacitacion_auditoria_table', 1),
(107, '2026_02_16_211438_add_id_catalogo_cap_aud_to_cotizacion_detalle_table', 1),
(108, '2026_02_16_220426_make_id_servicio_nullable_on_orden_capacitacion_auditoria_table', 1),
(109, '2026_02_17_001012_add_aprobacion_to_orden_servicio_and_orden_producto_tables', 1),
(110, '2026_02_17_002349_rename_aprobacion_to_estado_in_order_tables', 1),
(111, '2026_02_19_022215_create_orden_capacitacion_ponentes_table', 1),
(112, '2026_02_20_100000_create_programacion_mantenimiento_table', 1),
(113, '2026_02_20_200000_add_es_prueba_to_programacion_mantenimiento', 1),
(114, '2026_02_22_010000_add_tiempo_extra_to_rrhh_asistencia', 1),
(115, '2026_02_22_020000_setup_auth_areas_personal', 1),
(116, '2026_02_22_030000_add_es_descanso_to_rrhh_horarios', 1),
(117, '2026_02_23_010000_add_almuerzo_to_rrhh_asistencia', 1),
(118, '2026_02_23_010000_create_kardex_table', 1),
(119, '2026_02_23_020000_create_servicio_producto_table', 1),
(120, '2026_02_23_020100_create_orden_servicio_producto_table', 1),
(121, '2026_02_23_020200_create_orden_servicio_equipo_table', 1),
(122, '2026_02_24_015751_create_programacion_tecnicos_table', 1),
(123, '2026_02_24_133516_add_igv_fields_to_orden_capacitacion_auditoria_table', 1),
(124, '2026_02_24_143318_add_fecha_aceptacion_to_orden_producto_table', 1),
(125, '2026_02_24_213826_add_fecha_aceptacion_to_orden_capacitacion_auditoria_table', 1),
(126, '2026_02_26_201013_create_entrega_epp_table', 1),
(127, '2026_02_26_201014_create_detalle_entrega_epp_table', 1),
(128, '2026_02_26_220000_add_devolucion_fields_to_detalle_entrega_epp', 1),
(129, '2026_03_02_100000_add_imagen_to_productos_table', 1),
(130, '2026_03_05_100000_create_proveedores_table', 1),
(131, '2026_03_05_100001_create_ordenes_compra_table', 1),
(132, '2026_03_05_100002_create_detalle_ordenes_compra_table', 1),
(133, '2026_03_05_200000_add_motivo_entrega_to_entrega_epp_table', 1),
(134, '2026_03_05_210000_add_estado_item_to_detalle_entrega_epp_table', 1),
(135, '2026_03_05_230000_add_dias_semana_to_programacion_servicio_table', 1),
(136, '2026_03_07_010000_add_horas_extra_asignacion_to_rrhh_asistencia', 1),
(137, '2026_03_07_020000_create_exponentes_table', 1),
(138, '2026_03_07_020001_add_id_exponente_to_ordenes_pivot', 1),
(139, '2026_03_08_010000_create_cliente_planta_tables', 1),
(140, '2026_03_08_010001_add_planta_area_fk_to_detail_tables', 1),
(141, '2026_03_08_020000_add_estado_to_personal_table', 1),
(142, '2026_03_09_083800_make_id_ponente_nullable_in_orden_capacitacion', 1),
(143, '2026_03_10_100000_add_id_equipo_to_servicio_producto', 1),
(144, '2026_03_10_120000_add_id_servicio_to_orden_servicio_producto_and_equipo', 1),
(145, '2026_03_10_130000_update_unique_constraints_orden_servicio_equipo', 1),
(146, '2026_03_10_170257_add_details_to_orden_capacitacion_auditoria_table', 1),
(147, '2026_03_10_170520_create_orden_capacitacion_materiales_table', 1),
(148, '2026_03_10_170626_create_orden_capacitacion_equipos_table', 1),
(149, '2026_03_11_120000_add_planta_area_to_orden_servicio_producto_and_equipo', 1),
(150, '2026_03_11_130000_update_unique_constraint_orden_servicio_equipo', 1),
(151, '2026_03_12_100000_update_unique_constraint_servicio_producto', 1),
(152, '2026_03_17_120000_add_receta_servicio_to_cotizacion_table', 1),
(153, '2026_03_18_100000_add_imagen_to_equipo_table', 1),
(154, '2026_03_18_130000_create_inventario_ajustes_table', 1),
(155, '2026_03_20_120000_add_id_equipo_to_orden_servicio_producto', 1),
(156, '2026_03_23_181157_add_capacitacion_fields_to_cotizacion_detalle_table', 1),
(157, '2026_03_25_120000_add_exponentes_ids_to_cotizacion_table', 1),
(158, '2026_03_25_130000_create_cotizacion_beneficio_table', 1),
(159, '2026_03_27_180000_add_motivo_fields_to_mantenimiento_catalog', 1),
(160, '2026_03_28_000000_add_asesoria_fields_to_cotizacion_detalle_table', 1),
(161, '2026_03_29_200000_create_programacion_capacitacion_table', 1),
(162, '2026_03_29_200100_create_programacion_capacitacion_exponentes_table', 1),
(163, '2026_03_29_create_programacion_exponentes_table', 1),
(164, '2026_03_30_120000_create_orden_asesoria_table', 1),
(165, '2026_03_30_120100_create_detalle_orden_asesoria_table', 1),
(166, '2026_03_30_120200_create_orden_asesoria_exponentes_table', 1),
(167, '2026_03_30_create_cargo_table', 1),
(168, '2026_03_31_add_id_cargo_to_personal_table', 1),
(169, '2026_03_31_convert_area_to_json', 1),
(170, '2026_04_01_000000_create_programacion_asesoria_table', 1),
(171, '2026_04_01_000100_create_programacion_asesoria_exponentes_table', 1),
(172, '2026_04_01_000200_add_modalidad_visita_to_programacion_asesoria_table', 1),
(173, '2026_04_01_000300_add_planta_area_to_orden_asesoria_table', 1),
(174, '2026_04_04_120000_add_motivo_to_programacion_mantenimiento', 1),
(175, '2026_04_06_000000_create_programacion_visita_table', 1),
(176, '2026_04_06_000001_create_programacion_mantenimiento_vehiculo_table', 1),
(177, '2026_04_06_000002_create_mantenimiento_vehiculo_table', 1),
(178, '2026_04_06_010000_change_programacion_visita_id_supervisor_to_json', 1),
(179, '2026_04_06_020000_change_programacion_servicio_id_supervisor_to_json', 1),
(180, '2026_04_06_030000_make_programacion_visita_tecnico_nullable', 1),
(181, '2026_04_07_000002_change_medida_tanque_to_json_in_cotizacion_detalle', 1),
(182, '2026_04_07_120000_add_fabricable_and_receta_to_productos', 1),
(183, '2026_04_08_130000_create_programacion_fabricacion_table', 1),
(184, '2026_04_08_170000_create_orden_fabricacion_tables', 1),
(185, '2026_04_08_170100_add_id_orden_fabricacion_to_programacion_fabricacion', 1),
(186, '2026_04_08_180000_add_tecnico_exponente_vinculo_fields', 1),
(187, '2026_04_08_180000_create_entrada_devolucion_fabricacion_tables', 1),
(188, '2026_04_08_190000_add_estado_to_entrada_devolucion_fabricacion', 1),
(189, '2026_04_09_120000_create_programacion_otros_table', 1),
(190, '2026_04_11_120000_add_diferencia_materia_prima_to_entrada_devolucion_fabricacion', 1),
(191, '2026_04_13_120000_add_recursos_pendientes_to_programacion_servicio', 1),
(192, '2026_04_13_150000_make_programacion_servicio_tecnico_nullable_and_normalize_pendientes', 1),
(193, '2026_04_16_000100_create_programacion_servicio_grupos_table', 2),
(194, '2026_04_16_000200_add_id_grupo_programacion_to_programacion_servicio_table', 2),
(195, '2026_04_17_000000_create_lotes_table', 2),
(196, '2026_04_17_130000_drop_n_lote_and_fecha_vencim_from_productos_table', 2),
(197, '2026_04_17_180000_add_id_lote_to_detalle_ordenes_compra_table', 2),
(198, '2026_04_17_190000_add_id_lote_to_kardex_table', 2),
(199, '2026_04_17_191000_add_id_lote_to_inventario_ajustes_table', 2),
(200, '2026_04_17_192000_add_id_lote_to_programacion_insumos_table', 2),
(201, '2026_04_17_193000_add_id_lote_to_detalle_orden_producto_table', 2),
(202, '2026_04_17_194000_add_id_lote_to_detalle_entrada_devolucion_fabricacion_table', 2),
(203, '2026_04_17_194000_create_salida_programacion_fabricacion_detalles_table', 3),
(204, '2026_04_18_090000_create_programacion_servicio_inicios_table', 3),
(205, '2026_04_18_120000_add_id_personal_to_tecnicos_table', 3),
(206, '2026_04_18_121000_add_id_tecnico_to_programacion_servicio_inicios_table', 3),
(207, '2026_04_20_200000_add_auditoria_to_tipo_cotizacion_enum', 4),
(208, '2026_04_20_210000_create_orden_auditoria_table', 4),
(209, '2026_04_20_210100_create_orden_auditoria_exponentes_table', 4),
(210, '2026_04_20_220000_add_horario_auditoria_fields', 4),
(211, '2026_04_20_220000_add_id_tecnico_conductor_to_programacion_capacitacion_table', 4),
(212, '2026_04_20_231500_add_motivo_to_programacion_capacitacion_table', 4),
(213, '2026_04_24_000000_recreate_fichas_operacionales_table', 4),
(214, '2026_04_24_100000_add_foreign_keys_fichas_operacionales_table', 4),
(215, '2026_04_25_000000_create_formatos_operacionales_table', 4),
(216, '2026_04_25_000001_create_formato_operacional_detalles_table', 4),
(217, '2026_04_25_000002_add_dual_fields_to_formato_operacional_detalles_table', 4),
(218, '2026_04_28_000000_add_formatos_fichas_to_programacion_servicio_table', 4),
(219, '2026_04_29_000003_add_conteo_insectos_to_formato_operacional_detalles_table', 4),
(220, '2026_04_29_000004_expand_tipo_seccion_enum_with_trampa_luz', 4),
(221, '2026_04_30_000004_add_rastreros_fields_to_formato_operacional_detalles_table', 4),
(222, '2026_04_30_114000_add_dual_estado_lamina_to_formato_operacional_detalles', 4),
(223, '2026_04_30_121000_fix_missing_conteo_estadio', 4),
(224, '2026_05_02_000000_add_es_servicio_extra_to_cotizacion_detalle', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `multicim`
--

CREATE TABLE `multicim` (
  `id` int(11) NOT NULL,
  `nombre_empresa` varchar(100) NOT NULL,
  `alias_empresa` varchar(100) NOT NULL,
  `ruc` varchar(11) NOT NULL,
  `cuenta_bcp` varchar(100) NOT NULL,
  `codigo_interbancario_bcp` varchar(100) NOT NULL,
  `banco_nacion` varchar(100) NOT NULL,
  `codigo_interbancario_nacion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `multicim`
--

INSERT INTO `multicim` (`id`, `nombre_empresa`, `alias_empresa`, `ruc`, `cuenta_bcp`, `codigo_interbancario_bcp`, `banco_nacion`, `codigo_interbancario_nacion`) VALUES
(1, 'CIM CONSULTORES PARA LA INDUSTRIA ALIMENTARIA SAC', 'cim', '20604910090', '191-2656778-0-39', '00219100265677803955', '00-004-156900', '1800400000415690000'),
(2, 'Multitasking servicios generales SAC', 'multi', '20607499234', '191-9289661-0-57', '00219100928966105750', '00-054-127251', '01805400005412725174');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_fichas`
--

CREATE TABLE `oei_fichas` (
  `id` int(11) NOT NULL,
  `n_ficha` varchar(20) NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `fecha_servicio` date NOT NULL,
  `hora_inicio_servicio` time DEFAULT NULL,
  `hora_fin_servicio` time DEFAULT NULL,
  `diagnostico_previo` text DEFAULT NULL,
  `condicion_sanitaria` text DEFAULT NULL,
  `observaciones_tecnicas` text DEFAULT NULL,
  `acciones_realizadas` text DEFAULT NULL,
  `fotos_evidencia` text DEFAULT NULL,
  `firma_tecnico` varchar(255) DEFAULT NULL,
  `firma_cliente` varchar(255) DEFAULT NULL,
  `nombre_quien_recibe` varchar(100) DEFAULT NULL,
  `estado_servicio` enum('Completo','Parcial','Reprogramado','Cancelado') DEFAULT 'Completo',
  `recibida_oei` tinyint(1) DEFAULT 0,
  `recibida_por` int(11) DEFAULT NULL,
  `fecha_recepcion` datetime DEFAULT NULL,
  `coincide_cronograma` tinyint(1) DEFAULT 1,
  `creado_por` int(11) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Fichas técnicas de servicios realizados';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_ficha_anexos`
--

CREATE TABLE `oei_ficha_anexos` (
  `id` int(11) NOT NULL,
  `id_ficha` int(11) NOT NULL,
  `tipo_anexo` enum('Plano','Foto','Documento','Otro') NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `fecha_carga` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Anexos adicionales de las fichas técnicas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_ficha_monitoreo`
--

CREATE TABLE `oei_ficha_monitoreo` (
  `id` int(11) NOT NULL,
  `id_ficha` int(11) NOT NULL,
  `codigo_dispositivo` varchar(20) NOT NULL,
  `tipo_dispositivo` enum('Trampa de Luz','Cebadero','Trampa de Pegamento','Estación','Otro') DEFAULT 'Otro',
  `area_ubicacion` varchar(100) DEFAULT NULL,
  `animal_objetivo` varchar(50) DEFAULT NULL,
  `especimen` varchar(50) DEFAULT NULL,
  `hallazgo_cantidad` int(11) DEFAULT 0,
  `estado_dispositivo` enum('Bueno','Regular','Dañado','Reemplazado') DEFAULT 'Bueno',
  `accion_tomada` varchar(255) DEFAULT NULL,
  `foto_evidencia` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Detalle de monitoreo para gráficos de tendencias';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_informe_detalle_fichas`
--

CREATE TABLE `oei_informe_detalle_fichas` (
  `id_informe` int(11) NOT NULL,
  `id_ficha` int(11) NOT NULL,
  `orden` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Relación entre informes y fichas incluidas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_informe_final`
--

CREATE TABLE `oei_informe_final` (
  `id` int(11) NOT NULL,
  `codigo_informe` varchar(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `mes_reportado` int(11) NOT NULL,
  `anio_reportado` int(11) NOT NULL,
  `periodo` varchar(7) GENERATED ALWAYS AS (concat(`anio_reportado`,_utf8mb4'-',lpad(`mes_reportado`,2,_utf8mb4'0'))) STORED,
  `fecha_emision` date DEFAULT NULL,
  `fecha_revision` date DEFAULT NULL,
  `fecha_aprobacion` date DEFAULT NULL,
  `fecha_envio_cliente` date DEFAULT NULL,
  `id_personal_elaboro` int(11) NOT NULL,
  `id_personal_reviso` int(11) DEFAULT NULL,
  `id_personal_aprobo` int(11) DEFAULT NULL,
  `conclusiones_generales` text DEFAULT NULL,
  `recomendaciones_cliente` text DEFAULT NULL,
  `observaciones_revision` text DEFAULT NULL,
  `estado_informe` enum('Borrador','En Revisión','Aprobado','Enviado','Rechazado') DEFAULT 'Borrador',
  `ruta_pdf_final` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Informes mensuales para clientes';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_compra`
--

CREATE TABLE `ordenes_compra` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero_orden_compra` varchar(30) DEFAULT NULL,
  `numero_cotizacion_proveedor` varchar(60) DEFAULT NULL,
  `numero_factura` varchar(60) DEFAULT NULL,
  `id_proveedor` bigint(20) UNSIGNED NOT NULL,
  `fecha_compra` date NOT NULL,
  `fecha_recepcion` date DEFAULT NULL,
  `tipo_moneda` enum('PEN','USD') NOT NULL DEFAULT 'PEN',
  `tipo_cambio` decimal(8,4) DEFAULT NULL,
  `tiene_igv` tinyint(1) NOT NULL DEFAULT 1,
  `subtotal` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `costo_envio` decimal(12,4) DEFAULT 0.0000,
  `igv` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `total` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `estado` enum('Pendiente','Recibido','Anulado') NOT NULL DEFAULT 'Pendiente',
  `id_usuario` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ordenes_compra`
--

INSERT INTO `ordenes_compra` (`id`, `numero_orden_compra`, `numero_cotizacion_proveedor`, `numero_factura`, `id_proveedor`, `fecha_compra`, `fecha_recepcion`, `tipo_moneda`, `tipo_cambio`, `tiene_igv`, `subtotal`, `costo_envio`, `igv`, `total`, `estado`, `id_usuario`, `observaciones`, `created_at`, `updated_at`) VALUES
(1, 'OC-2026-0001', NULL, 'FF01-001460', 1, '2026-04-14', '2026-04-14', 'PEN', NULL, 1, 207.6800, 0.0000, 37.3824, 245.0624, 'Recibido', NULL, NULL, '2026-04-14 20:22:20', '2026-04-14 20:22:30'),
(2, 'OC-2026-0002', NULL, 'F002-00003201', 4, '2026-04-18', '2026-04-18', 'PEN', NULL, 1, 151.0560, 0.0000, 27.1901, 178.2461, 'Recibido', 17, NULL, '2026-04-18 13:38:30', '2026-04-18 13:38:38'),
(3, 'OC-2026-0003', NULL, 'F201-7134', 12, '2026-04-30', '2026-04-30', 'PEN', NULL, 1, 102.0000, 0.0000, 18.3600, 120.3600, 'Recibido', 17, 'Comprado 27/04', '2026-04-30 15:18:56', '2026-04-30 15:19:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_asesoria`
--

CREATE TABLE `orden_asesoria` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero_orden` varchar(30) NOT NULL,
  `id_cotizacion` int(10) UNSIGNED NOT NULL,
  `id_cliente` int(10) UNSIGNED NOT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` bigint(20) UNSIGNED DEFAULT NULL,
  `id_servicio` int(10) UNSIGNED DEFAULT NULL,
  `id_exponente` int(10) UNSIGNED DEFAULT NULL,
  `fecha_servicio` date NOT NULL,
  `fecha_aceptacion` date DEFAULT NULL,
  `hora_servicio` time DEFAULT NULL,
  `modalidad` enum('Presencial','Virtual','Híbrido','Asíncrona') NOT NULL,
  `num_participantes` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `num_certificados` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `igv` decimal(12,2) NOT NULL DEFAULT 0.00,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `costo` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` varchar(20) NOT NULL DEFAULT 'Aprobado',
  `emitido_por` int(10) UNSIGNED DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_asesoria_exponentes`
--

CREATE TABLE `orden_asesoria_exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_asesoria` int(10) UNSIGNED NOT NULL,
  `id_exponente` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orden_asesoria_exponentes`
--

INSERT INTO `orden_asesoria_exponentes` (`id`, `id_orden_asesoria`, `id_exponente`) VALUES
(1, 1, 1),
(2, 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_auditoria`
--

CREATE TABLE `orden_auditoria` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero_orden` varchar(30) NOT NULL,
  `id_cotizacion` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `id_exponente` bigint(20) UNSIGNED DEFAULT NULL,
  `fecha_servicio` date NOT NULL,
  `fecha_aceptacion` date DEFAULT NULL,
  `hora_servicio` time DEFAULT NULL,
  `hora_fin_auditoria` time DEFAULT NULL,
  `modalidad` enum('Presencial','Virtual','Híbrido','Asíncrona') NOT NULL,
  `duracion_dias` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `igv` decimal(12,2) NOT NULL DEFAULT 0.00,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `costo` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` varchar(20) NOT NULL DEFAULT 'Aprobado',
  `emitido_por` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orden_auditoria`
--

INSERT INTO `orden_auditoria` (`id`, `numero_orden`, `id_cotizacion`, `id_cliente`, `id_servicio`, `id_exponente`, `fecha_servicio`, `fecha_aceptacion`, `hora_servicio`, `hora_fin_auditoria`, `modalidad`, `duracion_dias`, `subtotal`, `igv`, `incluye_igv`, `costo`, `estado`, `emitido_por`, `observaciones`) VALUES
(3, 'OAU-2026-001', 15, 4, NULL, 1, '2026-05-07', '2026-04-20', '14:00:00', '20:00:00', 'Presencial', 3, 950.00, 0.00, 0, 950.00, 'Aprobado', 16, NULL),
(4, 'OAU-2026-002', 34, 4, NULL, 3, '2026-05-08', '2026-05-08', '10:00:00', '12:00:00', 'Presencial', 4, 450.00, 81.00, 1, 531.00, 'Aprobado', 22, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_auditoria_exponentes`
--

CREATE TABLE `orden_auditoria_exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_auditoria` bigint(20) UNSIGNED NOT NULL,
  `id_exponente` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orden_auditoria_exponentes`
--

INSERT INTO `orden_auditoria_exponentes` (`id`, `id_orden_auditoria`, `id_exponente`) VALUES
(5, 3, 1),
(6, 3, 2),
(7, 4, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_capacitacion_auditoria`
--

CREATE TABLE `orden_capacitacion_auditoria` (
  `id` int(11) NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `id_cotizacion` int(11) DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `id_ponente` int(11) DEFAULT NULL,
  `id_exponente` int(11) DEFAULT NULL,
  `fecha_servicio` date DEFAULT NULL,
  `fecha_aceptacion` date DEFAULT NULL,
  `hora_servicio` time DEFAULT NULL,
  `modalidad` enum('Presencial','Virtual','Híbrido','Asíncrona') DEFAULT NULL,
  `num_participantes` int(11) DEFAULT NULL,
  `num_certificados` int(11) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `estado` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `emitido_por` int(10) UNSIGNED DEFAULT NULL,
  `horas_capacitacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_capacitacion_ponentes`
--

CREATE TABLE `orden_capacitacion_ponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_capacitacion` int(11) NOT NULL,
  `id_ponente` int(11) DEFAULT NULL,
  `id_exponente` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_fabricacion`
--

CREATE TABLE `orden_fabricacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `fecha_orden` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `estado` enum('Borrador','Confirmada','Programada','Fabricada','Anulada') NOT NULL DEFAULT 'Confirmada',
  `resumen_insumos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orden_fabricacion`
--

INSERT INTO `orden_fabricacion` (`id`, `codigo`, `fecha_orden`, `motivo`, `estado`, `resumen_insumos`, `observaciones`, `creado_por`, `created_at`, `updated_at`) VALUES
(9, 'OF-20260413-001', '2026-04-12', 'Stock para la semana', 'Fabricada', '[{\"id_producto_insumo\":2,\"descripcion\":\"LAMINA 50X10\",\"cantidad_requerida\":127,\"unidad\":\"Unidad\"},{\"id_producto_insumo\":3,\"descripcion\":\"TEMOCID\",\"cantidad_requerida\":238.76,\"unidad\":\"Gramos\"},{\"id_producto_insumo\":4,\"descripcion\":\"LAMINA ADHESIVA 50X10\",\"cantidad_requerida\":127,\"unidad\":null}]', NULL, 7, '2026-04-13 18:00:05', '2026-04-13 18:04:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_producto`
--

CREATE TABLE `orden_producto` (
  `id` int(11) NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `id_cotizacion` int(11) DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha_envio` date DEFAULT NULL,
  `fecha_aceptacion` date DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `emitido_por` int(11) DEFAULT NULL,
  `estado` varchar(100) NOT NULL DEFAULT 'Aprobado',
  `observaciones` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `orden_producto`
--

INSERT INTO `orden_producto` (`id`, `numero_orden`, `id_cotizacion`, `id_cliente`, `fecha_envio`, `fecha_aceptacion`, `total`, `subtotal`, `igv`, `incluye_igv`, `emitido_por`, `estado`, `observaciones`) VALUES
(2, 'OP-2026-002', 10, 33, '2026-04-18', '2026-04-17', 192.00, 192.00, 0.00, 0, 14, 'Aprobado', NULL),
(3, 'OP-2026-003', 22, 17, '2026-04-30', '2026-04-28', 300.00, 300.00, 0.00, 0, 14, 'Aprobado', NULL),
(4, 'OP-2026-004', 25, 18, '2026-05-08', '2026-05-08', 120.00, 120.00, 0.00, 0, 22, 'Aprobado', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_servicio`
--

CREATE TABLE `orden_servicio` (
  `id` int(11) NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `codigo_doc` varchar(20) DEFAULT 'OS-AC-001',
  `version` varchar(10) DEFAULT '01',
  `id_cotizacion` int(11) DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha_aceptacion` date DEFAULT NULL,
  `fecha_tentativa` date DEFAULT NULL,
  `total_costo` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `emitido_por` int(11) DEFAULT NULL,
  `estado` varchar(100) NOT NULL DEFAULT 'Aprobado',
  `observaciones` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `orden_servicio`
--

INSERT INTO `orden_servicio` (`id`, `numero_orden`, `codigo_doc`, `version`, `id_cotizacion`, `id_cliente`, `fecha_aceptacion`, `fecha_tentativa`, `total_costo`, `subtotal`, `igv`, `incluye_igv`, `emitido_por`, `estado`, `observaciones`) VALUES
(6, 'OS-2026-003', NULL, '01', 8, 20, '2026-04-17', '2026-05-09', 470.00, 470.00, 0.00, 0, 14, 'Aprobado', NULL),
(8, 'OS-2026-004', NULL, '01', 14, 9, '2026-04-20', '2026-04-20', 735.00, 735.00, 0.00, 0, 14, 'Aprobado', 'FALTA OC PARA FACTURAR'),
(9, 'OS-2026-005', NULL, '01', 17, 38, '2026-04-21', NULL, 5290.00, 5290.00, 0.00, 0, 15, 'Aprobado', NULL),
(10, 'OS-2026-006', NULL, '01', 23, 20, '2026-04-27', '2026-04-30', 360.00, 360.00, 0.00, 0, 14, 'Aprobado', NULL),
(13, 'OS-2026-007', NULL, '01', 27, 42, '2026-04-30', '2026-05-02', 350.00, 350.00, 0.00, 0, 14, 'Aprobado', NULL),
(14, 'OS-2026-008', NULL, '01', 28, 2, '2026-05-04', '2026-05-06', 890.00, 890.00, 0.00, 0, 14, 'Aprobado', '22 Pallets de 907.20 kg \n19958.40 kg en total\nLote: 17186.02\nTODAVIA NO ENVIAN OC'),
(16, 'OS-2026-009', NULL, '01', 32, 2, '2026-05-07', '2026-05-07', 450.00, 450.00, 0.00, 0, 14, 'Aprobado', NULL),
(17, 'OS-2026-010', NULL, '01', 31, 44, '2026-05-07', '2026-05-16', 280.00, 280.00, 0.00, 0, 14, 'Aprobado', NULL),
(18, 'OS-2026-011', NULL, '01', 35, 20, '2026-05-09', '2026-05-01', 1711.00, 1450.00, 261.00, 1, 22, 'Programado', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_servicio_equipo`
--

CREATE TABLE `orden_servicio_equipo` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_servicio` int(11) NOT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` bigint(20) UNSIGNED DEFAULT NULL,
  `id_equipo` int(11) NOT NULL,
  `observacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orden_servicio_equipo`
--

INSERT INTO `orden_servicio_equipo` (`id`, `id_orden_servicio`, `id_servicio`, `id_cliente_planta`, `id_cliente_planta_area`, `id_equipo`, `observacion`) VALUES
(27, 8, 13, 39, NULL, 2, NULL),
(28, 9, 13, 40, NULL, 2, NULL),
(29, 9, 13, 40, NULL, 4, NULL),
(30, 10, 8, 12, 26, 6, NULL),
(31, 13, 2, NULL, NULL, 2, NULL),
(32, 6, 8, 7, 11, 6, NULL),
(38, 17, 13, 62, NULL, 5, NULL),
(39, 18, 13, 7, 11, 2, NULL),
(40, 18, 14, 7, 11, 3, NULL),
(41, 18, 8, 7, 11, 3, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_servicio_producto`
--

CREATE TABLE `orden_servicio_producto` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_servicio` int(11) NOT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` bigint(20) UNSIGNED DEFAULT NULL,
  `id_equipo` int(11) DEFAULT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `observacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orden_servicio_producto`
--

INSERT INTO `orden_servicio_producto` (`id`, `id_orden_servicio`, `id_servicio`, `id_cliente_planta`, `id_cliente_planta_area`, `id_equipo`, `id_producto`, `cantidad`, `observacion`) VALUES
(56, 8, 13, 39, NULL, 2, 42, 10.00, NULL),
(57, 9, 13, 40, NULL, 2, 24, 1.00, NULL),
(58, 9, 13, 40, NULL, 4, 19, 1.00, NULL),
(59, 10, 8, 12, 26, 6, 35, 10.00, NULL),
(60, 10, 8, 12, 26, 6, 34, 300.00, NULL),
(61, 10, 8, 12, 26, 6, 36, 30.00, NULL),
(62, 10, 8, 12, 26, NULL, 23, 2.00, NULL),
(63, 13, 2, NULL, NULL, 2, 19, 96.00, NULL),
(64, 6, 8, 7, 11, NULL, 33, 50.00, NULL),
(65, 6, 8, 7, 11, NULL, 34, 900.00, NULL),
(66, 6, 8, 7, 11, NULL, 36, 60.00, NULL),
(67, 6, 8, 7, 11, 6, 35, 10.00, NULL),
(69, 17, 13, 62, NULL, 5, 42, 75.00, NULL),
(70, 18, 13, 7, 11, 2, 5, 5.00, NULL),
(71, 18, 13, 7, 11, 2, 21, 3.00, NULL),
(72, 18, 13, 7, 11, 2, 23, 2.00, NULL),
(73, 18, 14, 7, 11, 3, 57, 5.00, NULL),
(74, 18, 8, 7, 11, 3, 23, 5.00, NULL),
(75, 18, 13, 7, 11, 2, 6, 3.00, NULL),
(76, 18, 13, 7, 11, 2, 44, 100.00, NULL),
(77, 18, 14, 7, 11, 3, 47, 100.00, NULL),
(78, 18, 8, 7, 11, 3, 19, 100.00, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal`
--

CREATE TABLE `personal` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `celular` char(13) NOT NULL,
  `correo` varchar(50) NOT NULL,
  `id_area` int(11) DEFAULT NULL,
  `usuario` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Activo',
  `id_cargo` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `personal`
--

INSERT INTO `personal` (`id`, `nombre`, `apellidos`, `celular`, `correo`, `id_area`, `usuario`, `password`, `estado`, `id_cargo`) VALUES
(10, 'YANINA MILAGROS', 'AZAÑA ALVITES', '997752266', 'cobranzas@qsciconsulting.com', 4, 'YANINA', '$2y$12$TBbzZ2e6aMAYcxSy.ar/W.N6YVqi1AS1fq4lXeFbD3EAgE/OHUJzq', 'Activo', NULL),
(11, 'SHIRLEY', 'PUICAN TERAN', '941300937', 'asistente.operaciones@qsciconsulting.com', 8, 'SHIRLEY', '$2y$12$troAcJN7urt9BEJSL/sr6.KYJ3iC1UCKxXXF/u18bM4nqAKjURkyW', 'Activo', 4),
(12, 'GEORGE', 'VASQUEZ DIAZ', '959392137', 'george.vasquez@qsciconsulting.com', 6, 'GEORGE', '$2y$12$JIkyZWuylJmGShQRjBtNwO/GT./tQv5fpLe22vMaGINP4uFQZH1Ei', 'Activo', 6),
(13, 'WALTER ISMAEL', 'BARRETO TINEDO', '940708192', 'coord.investigacion@qsciconsulting.com', 3, 'WALTER', '$2y$12$PU0UWoxsbysMFiDpe2Vdl.PAuiaI2130m8Qv09kfM.AIALa9NQMaS', 'Activo', NULL),
(14, 'Katia', 'Bonifaz', '947702279', 'coordinadorcomercial@qsciconsulting.com', 1, 'KATIA', '$2y$12$EwyPytBJEGV.1bdcqjC/7ObJP76TZGvNpbjamO90Fpfb.zXc/mD2u', 'Activo', 1),
(15, 'Brigith Xiomara', 'Jacinto Espinoza', '915216225', 'asesorcomercial1@qsciconsulting.com', 1, 'BRIGITH', '$2y$12$JFWUMCu.Q5hCmvnY1ROX.Oc/i3ShRem196f8b8oed6i0QGTojNL3i', 'Activo', 2),
(16, 'Andy', 'Yupanqui Vilca', '980555522', 'andy.yupanqui@qsciconsulting.com', 6, 'ANDY', '$2y$12$yB5Jw3P3/K5b2RzB38.x7eWBD2wh5181WjRzLtDPP2CRdOscSfwJu', 'Activo', 3),
(17, 'ARACELI LISSET', 'PRADA HERNANDEZ', '977731225', 'logistica@qsciconsulting.com', 7, 'ARACELI', '$2y$12$hVt3Ppo9E0QyRrRwnQZ0/OEAWa0EP1RPweMnZAD7t5gBKU2OTaunK', 'Activo', NULL),
(18, 'DIANA EILIM', 'IBARRA CHILCA', '940708192', 'operaciones1@qsciconsulting.com', 10, 'DIANA', '$2y$12$KqQ4zp3dysNoatCGjpBis.E7DfiW/A/4RHqjgbfOC0JuJ7ymWDi7m', 'Activo', 7),
(19, 'FIORELLA NICOL', 'ASTOHUAMAN ORTIZ', '940708192', 'operaciones2@qsciconsulting.com', 10, 'FIORELLA', '$2y$12$hObdxm/5LFK8xGNn9efw7OsSt5NWzaTP/NT1ZgLjEdBFQxUWQhUum', 'Activo', 8),
(20, 'MAYUMI JAZMIN', 'MANRIQUE ORDOÑEZ', '998316398', 'mayumijazminmarique234@gmail.com', 5, 'MAYUMI', '$2y$12$U8cNnfZrBEPW5Se3vYXL.OyMazauq1D5NXHMmIcLnHVizKOc5Iqne', 'Activo', NULL),
(22, 'Soporte', 'Tecnico', '999999999', 'soporteit@qsci.com', 11, 'it.soporte', '$2y$12$/XLUlpzXkgNYWv4yVvktUO3q9cUySa1ZXK1ax.7edHMC6Nl0BCisa', 'Activo', NULL),
(23, 'Ricki Yordi', 'Choque Alacote', '987654321', 'tecnico@qsci.com', 9, 'Tprueba', '$2y$12$tsVdr4KaLrJ/VLi97nPpqOxsg/PWiMyHM5j/ITRrNoF8VI9wH760G', 'Activo', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(334, 'App\\Models\\Personal', 20, 'auth-token', 'bd808db2afb145f01184895a3bc860fdc09daad7081d2ccc8c2fdf66459bbc79', '[\"*\"]', '2026-04-24 17:20:29', NULL, '2026-04-24 13:32:49', '2026-04-24 17:20:29'),
(379, 'App\\Models\\Personal', 17, 'auth-token', '968b1908f20b6059bbbb1607f7ebaeb488cf0f344c868a858dd86ec1ab3efdc0', '[\"*\"]', '2026-04-30 19:45:14', NULL, '2026-04-28 11:07:30', '2026-04-30 19:45:14'),
(464, 'App\\Models\\Personal', 15, 'auth-token', '001699dfa5e142722a72962c8d9659df387dbbd3081bc7901fa7e9244189f4df', '[\"*\"]', '2026-05-07 19:28:06', NULL, '2026-05-06 13:19:52', '2026-05-07 19:28:06'),
(473, 'App\\Models\\Personal', 11, 'auth-token', '60ee2c160db734d5dc17baf30f253ae623f69a3a786667a0d683551217bd3919', '[\"*\"]', '2026-05-07 22:56:47', NULL, '2026-05-07 13:15:56', '2026-05-07 22:56:47'),
(475, 'App\\Models\\Personal', 19, 'auth-token', '5e4962d2e494e2bb151f67acbf343b01710e1616ceb39c58e3f5f9fc7cf0888d', '[\"*\"]', '2026-05-07 23:20:45', NULL, '2026-05-07 13:47:50', '2026-05-07 23:20:45'),
(480, 'App\\Models\\Personal', 18, 'auth-token', '33646453bd9b74ea9bacfb6d05ef7d220b06737201292db6c683bd7c094b7c94', '[\"*\"]', '2026-05-07 21:00:09', NULL, '2026-05-07 20:59:40', '2026-05-07 21:00:09'),
(481, 'App\\Models\\Personal', 16, 'auth-token', 'e271334be82d0c2fd286698f1b710132249d203ab8e87af0a44a2bc9fb08d98d', '[\"*\"]', '2026-05-07 21:29:23', NULL, '2026-05-07 21:13:40', '2026-05-07 21:29:23'),
(482, 'App\\Models\\Personal', 14, 'auth-token', '6973fea2c86bbda9926b62124f8b11b8bae6eff6e89e7a667d1c05bfdc96c5f4', '[\"*\"]', '2026-05-07 22:03:21', NULL, '2026-05-07 22:02:54', '2026-05-07 22:03:21'),
(483, 'App\\Models\\Personal', 10, 'auth-token', '35888f9a782d8f87a582bcf175f88520adee606a1d38b7d5b66f5e2882719fa3', '[\"*\"]', '2026-05-08 01:44:38', NULL, '2026-05-08 01:44:09', '2026-05-08 01:44:38'),
(488, 'App\\Models\\Personal', 23, 'auth-token', '4e04e257afc7fdf14e6490d3baabbf62928d90930db4c8bef69257be120e71d4', '[\"*\"]', '2026-05-11 02:00:02', NULL, '2026-05-09 23:16:04', '2026-05-11 02:00:02'),
(491, 'App\\Models\\Personal', 22, 'auth-token', '70795d0b8e2a053e0f07eaa2f5c6ffabc41c1758a408d23205a4026a60c039c9', '[\"*\"]', '2026-05-12 01:28:45', NULL, '2026-05-12 01:06:47', '2026-05-12 01:28:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `descripcion` varchar(200) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `ubicacion` varchar(50) NOT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo',
  `imagen` varchar(500) DEFAULT NULL,
  `ingre_activo` varchar(500) DEFAULT NULL,
  `plag_objetivo` varchar(500) DEFAULT NULL,
  `presentacion` varchar(500) DEFAULT NULL,
  `es_fabricable` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `sku`, `descripcion`, `id_categoria`, `ubicacion`, `unidad`, `precio_unitario`, `estado`, `imagen`, `ingre_activo`, `plag_objetivo`, `presentacion`, `es_fabricable`) VALUES
(1, 'DIS-LAM-0003', 'LAMINA DE TRAMPA DE LUZ 50X10', 2, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, '50X10', 1),
(2, 'INS-LAM-0001', 'LAMINA 50X10', 1, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(3, 'INS-TEM-0002', 'TEMOCID', 1, '', 'Gramos', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(4, 'INS-LAM-0002', 'LAMINA ADHESIVA 50X10', 1, '', NULL, NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(5, 'DIS-CAJ-0005', 'CAJA CEBADERA', 2, '', 'Unidad', NULL, 'Activo', 'productos/dispositivos/caja-cebadera-5.png', NULL, NULL, NULL, 0),
(6, 'DIS-JAU-0004', 'JAULA DE CAPTURA', 2, '', 'Unidad', NULL, 'Activo', 'productos/dispositivos/jaula-tomahack-6.png', NULL, NULL, NULL, 0),
(7, 'DIS-BAN-0001', 'BANDEJA PEGANTE', 2, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(8, 'EPP-BAT-0001', 'BATA M', 3, 'ARMARIO MARRON', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(9, 'EPP-BAT-0005', 'BATA L', 3, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(10, 'EPP-BAT-0003', 'BATA S', 3, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(11, 'EPP-POL-0001', 'POLO L', 3, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(12, 'EPP-CHA-0001', 'CHALECO L', 3, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(13, 'EPP-CHA-0002', 'CHALECO XL', 3, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(14, 'EPP-PAN-0001', 'PANTALON XL', 3, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(15, 'EPP-PAN-0002', 'PANTALON M', 3, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(16, 'EPP-PAN-0003', 'PANTALON L', 3, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(17, 'EPP-PAN-0004', 'PANTALON S', 3, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(18, 'EPP-PAN-0005', 'PANTALON XXL', 3, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(19, 'QUI-BET-0005', 'BETAFOX', 4, '', 'Mililitros', 95.00, 'Activo', 'productos/quimicos/betafox-19.png', 'BETA-CYPERMETHRIN 6%', 'INSECTOS', 'EMULSION CONCENTRADA', 0),
(20, 'QUI-DMQ-0001', 'DMQ', 4, '', 'Mililitros', 105.00, 'Activo', 'productos/quimicos/dmq-20.png', 'Amonio Cuaternario de Quinta Generación', 'agente virucida, bactericida y fungicida', '3.75 L', 0),
(21, 'QUI-CEB-0004', 'CEBO FINAL BLOX', 4, '', 'Unidad', NULL, 'Activo', 'productos/consumible/cebo-final-all-21.png', 'BRODIFACOUM', 'ROEDORES', 'BLOQUE SOLIDO', 0),
(22, 'CON-CRO-0001', 'CROQUETAS', 5, '', 'Gramos', NULL, 'Activo', NULL, NULL, NULL, 'Saco 9kg', 0),
(23, 'DIS-LAM-0010', 'LAMINA PEGANTE', 2, '', 'Unidad', NULL, 'Activo', 'productos/dispositivos/lamina-pegante-23.png', NULL, NULL, 'caja de 72 unidades', 0),
(24, 'QUI-BOM-0003', 'BOMBAMAX', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/bombamax-24.png', 'ALFACIPERMETRINA/PIRIPROXYFEN', 'INSECTOS', 'EMULSION CONCENTRADA', 0),
(25, 'DIS-FLU-0002', 'FLUORESCENTE 20W', 2, '', 'Unidad', NULL, 'Activo', 'productos/dispositivos/foco-18w-25.png', NULL, NULL, NULL, 0),
(26, 'DIS-TUB-0001', 'TUBO CEBADERO', 2, '', 'Unidad', NULL, 'Activo', 'productos/dispositivos/tubo-cebadero-26.png', NULL, NULL, NULL, 0),
(27, 'INS-BAN-0001', 'BANDEJA SALCHIPAPERA', 1, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(28, 'INS-STI-0001', 'STICKER CONTROL DE ROEDORES', 1, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(29, 'INS-STI-0002', 'STICKER MONITOREO DE ROEDORES', 1, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(30, 'INS-STI-0003', 'STICKER CONTROL DE TRAMPA DE LUZ', 1, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(31, 'INS-STI-0004', 'STICKER CONTROL DE ROEDORES LP', 1, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(32, 'DIS-COM-0001', 'COMETA', 2, '', 'Unidad', 170.00, 'Activo', 'productos/dispositivos/cometa-32.png', NULL, NULL, NULL, 0),
(33, 'INS-ACI-0001', 'ACIDO BORICO', 1, '', 'Gramos', NULL, 'Activo', 'productos/insumos/acido-borico-33.png', NULL, NULL, NULL, 0),
(34, 'QUI-SPR-0004', 'SPRAY CONCENTRADO', 4, '', 'Mililitros', NULL, 'Activo', NULL, 'FIPRONIL 0.45%', 'CUCARACHAS', 'EMULSION CONCENTRADA', 0),
(35, 'QUI-PRO-0003', 'PROVECTA', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/provecta-35.png', 'POLIMEROS DE SILICIO', 'INSECTOS', 'EMULSION CONCENTRADA', 0),
(36, 'QUI-PLA-0002', 'PLATINUM', 4, '', 'Gramos', NULL, 'Activo', NULL, 'HIDRAMETILNONA 2.15%', 'CUCARACHAS', 'GEL', 0),
(37, 'INS-FLU-0001', 'FLUORESCENTE 15W', 1, '', 'Unidad', NULL, 'Activo', 'productos/insumos/fluorescente-15w-37.png', NULL, NULL, NULL, 0),
(38, 'QUI-COM-0001', 'COMPACT HEALTH', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/compact-health-38.png', 'ALFACIPERMETRINA/PIRIPROXYFEN', 'INSECTOS', 'EMULSION CONCENTRADA', 0),
(39, 'QUI-ALF-0001', 'ALFAPHOS', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/alfaphos-39.png', 'TEMEPHOS 25% / ALFACIPERMETRINA', 'INSECTOS', 'EMULSION CONCENTRADA', 0),
(40, 'QUI-KNO-0001', 'KNOCK DOWN', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/knock-down-40.png', 'TEMEPHOS 25% / ALFACIPERMETRIA 10%', 'INSECTOS', 'EMULSION CONCENTRADA', 0),
(41, 'QUI-APO-0002', 'APOLO', 4, '', NULL, NULL, 'Activo', 'productos/quimicos/apolo-41.png', 'IMIDACLOPRID 10%/BIFENTRIN 8%', 'INSECTO', 'EMULSION CONCENTRADA', 0),
(42, 'QUI-DCX-0001', 'DC-4060', 4, '', NULL, NULL, 'Activo', 'productos/quimicos/dc-4060-42.png', 'DIANIZON 36% / CIPERMETRINA 8%', 'INSECTOS', 'EMULSION CONCENTRADA', 0),
(43, 'QUI-DMQ-0002', 'DMQ', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/dmq-43.png', 'AMONIO CUATERNARIO', 'MICROORGANISMOS', 'EMULSION CONCENTRADA', 0),
(44, 'QUI-DRA-0002', 'DRAGON', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/dragon-44.png', 'PYRIPROXYFEN 2% / EXCIPIENTES 98%', 'INSECTOS', 'EMULSION CONCENTRADA', 0),
(45, 'QUI-BIO-0004', 'BIOLARVIKILL', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/biolarvikill-45.png', 'DELTA-TOXINA + COMPONENTES NICOTINICOS + ACEITES ESENCIALES', 'MOSCAS', 'SOLUCION LIQUIDA', 0),
(46, 'QUI-CIP-0001', 'CIPERVOX', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/cipervox-46.png', 'CIPERMETRINA 15%/ DICHLORVOS 30%', 'MOSCAS/CUCARACHAS', 'EMULSION CONCENTRADA', 0),
(47, 'QUI-BIO-0005', 'BIOINSECT', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/bioinsect-47.png', 'ESPORAS Y TOXINAS ENDOGENAS DE BACILLUS THURINGIENSIS 15%', 'INSECTOS', 'SOLUCION LIQUIDA (DILUYENTE)', 0),
(48, 'QUI-BIO-0003', 'BIOSANIT', 4, '', 'Mililitros', NULL, 'Activo', 'productos/quimicos/biosanit-48.png', NULL, 'BACTERICIDA', NULL, 0),
(49, 'INS-VAR-0002', 'VARSOL', 1, '', 'Mililitros', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(50, 'INS-ENT-0001', 'ENTOGLUE', 1, '', 'Gramos', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(51, 'DIS-LAM-0005', 'LAMINA DE TRAMPA DE LUZ 50X21', 2, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(52, 'DIS-LAM-0006', 'LAMINA DE TRAMPA DE LUZ 50X35', 2, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(53, 'DIS-LAM-0007', 'LAMINA DE TRAMPA DE LUZ 57.5X20', 2, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(54, 'DIS-LAM-0008', 'LAMINA DE TRAMPA DE LUZ 49.5X20', 2, '', NULL, NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(55, 'DIS-LAM-0009', 'LAMINA DE TRAMPA DE LUZ 46X28.5', 2, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(56, 'CON-MAI-0001', 'MAIZ MORADO', 5, '', 'Rodajas', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(57, 'DIS-TRA-0002', 'TRAMPA DE LUZ', 2, '', 'Unidad', NULL, 'Activo', 'productos/dispositivos/trampa-de-luz-57.png', NULL, NULL, NULL, 0),
(58, 'QUI-EXQ-0001', 'EXQUAT', 4, '', 'Mililitros', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(59, 'DIS-CAJ-0003', 'CAJA CEBADERA TUNEL', 2, '', 'Unidad', NULL, 'Activo', 'productos/dispositivos/caja-cebadera-tunel-59.png', NULL, NULL, NULL, 0),
(60, 'DIS-CAJ-0004', 'CAJA CEBADERA TUNEL', 2, '', 'Unidad', NULL, 'Activo', NULL, NULL, NULL, NULL, 0),
(61, 'INS-ROD-0003', 'RODILLO QUITA PELUSA', 1, '', 'Unidad', 4.00, 'Activo', 'productos/insumos/rodillo-quita-pelusa-61.png', NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_receta_detalle`
--

CREATE TABLE `producto_receta_detalle` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_producto_final` int(11) NOT NULL,
  `id_producto_insumo` int(11) NOT NULL,
  `cantidad` decimal(10,3) NOT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `observacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `producto_receta_detalle`
--

INSERT INTO `producto_receta_detalle` (`id`, `id_producto_final`, `id_producto_insumo`, `cantidad`, `unidad`, `observacion`) VALUES
(1, 1, 2, 1.000, NULL, NULL),
(2, 1, 4, 1.000, NULL, NULL),
(3, 1, 3, 1.880, 'Gramos', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_asesoria`
--

CREATE TABLE `programacion_asesoria` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_orden_asesoria` int(11) NOT NULL,
  `id_supervisor` int(11) DEFAULT NULL,
  `id_vehiculo` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` bigint(20) UNSIGNED DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `local_sede` varchar(150) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `modalidad_visita` varchar(20) DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecucion','Realizado','Reprogramado','Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_asesoria_exponentes`
--

CREATE TABLE `programacion_asesoria_exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_programacion_asesoria` int(11) NOT NULL,
  `id_exponente` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_capacitacion`
--

CREATE TABLE `programacion_capacitacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_orden_capacitacion` int(11) NOT NULL,
  `id_supervisor` int(11) DEFAULT NULL,
  `id_vehiculo` int(11) DEFAULT NULL,
  `id_tecnico_conductor` bigint(20) UNSIGNED DEFAULT NULL,
  `motivo` varchar(30) DEFAULT NULL,
  `motivo_otro` varchar(255) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` bigint(20) UNSIGNED DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `local_sede` varchar(150) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecucion','Realizado','Reprogramado','Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_capacitacion_exponentes`
--

CREATE TABLE `programacion_capacitacion_exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_programacion_capacitacion` int(11) NOT NULL,
  `id_exponente` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_exponentes`
--

CREATE TABLE `programacion_exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_programacion` bigint(20) UNSIGNED NOT NULL,
  `id_exponente` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_fabricacion`
--

CREATE TABLE `programacion_fabricacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_orden_fabricacion` int(10) UNSIGNED DEFAULT NULL,
  `motivo_fabricacion` varchar(255) NOT NULL,
  `productos_fabricacion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `receta_fabricacion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `id_tecnico_asignado` int(11) DEFAULT NULL,
  `tecnicos_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `id_supervisor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecución','Realizado','Reprogramado','Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_historial`
--

CREATE TABLE `programacion_historial` (
  `id` int(11) NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `campo_modificado` varchar(50) DEFAULT NULL,
  `valor_anterior` varchar(255) DEFAULT NULL,
  `valor_nuevo` varchar(255) DEFAULT NULL,
  `motivo` text DEFAULT NULL,
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_insumos`
--

CREATE TABLE `programacion_insumos` (
  `id` int(11) NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_lote` bigint(20) UNSIGNED DEFAULT NULL,
  `cantidad_asignada` int(11) NOT NULL,
  `cantidad_utilizada` int(11) DEFAULT NULL,
  `estado` enum('Asignado','Entregado','Utilizado','Devuelto') DEFAULT 'Asignado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `programacion_insumos`
--

INSERT INTO `programacion_insumos` (`id`, `id_programacion`, `id_producto`, `id_lote`, `cantidad_asignada`, `cantidad_utilizada`, `estado`) VALUES
(1278, 345, 5, 11, 5, 5, 'Utilizado'),
(1279, 345, 21, 6, 3, 3, 'Utilizado'),
(1280, 345, 23, 9, 2, 2, 'Utilizado'),
(1281, 345, 6, 8, 3, 3, 'Utilizado'),
(1282, 345, 44, 7, 100, 100, 'Utilizado'),
(1283, 346, 5, 11, 5, 5, 'Utilizado'),
(1284, 346, 21, 6, 3, 3, 'Utilizado'),
(1285, 346, 23, 9, 2, 2, 'Utilizado'),
(1286, 346, 6, 8, 3, 3, 'Utilizado'),
(1287, 346, 44, 7, 100, 100, 'Utilizado'),
(1288, 347, 5, 11, 5, 5, 'Utilizado'),
(1289, 347, 21, 6, 3, 3, 'Utilizado'),
(1290, 347, 23, 9, 2, 2, 'Utilizado'),
(1291, 347, 6, 8, 3, 3, 'Utilizado'),
(1292, 347, 44, 7, 100, 100, 'Utilizado'),
(1293, 348, 5, NULL, 5, NULL, 'Asignado'),
(1294, 348, 21, NULL, 3, NULL, 'Asignado'),
(1295, 348, 23, NULL, 2, NULL, 'Asignado'),
(1296, 348, 6, NULL, 3, NULL, 'Asignado'),
(1297, 348, 44, NULL, 100, NULL, 'Asignado'),
(1298, 349, 5, NULL, 5, NULL, 'Asignado'),
(1299, 349, 21, NULL, 3, NULL, 'Asignado'),
(1300, 349, 23, NULL, 2, NULL, 'Asignado'),
(1301, 349, 6, NULL, 3, NULL, 'Asignado'),
(1302, 349, 44, NULL, 100, NULL, 'Asignado'),
(1303, 350, 5, NULL, 5, NULL, 'Asignado'),
(1304, 350, 21, NULL, 3, NULL, 'Asignado'),
(1305, 350, 23, NULL, 2, NULL, 'Asignado'),
(1306, 350, 6, NULL, 3, NULL, 'Asignado'),
(1307, 350, 44, NULL, 100, NULL, 'Asignado'),
(1308, 351, 5, NULL, 5, NULL, 'Asignado'),
(1309, 351, 21, NULL, 3, NULL, 'Asignado'),
(1310, 351, 23, NULL, 2, NULL, 'Asignado'),
(1311, 351, 6, NULL, 3, NULL, 'Asignado'),
(1312, 351, 44, NULL, 100, NULL, 'Asignado'),
(1313, 352, 5, NULL, 5, NULL, 'Asignado'),
(1314, 352, 21, NULL, 3, NULL, 'Asignado'),
(1315, 352, 23, NULL, 2, NULL, 'Asignado'),
(1316, 352, 6, NULL, 3, NULL, 'Asignado'),
(1317, 352, 44, NULL, 100, NULL, 'Asignado'),
(1318, 353, 5, NULL, 5, NULL, 'Asignado'),
(1319, 353, 21, NULL, 3, NULL, 'Asignado'),
(1320, 353, 23, NULL, 2, NULL, 'Asignado'),
(1321, 353, 6, NULL, 3, NULL, 'Asignado'),
(1322, 353, 44, NULL, 100, NULL, 'Asignado'),
(1323, 354, 5, NULL, 5, NULL, 'Asignado'),
(1324, 354, 21, NULL, 3, NULL, 'Asignado'),
(1325, 354, 23, NULL, 2, NULL, 'Asignado'),
(1326, 354, 6, NULL, 3, NULL, 'Asignado'),
(1327, 354, 44, NULL, 100, NULL, 'Asignado'),
(1328, 355, 5, NULL, 5, NULL, 'Asignado'),
(1329, 355, 21, NULL, 3, NULL, 'Asignado'),
(1330, 355, 23, NULL, 2, NULL, 'Asignado'),
(1331, 355, 6, NULL, 3, NULL, 'Asignado'),
(1332, 355, 44, NULL, 100, NULL, 'Asignado'),
(1333, 356, 5, NULL, 5, NULL, 'Asignado'),
(1334, 356, 21, NULL, 3, NULL, 'Asignado'),
(1335, 356, 23, NULL, 2, NULL, 'Asignado'),
(1336, 356, 6, NULL, 3, NULL, 'Asignado'),
(1337, 356, 44, NULL, 100, NULL, 'Asignado'),
(1338, 357, 5, NULL, 5, NULL, 'Asignado'),
(1339, 357, 21, NULL, 3, NULL, 'Asignado'),
(1340, 357, 23, NULL, 2, NULL, 'Asignado'),
(1341, 357, 6, NULL, 3, NULL, 'Asignado'),
(1342, 357, 44, NULL, 100, NULL, 'Asignado'),
(1343, 358, 5, NULL, 5, NULL, 'Asignado'),
(1344, 358, 21, NULL, 3, NULL, 'Asignado'),
(1345, 358, 23, NULL, 2, NULL, 'Asignado'),
(1346, 358, 6, NULL, 3, NULL, 'Asignado'),
(1347, 358, 44, NULL, 100, NULL, 'Asignado'),
(1348, 359, 5, NULL, 5, NULL, 'Asignado'),
(1349, 359, 21, NULL, 3, NULL, 'Asignado'),
(1350, 359, 23, NULL, 2, NULL, 'Asignado'),
(1351, 359, 6, NULL, 3, NULL, 'Asignado'),
(1352, 359, 44, NULL, 100, NULL, 'Asignado'),
(1353, 360, 5, NULL, 5, NULL, 'Asignado'),
(1354, 360, 21, NULL, 3, NULL, 'Asignado'),
(1355, 360, 23, NULL, 2, NULL, 'Asignado'),
(1356, 360, 6, NULL, 3, NULL, 'Asignado'),
(1357, 360, 44, NULL, 100, NULL, 'Asignado'),
(1358, 361, 5, NULL, 5, NULL, 'Asignado'),
(1359, 361, 21, NULL, 3, NULL, 'Asignado'),
(1360, 361, 23, NULL, 2, NULL, 'Asignado'),
(1361, 361, 6, NULL, 3, NULL, 'Asignado'),
(1362, 361, 44, NULL, 100, NULL, 'Asignado'),
(1363, 362, 57, 10, 5, 5, 'Utilizado'),
(1364, 362, 47, 4, 100, 100, 'Utilizado'),
(1365, 363, 57, 10, 5, 5, 'Utilizado'),
(1366, 363, 47, 4, 100, 100, 'Utilizado'),
(1367, 364, 57, 10, 5, 5, 'Utilizado'),
(1368, 364, 47, 4, 100, 100, 'Utilizado'),
(1369, 365, 57, NULL, 5, NULL, 'Asignado'),
(1370, 365, 47, NULL, 100, NULL, 'Asignado'),
(1371, 366, 57, NULL, 5, NULL, 'Asignado'),
(1372, 366, 47, NULL, 100, NULL, 'Asignado'),
(1373, 367, 57, NULL, 5, NULL, 'Asignado'),
(1374, 367, 47, NULL, 100, NULL, 'Asignado'),
(1375, 368, 57, NULL, 5, NULL, 'Asignado'),
(1376, 368, 47, NULL, 100, NULL, 'Asignado'),
(1377, 369, 57, NULL, 5, NULL, 'Asignado'),
(1378, 369, 47, NULL, 100, NULL, 'Asignado'),
(1379, 370, 57, NULL, 5, NULL, 'Asignado'),
(1380, 370, 47, NULL, 100, NULL, 'Asignado'),
(1381, 371, 57, NULL, 5, NULL, 'Asignado'),
(1382, 371, 47, NULL, 100, NULL, 'Asignado'),
(1383, 372, 57, NULL, 5, NULL, 'Asignado'),
(1384, 372, 47, NULL, 100, NULL, 'Asignado'),
(1385, 373, 57, NULL, 5, NULL, 'Asignado'),
(1386, 373, 47, NULL, 100, NULL, 'Asignado'),
(1387, 374, 57, NULL, 5, NULL, 'Asignado'),
(1388, 374, 47, NULL, 100, NULL, 'Asignado'),
(1389, 375, 57, NULL, 5, NULL, 'Asignado'),
(1390, 375, 47, NULL, 100, NULL, 'Asignado'),
(1391, 376, 57, NULL, 5, NULL, 'Asignado'),
(1392, 376, 47, NULL, 100, NULL, 'Asignado'),
(1393, 377, 57, NULL, 5, NULL, 'Asignado'),
(1394, 377, 47, NULL, 100, NULL, 'Asignado'),
(1395, 378, 57, NULL, 5, NULL, 'Asignado'),
(1396, 378, 47, NULL, 100, NULL, 'Asignado'),
(1397, 379, 23, 9, 5, 5, 'Utilizado'),
(1398, 379, 19, 3, 100, 100, 'Utilizado'),
(1399, 380, 23, 9, 5, 5, 'Utilizado'),
(1400, 380, 19, 3, 100, 100, 'Utilizado'),
(1401, 381, 23, 9, 5, 5, 'Utilizado'),
(1402, 381, 19, 3, 100, 100, 'Utilizado'),
(1403, 382, 23, NULL, 5, NULL, 'Asignado'),
(1404, 382, 19, NULL, 100, NULL, 'Asignado'),
(1405, 383, 23, NULL, 5, NULL, 'Asignado'),
(1406, 383, 19, NULL, 100, NULL, 'Asignado'),
(1407, 384, 23, NULL, 5, NULL, 'Asignado'),
(1408, 384, 19, NULL, 100, NULL, 'Asignado'),
(1409, 385, 23, NULL, 5, NULL, 'Asignado'),
(1410, 385, 19, NULL, 100, NULL, 'Asignado'),
(1411, 386, 23, NULL, 5, NULL, 'Asignado'),
(1412, 386, 19, NULL, 100, NULL, 'Asignado'),
(1413, 387, 23, NULL, 5, NULL, 'Asignado'),
(1414, 387, 19, NULL, 100, NULL, 'Asignado'),
(1415, 388, 23, NULL, 5, NULL, 'Asignado'),
(1416, 388, 19, NULL, 100, NULL, 'Asignado'),
(1417, 389, 23, NULL, 5, NULL, 'Asignado'),
(1418, 389, 19, NULL, 100, NULL, 'Asignado'),
(1419, 390, 23, NULL, 5, NULL, 'Asignado'),
(1420, 390, 19, NULL, 100, NULL, 'Asignado'),
(1421, 391, 23, NULL, 5, NULL, 'Asignado'),
(1422, 391, 19, NULL, 100, NULL, 'Asignado'),
(1423, 392, 23, NULL, 5, NULL, 'Asignado'),
(1424, 392, 19, NULL, 100, NULL, 'Asignado'),
(1425, 393, 23, NULL, 5, NULL, 'Asignado'),
(1426, 393, 19, NULL, 100, NULL, 'Asignado'),
(1427, 394, 23, NULL, 5, NULL, 'Asignado'),
(1428, 394, 19, NULL, 100, NULL, 'Asignado'),
(1429, 395, 23, NULL, 5, NULL, 'Asignado'),
(1430, 395, 19, NULL, 100, NULL, 'Asignado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_mantenimiento`
--

CREATE TABLE `programacion_mantenimiento` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_equipo` int(11) NOT NULL,
  `id_actmanten` int(11) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `anio` int(11) NOT NULL,
  `modo_programacion` enum('Anual','Unica') NOT NULL DEFAULT 'Anual',
  `frecuencia_meses` int(11) NOT NULL COMMENT 'Cada cuántos meses: 1,2,3,4,6,12',
  `fecha_inicio` date NOT NULL,
  `total_programados` int(11) NOT NULL DEFAULT 0,
  `observaciones` varchar(255) DEFAULT NULL,
  `es_prueba` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `programacion_mantenimiento`
--

INSERT INTO `programacion_mantenimiento` (`id`, `id_equipo`, `id_actmanten`, `motivo`, `anio`, `modo_programacion`, `frecuencia_meses`, `fecha_inicio`, `total_programados`, `observaciones`, `es_prueba`, `created_at`) VALUES
(3, 2, 2, 'Mantenimiento preventivo', 2026, 'Anual', 3, '2026-05-09', 3, NULL, 0, '2026-04-13 16:29:22'),
(4, 3, 2, 'Mantenimiento preventivo', 2026, 'Anual', 3, '2026-05-09', 3, NULL, 0, '2026-04-13 16:29:47'),
(5, 6, 2, 'Mantenimiento preventivo', 2026, 'Anual', 3, '2026-05-09', 3, NULL, 0, '2026-04-13 16:33:51'),
(8, 1, 1, 'Derrame de Gasolina, Demora en encedido, descarga rapida', 2026, 'Unica', 0, '2026-04-17', 1, NULL, 0, '2026-04-17 13:35:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_mantenimiento_vehiculo`
--

CREATE TABLE `programacion_mantenimiento_vehiculo` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_vehiculo` int(11) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `anio` int(11) NOT NULL,
  `frecuencia_meses` int(11) NOT NULL COMMENT 'Cada cuántos meses: 1,2,3,4,6,12',
  `fecha_inicio` date NOT NULL,
  `total_programados` int(11) NOT NULL DEFAULT 0,
  `observaciones` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_notificaciones`
--

CREATE TABLE `programacion_notificaciones` (
  `id` int(11) NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `tipo` enum('Asignacion','Modificacion','Recordatorio','Cancelacion') NOT NULL,
  `destinatario_tipo` enum('Tecnico','Cliente','Supervisor') NOT NULL,
  `id_destinatario` int(11) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `enviado` tinyint(1) DEFAULT 0,
  `fecha_envio` datetime DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_otros`
--

CREATE TABLE `programacion_otros` (
  `id` int(10) UNSIGNED NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `id_tecnico_asignado` int(11) DEFAULT NULL,
  `tecnicos_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `id_supervisor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `id_vehiculo` int(11) DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `ubicacion_manual` varchar(255) NOT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecución','Realizado','Reprogramado','Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_servicio`
--

CREATE TABLE `programacion_servicio` (
  `id` int(11) NOT NULL,
  `id_orden_servicio` int(11) DEFAULT NULL,
  `id_orden_capacitacion` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `formatos_fichas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`formatos_fichas`)),
  `id_servicio` int(11) NOT NULL,
  `id_tecnico_asignado` int(11) DEFAULT NULL,
  `id_supervisor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `id_vehiculo` int(11) DEFAULT NULL,
  `id_grupo_programacion` int(10) UNSIGNED DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `dias_semana` varchar(100) DEFAULT NULL COMMENT 'Días de la semana específicos cuando frecuencia es "Días de la semana" (CSV: Lunes,Martes,etc.)',
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `duracion_real` int(11) DEFAULT NULL,
  `local_sede` varchar(150) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecución','Realizado','Reprogramado','Cancelado') DEFAULT 'Programado',
  `requiere_asignacion_recursos` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_ejecucion_real` datetime DEFAULT NULL,
  `certificado_generado` tinyint(1) DEFAULT 0,
  `ruta_pdf_certificado` varchar(255) DEFAULT NULL,
  `ruta_pdf_agenda` varchar(255) DEFAULT NULL,
  `fotos_evidencia` text DEFAULT NULL,
  `firma_cliente` varchar(255) DEFAULT NULL,
  `calificacion_cliente` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `programacion_servicio`
--

INSERT INTO `programacion_servicio` (`id`, `id_orden_servicio`, `id_orden_capacitacion`, `id_cliente_planta`, `id_cliente_planta_area`, `formatos_fichas`, `id_servicio`, `id_tecnico_asignado`, `id_supervisor`, `id_vehiculo`, `id_grupo_programacion`, `fecha_programada`, `dias_semana`, `hora_inicio`, `hora_fin`, `duracion_real`, `local_sede`, `direccion_completa`, `latitud`, `longitud`, `estado_ejecucion`, `requiere_asignacion_recursos`, `fecha_ejecucion_real`, `certificado_generado`, `ruta_pdf_certificado`, `ruta_pdf_agenda`, `fotos_evidencia`, `firma_cliente`, `calificacion_cliente`, `observaciones`, `creado_por`, `fecha_creacion`, `modificado_por`, `fecha_modificacion`) VALUES
(345, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, 1, NULL, NULL, NULL, '2026-05-01', NULL, '06:00:00', '08:00:00', 3, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Realizado', 0, '2026-05-01 20:14:44', 0, NULL, NULL, '[{\"path\":\"programacion-servicio\\/evidencias\\/345\\/20260510_201444_5a25dacb-6ce9-4e39-ae56-39527ae1388c.jpg\",\"service_id\":345,\"service_title\":\"FUMIGACION\"},{\"path\":\"programacion-servicio\\/evidencias\\/345\\/20260510_201444_1257d86f-79b0-4618-b4ec-ef75e750cb93.jpg\",\"service_id\":345,\"service_title\":\"FUMIGACION\"}]', NULL, NULL, NULL, 22, '2026-05-10 20:07:09', 23, '2026-05-10 20:14:44'),
(346, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, 1, NULL, NULL, NULL, '2026-05-16', NULL, '06:00:00', '08:00:00', 2, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Realizado', 0, '2026-05-15 20:25:12', 0, NULL, NULL, '[{\"path\":\"programacion-servicio\\/evidencias\\/346\\/20260510_202512_0b43304c-3197-4d13-85d4-7e117a4e1c81.jpg\",\"service_id\":346,\"service_title\":\"FUMIGACION\"},{\"path\":\"programacion-servicio\\/evidencias\\/346\\/20260510_202512_cebe2730-e82d-4ce2-bf5e-6e676e362351.jpg\",\"service_id\":346,\"service_title\":\"FUMIGACION\"}]', NULL, NULL, NULL, 22, '2026-05-10 20:07:09', 23, '2026-05-10 20:25:12'),
(347, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, 1, NULL, NULL, NULL, '2026-05-31', NULL, '06:00:00', '08:00:00', 2, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Realizado', 0, '2026-05-29 20:53:38', 0, NULL, NULL, '[{\"path\":\"programacion-servicio\\/evidencias\\/347\\/20260510_205338_46144aab-360f-4b71-9d5d-c8d2220e17ce.jpg\",\"service_id\":347,\"service_title\":\"FUMIGACION\"},{\"path\":\"programacion-servicio\\/evidencias\\/347\\/20260510_205338_91808bd0-c152-4541-8a76-62a9a78c830a.jpg\",\"service_id\":347,\"service_title\":\"FUMIGACION\"}]', NULL, NULL, NULL, 22, '2026-05-10 20:07:09', 23, '2026-05-10 20:53:38'),
(348, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-06-15', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(349, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-06-30', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(350, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-07-15', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(351, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-07-30', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(352, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-08-14', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(353, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-08-29', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(354, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-09-13', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(355, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-09-28', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(356, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-10-13', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(357, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-10-28', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(358, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-11-12', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(359, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-11-27', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(360, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-12-12', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(361, 18, NULL, 7, '[11]', '[\"CONTROL DE ROEDORES\"]', 13, NULL, NULL, NULL, NULL, '2026-12-27', NULL, '06:00:00', '08:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:09', NULL, '2026-05-10 20:07:09'),
(362, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, 1, NULL, NULL, NULL, '2026-05-01', NULL, '08:01:00', '10:00:00', 3, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Realizado', 0, '2026-05-02 20:17:16', 0, NULL, NULL, '[{\"path\":\"programacion-servicio\\/evidencias\\/362\\/20260510_201716_be434637-7271-426c-be3e-0e1688cc27ab.jpg\",\"service_id\":362,\"service_title\":\"FUMIGACION Y DESINFECCION\"},{\"path\":\"programacion-servicio\\/evidencias\\/362\\/20260510_201716_ce7e8d3d-a924-47ea-8342-377f87f76724.jpg\",\"service_id\":362,\"service_title\":\"FUMIGACION Y DESINFECCION\"},{\"path\":\"programacion-servicio\\/evidencias\\/362\\/20260510_201716_e00e77c6-0ea8-4d8b-ad3e-5cbd49d09119.jpg\",\"service_id\":362,\"service_title\":\"FUMIGACION Y DESINFECCION\"}]', NULL, NULL, NULL, 22, '2026-05-10 20:07:34', 23, '2026-05-10 20:17:16'),
(363, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, 1, NULL, NULL, NULL, '2026-05-16', NULL, '08:01:00', '10:00:00', 2, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Realizado', 0, '2026-05-16 20:27:04', 0, NULL, NULL, '[{\"path\":\"programacion-servicio\\/evidencias\\/363\\/20260510_202704_633c321b-d9a5-4fad-bc46-ff0670042c18.jpg\",\"service_id\":363,\"service_title\":\"FUMIGACION Y DESINFECCION\"},{\"path\":\"programacion-servicio\\/evidencias\\/363\\/20260510_202704_e619fa3d-5916-4dca-b345-1b264f9a8422.jpg\",\"service_id\":363,\"service_title\":\"FUMIGACION Y DESINFECCION\"}]', NULL, NULL, NULL, 22, '2026-05-10 20:07:34', 23, '2026-05-10 20:27:04'),
(364, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, 1, NULL, NULL, NULL, '2026-05-31', NULL, '08:01:00', '10:00:00', 2, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Realizado', 0, '2026-05-30 20:55:44', 0, NULL, NULL, '[{\"path\":\"programacion-servicio\\/evidencias\\/364\\/20260510_205544_57e648cc-cf41-4b95-b555-557fcc184532.jpg\",\"service_id\":364,\"service_title\":\"FUMIGACION Y DESINFECCION\"},{\"path\":\"programacion-servicio\\/evidencias\\/364\\/20260510_205544_e3070a18-55f2-4830-8c71-cd5985a8691f.jpg\",\"service_id\":364,\"service_title\":\"FUMIGACION Y DESINFECCION\"},{\"path\":\"programacion-servicio\\/evidencias\\/364\\/20260510_205544_bd2ec575-238a-43be-ace6-d400e06a08c6.jpg\",\"service_id\":364,\"service_title\":\"FUMIGACION Y DESINFECCION\"}]', NULL, NULL, NULL, 22, '2026-05-10 20:07:34', 23, '2026-05-10 20:55:44'),
(365, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-06-15', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(366, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-06-30', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(367, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-07-15', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(368, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-07-30', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(369, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-08-14', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(370, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-08-29', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(371, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-09-13', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(372, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-09-28', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(373, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-10-13', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(374, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-10-28', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(375, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-11-12', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(376, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-11-27', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(377, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-12-12', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(378, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS VOLADORES\"]', 14, NULL, NULL, NULL, NULL, '2026-12-27', NULL, '08:01:00', '10:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:34', NULL, '2026-05-10 20:07:34'),
(379, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, 1, NULL, NULL, NULL, '2026-05-01', NULL, '10:01:00', '12:00:00', 2, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Realizado', 0, '2026-05-03 20:19:10', 0, NULL, NULL, '[{\"path\":\"programacion-servicio\\/evidencias\\/379\\/20260510_201910_e41ec79c-a09d-4105-976f-cd457133e380.jpg\",\"service_id\":379,\"service_title\":\"INTERVENCION POR CUCARACHAS\"},{\"path\":\"programacion-servicio\\/evidencias\\/379\\/20260510_201910_bdcc377c-2751-4684-b005-daf8edec26a7.jpg\",\"service_id\":379,\"service_title\":\"INTERVENCION POR CUCARACHAS\"},{\"path\":\"programacion-servicio\\/evidencias\\/379\\/20260510_201910_5e0bce33-6c33-4986-a22a-f8b2fd1d0a72.jpg\",\"service_id\":379,\"service_title\":\"INTERVENCION POR CUCARACHAS\"}]', NULL, NULL, NULL, 22, '2026-05-10 20:07:56', 23, '2026-05-10 20:19:10'),
(380, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, 1, NULL, NULL, NULL, '2026-05-16', NULL, '10:01:00', '12:00:00', 2, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Realizado', 0, '2026-05-17 20:22:37', 0, NULL, NULL, '[{\"path\":\"programacion-servicio\\/evidencias\\/380\\/20260510_202237_8d210862-58ae-480e-82e6-5a44a3a15f85.jpg\",\"service_id\":380,\"service_title\":\"INTERVENCION POR CUCARACHAS\"},{\"path\":\"programacion-servicio\\/evidencias\\/380\\/20260510_202237_4c719e56-bdd8-451c-ab17-4ca3e4e0e57f.jpg\",\"service_id\":380,\"service_title\":\"INTERVENCION POR CUCARACHAS\"}]', NULL, NULL, NULL, 22, '2026-05-10 20:07:57', 23, '2026-05-10 20:22:37'),
(381, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, 1, NULL, NULL, NULL, '2026-05-31', NULL, '10:01:00', '12:00:00', 2, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Realizado', 0, '2026-05-31 20:57:09', 0, NULL, NULL, '[{\"path\":\"programacion-servicio\\/evidencias\\/381\\/20260510_205709_fbc70b5b-0f10-4171-828b-09e93887a363.jpg\",\"service_id\":381,\"service_title\":\"INTERVENCION POR CUCARACHAS\"},{\"path\":\"programacion-servicio\\/evidencias\\/381\\/20260510_205709_b6411829-cf7e-4f46-94bb-826d203b26b8.jpg\",\"service_id\":381,\"service_title\":\"INTERVENCION POR CUCARACHAS\"}]', NULL, NULL, NULL, 22, '2026-05-10 20:07:57', 23, '2026-05-10 20:57:09'),
(382, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-06-15', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(383, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-06-30', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(384, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-07-15', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(385, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-07-30', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(386, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-08-14', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(387, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-08-29', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(388, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-09-13', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(389, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-09-28', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(390, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-10-13', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(391, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-10-28', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(392, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-11-12', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(393, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-11-27', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(394, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-12-12', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57'),
(395, 18, NULL, 7, '[11]', '[\"CONTROL DE INSECTOS RASTREROS\"]', 8, NULL, NULL, NULL, NULL, '2026-12-27', NULL, '10:01:00', '12:00:00', NULL, 'LARITZA ESPINAR', 'Av. Comandante Espinar 800, Miraflores 15074', -12.11143874, -77.03675509, 'Programado', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 22, '2026-05-10 20:07:57', NULL, '2026-05-10 20:07:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_servicio_grupos`
--

CREATE TABLE `programacion_servicio_grupos` (
  `id` int(10) UNSIGNED NOT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `id_cliente` bigint(20) UNSIGNED NOT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `tecnicos_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `cantidad_programaciones` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `creado_por` bigint(20) UNSIGNED DEFAULT NULL,
  `modificado_por` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_servicio_inicios`
--

CREATE TABLE `programacion_servicio_inicios` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_tecnico` int(10) UNSIGNED DEFAULT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `duracion_segundos` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `programacion_servicio_inicios`
--

INSERT INTO `programacion_servicio_inicios` (`id`, `id_programacion`, `id_usuario`, `id_tecnico`, `fecha_inicio`, `fecha_fin`, `duracion_segundos`, `created_at`, `updated_at`) VALUES
(23, 345, 23, 1, '2026-05-10 20:12:01', '2026-05-10 20:14:44', 164, '2026-05-11 01:12:01', '2026-05-11 01:14:44'),
(24, 362, 23, 1, '2026-05-10 20:14:52', '2026-05-10 20:17:16', 144, '2026-05-11 01:14:52', '2026-05-11 01:17:16'),
(25, 379, 23, 1, '2026-05-10 20:17:31', '2026-05-10 20:19:10', 100, '2026-05-11 01:17:31', '2026-05-11 01:19:10'),
(26, 380, 23, 1, '2026-05-10 20:20:51', '2026-05-10 20:22:37', 107, '2026-05-11 01:20:51', '2026-05-11 01:22:37'),
(27, 346, 23, 1, '2026-05-10 20:23:10', '2026-05-10 20:25:12', 123, '2026-05-11 01:23:10', '2026-05-11 01:25:12'),
(28, 363, 23, 1, '2026-05-10 20:25:19', '2026-05-10 20:27:04', 106, '2026-05-11 01:25:19', '2026-05-11 01:27:04'),
(29, 347, 23, 1, '2026-05-10 20:51:50', '2026-05-10 20:53:38', 109, '2026-05-11 01:51:50', '2026-05-11 01:53:38'),
(30, 364, 23, 1, '2026-05-10 20:53:42', '2026-05-10 20:55:44', 123, '2026-05-11 01:53:42', '2026-05-11 01:55:44'),
(31, 381, 23, 1, '2026-05-10 20:55:49', '2026-05-10 20:57:09', 80, '2026-05-11 01:55:49', '2026-05-11 01:57:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_tecnicos`
--

CREATE TABLE `programacion_tecnicos` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `rol` enum('Principal','Apoyo') NOT NULL DEFAULT 'Apoyo',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `programacion_tecnicos`
--

INSERT INTO `programacion_tecnicos` (`id`, `id_programacion`, `id_tecnico`, `rol`, `created_at`, `updated_at`) VALUES
(109, 345, 1, 'Principal', '2026-05-11 01:07:09', '2026-05-11 01:07:09'),
(110, 345, 5, 'Apoyo', '2026-05-11 01:07:09', '2026-05-11 01:07:09'),
(111, 346, 1, 'Principal', '2026-05-11 01:07:09', '2026-05-11 01:07:09'),
(112, 346, 5, 'Apoyo', '2026-05-11 01:07:09', '2026-05-11 01:07:09'),
(113, 347, 1, 'Principal', '2026-05-11 01:07:09', '2026-05-11 01:07:09'),
(114, 347, 5, 'Apoyo', '2026-05-11 01:07:09', '2026-05-11 01:07:09'),
(115, 362, 1, 'Principal', '2026-05-11 01:07:34', '2026-05-11 01:07:34'),
(116, 362, 5, 'Apoyo', '2026-05-11 01:07:34', '2026-05-11 01:07:34'),
(117, 363, 1, 'Principal', '2026-05-11 01:07:34', '2026-05-11 01:07:34'),
(118, 363, 5, 'Apoyo', '2026-05-11 01:07:34', '2026-05-11 01:07:34'),
(119, 364, 1, 'Principal', '2026-05-11 01:07:34', '2026-05-11 01:07:34'),
(120, 364, 5, 'Apoyo', '2026-05-11 01:07:34', '2026-05-11 01:07:34'),
(121, 379, 1, 'Principal', '2026-05-11 01:07:56', '2026-05-11 01:07:56'),
(122, 379, 5, 'Apoyo', '2026-05-11 01:07:56', '2026-05-11 01:07:56'),
(123, 380, 1, 'Principal', '2026-05-11 01:07:57', '2026-05-11 01:07:57'),
(124, 380, 5, 'Apoyo', '2026-05-11 01:07:57', '2026-05-11 01:07:57'),
(125, 381, 1, 'Principal', '2026-05-11 01:07:57', '2026-05-11 01:07:57'),
(126, 381, 5, 'Apoyo', '2026-05-11 01:07:57', '2026-05-11 01:07:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_visita`
--

CREATE TABLE `programacion_visita` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `tipo_visita` varchar(120) NOT NULL,
  `id_tecnico_asignado` int(11) DEFAULT NULL,
  `tecnicos_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `id_supervisor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `id_vehiculo` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `local_sede` varchar(150) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecución','Realizado','Reprogramado','Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `razon_social` varchar(200) NOT NULL,
  `ruc` varchar(20) DEFAULT NULL,
  `nombre_comercial` varchar(200) DEFAULT NULL,
  `contacto_nombre` varchar(150) DEFAULT NULL,
  `contacto_telefono` varchar(30) DEFAULT NULL,
  `contacto_email` varchar(150) DEFAULT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `banco` varchar(100) DEFAULT NULL,
  `numero_cuenta` varchar(50) DEFAULT NULL,
  `cci` varchar(50) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `razon_social`, `ruc`, `nombre_comercial`, `contacto_nombre`, `contacto_telefono`, `contacto_email`, `direccion`, `banco`, `numero_cuenta`, `cci`, `estado`, `observaciones`, `created_at`, `updated_at`) VALUES
(1, 'GRAFICA ATENCIA S.A.C.', '20603766394', NULL, 'REBECA ATENCIA', '956048079', 'graficaatencia@gmail.com', 'AV. BOLIVIA 148 INT. 3203 CERCADO DE LIMA', 'BCP', '191-2644043-0-04', NULL, 'Activo', 'Stickers, no incluye delivery', '2026-04-14 20:17:17', '2026-04-14 20:17:17'),
(2, 'PISAPIG S.A.', '20100311331', 'PISAPIG', 'Pietro', '947 714 938', NULL, 'Av. Caminos del Inca 1089, Dpto 302, Surco, Lima', 'BCP', '1940724405131', '00219400072440513199', 'Activo', NULL, '2026-04-15 20:24:18', '2026-04-15 20:43:45'),
(3, 'EPACAL', '20609228459', 'EPACAL', 'Mary', '987 380 080', 'comercial@epacalgroup.com', 'Pasaje José María Quimper 135, cercado de lima', 'BCP', '1919876476081', '00219100987647608159', 'Activo', NULL, '2026-04-15 20:29:33', '2026-04-15 20:29:33'),
(4, 'GROVE', '20207931471', 'GROVE', 'HERNAN', '987 595 393', NULL, 'Av. Angamos Este 865, Surquillo 15Av. Angamos Este 865, Surquillo 15047054', 'BCP', '193-1058389-096', '002-193-001058389096-16', 'Activo', NULL, '2026-04-15 20:55:28', '2026-04-15 20:55:28'),
(5, 'PLEEZ', '20604551065', 'PLEEZ', 'Francisco', '950 789 384', 'comercial@pleez.pe', 'av colectora industrial MZ a 19 lote 8 sta anita', 'BCP', '1942569667030', '00219400256966703093', 'Activo', NULL, '2026-04-15 21:57:47', '2026-04-15 21:57:47'),
(6, 'MRUPLAST Internacional E.I.R.L.', '20339899895', 'MARUPLAST', 'Rufino', '976 763 188', 'ventas3@maruplast.com', 'calle Diego de Aguero 268 Valle Hermoso -Surco', 'BCP', '1911100611082', NULL, 'Activo', NULL, '2026-04-15 22:08:10', '2026-04-15 22:08:10'),
(7, 'JL graphics S.A.C', '20607382256', 'JC', 'José', '989 551 459', 'leandro_21_16@hotmail.com', 'Jr. Orbegoso 249 Breña', 'BCP', '19119993522075', '00219111999352207555', 'Activo', 'venta de carton base para laminas de trampa de luz', '2026-04-15 22:12:53', '2026-04-15 22:15:08'),
(8, 'Publeserg', '20609990962', 'cuierta papel guisa', 'Estefani', '963502083', 'Publseserg@gmail.com', 'Jr. Orbegoso 263 Breña', NULL, NULL, NULL, 'Activo', NULL, '2026-04-15 22:19:17', '2026-04-15 22:55:58'),
(9, 'Electro Comercial heedy', NULL, 'electro Fluorescentes', NULL, '988 755 949', NULL, 'Jr Paruro 1202 Cercado - Lima', NULL, NULL, NULL, 'Activo', NULL, '2026-04-15 22:21:52', '2026-04-15 22:21:52'),
(10, 'BORDADOS ELIAM', NULL, 'MAMELUCO BLANCO', NULL, '955 307 824', NULL, 'MALVINAS DE ARGENTINA', NULL, NULL, NULL, 'Activo', NULL, '2026-04-15 22:27:12', '2026-04-15 22:27:12'),
(11, 'GARELY´S SERVICE  E.I.R.L', '20607996998', 'GUANTES, COFIAS , MASCARILLAS', 'JUAN', NULL, 'garelysservicemedical@gmail.com', 'Jr. Chancay 627, 101', 'BCP', '1919560839028', '00219100956083902852', 'Activo', NULL, '2026-04-15 22:36:06', '2026-04-15 22:36:06'),
(12, 'DOLLARCITY', '20606109343', NULL, NULL, NULL, NULL, 'MALL AVENTURA SAN JUAN DE  LURIGANCHO', NULL, NULL, NULL, 'Activo', NULL, '2026-04-29 13:57:30', '2026-04-29 13:57:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecciones`
--

CREATE TABLE `proyecciones` (
  `id` int(11) NOT NULL,
  `actividad` varchar(100) DEFAULT NULL,
  `id_multicim` int(11) NOT NULL,
  `tipo_orden` varchar(50) DEFAULT NULL,
  `id_referencia` int(11) DEFAULT NULL,
  `id_orden_servicio` int(11) DEFAULT NULL,
  `id_orden_producto` int(11) DEFAULT NULL,
  `id_orden_capacitacion_auditoria` int(11) DEFAULT NULL,
  `n_factura` varchar(100) DEFAULT NULL,
  `monto_detrax` decimal(10,2) NOT NULL,
  `total_final` decimal(10,2) NOT NULL,
  `fecha_factura` date DEFAULT NULL,
  `dias_credito` int(11) DEFAULT NULL,
  `fecha_vcto` date DEFAULT NULL,
  `dia_vencer` int(11) DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `fecha_ejecucion` date DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `proyecciones`
--

INSERT INTO `proyecciones` (`id`, `actividad`, `id_multicim`, `tipo_orden`, `id_referencia`, `id_orden_servicio`, `id_orden_producto`, `id_orden_capacitacion_auditoria`, `n_factura`, `monto_detrax`, `total_final`, `fecha_factura`, `dias_credito`, `fecha_vcto`, `dia_vencer`, `fecha_pago`, `fecha_ejecucion`, `updated_at`, `created_at`) VALUES
(1, 'Plagas', 2, 'servicio', 9, 9, NULL, NULL, 'F001', 634.80, 4655.20, '2026-05-06', 3, '2026-05-09', 4, '2026-05-30', '2026-05-05', '2026-05-06 13:55:16', '2026-05-06 13:55:16'),
(2, 'Plagas', 2, 'servicio', 6, 6, NULL, NULL, 'F003', 0.00, 470.00, '2026-05-11', 3, '2026-05-14', 9, '2026-05-11', '2026-05-21', '2026-05-06 13:55:16', '2026-05-06 13:55:16'),
(3, 'Plagas', 2, 'servicio', 8, 8, NULL, NULL, NULL, 88.20, 646.80, NULL, NULL, NULL, NULL, '2026-05-30', '2026-04-20', '2026-05-06 13:55:16', '2026-05-06 13:55:16'),
(4, NULL, 1, 'servicio', 10, 10, NULL, NULL, NULL, 0.00, 360.00, NULL, NULL, NULL, NULL, NULL, '2026-04-30', '2026-05-06 13:55:16', '2026-05-06 13:55:16'),
(5, 'Plagas', 1, 'servicio', 13, 13, NULL, NULL, NULL, 0.00, 350.00, NULL, NULL, NULL, NULL, NULL, '2026-05-02', '2026-05-07 00:48:22', '2026-05-06 13:55:16'),
(6, 'Plagas', 2, 'servicio', 14, 14, NULL, NULL, 'F002', 106.80, 783.20, '2026-05-06', NULL, '2026-05-06', 1, '2026-05-30', '2026-05-05', '2026-05-06 13:55:16', '2026-05-06 13:55:16'),
(17, NULL, 2, 'servicio', NULL, 16, NULL, NULL, NULL, 0.00, 450.00, NULL, NULL, NULL, NULL, NULL, '2026-05-07', NULL, NULL),
(18, NULL, 1, 'servicio', 17, 17, NULL, NULL, NULL, 0.00, 280.00, NULL, NULL, NULL, NULL, NULL, '2026-05-16', NULL, NULL),
(19, NULL, 2, 'producto', 4, NULL, 4, NULL, NULL, 0.00, 120.00, NULL, NULL, NULL, NULL, NULL, '2026-05-08', '2026-05-08 07:21:56', '2026-05-08 07:21:56'),
(20, NULL, 1, 'auditoria', 4, NULL, NULL, NULL, NULL, 0.00, 450.00, NULL, NULL, NULL, NULL, NULL, '2026-05-08', '2026-05-08 15:14:21', '2026-05-08 15:14:21'),
(21, NULL, 2, 'servicio', 18, 18, NULL, NULL, NULL, 205.32, 1505.68, NULL, NULL, NULL, NULL, NULL, '2026-05-01', '2026-05-09 23:02:25', '2026-05-09 23:02:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rrhh_asistencia`
--

CREATE TABLE `rrhh_asistencia` (
  `id` int(11) NOT NULL,
  `id_personal` int(11) DEFAULT NULL,
  `id_tecnico` int(11) DEFAULT NULL,
  `id_programacion` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `tipo_registro` enum('Oficina','Campo') NOT NULL,
  `hora_entrada` time NOT NULL,
  `hora_salida` time DEFAULT NULL,
  `hora_inicio_almuerzo` time DEFAULT NULL,
  `hora_fin_almuerzo` time DEFAULT NULL,
  `exceso_almuerzo_minutos` int(11) NOT NULL DEFAULT 0,
  `hora_esperada_entrada` time DEFAULT NULL,
  `hora_esperada_salida` time DEFAULT NULL,
  `gps_entrada` varchar(100) DEFAULT NULL,
  `gps_salida` varchar(100) DEFAULT NULL,
  `distancia_cliente_metros` decimal(10,2) DEFAULT NULL,
  `dentro_rango_50m` tinyint(1) DEFAULT 0,
  `foto_entrada` varchar(255) DEFAULT NULL,
  `foto_salida` varchar(255) DEFAULT NULL,
  `fotos_servicio` text DEFAULT NULL,
  `horas_trabajadas` decimal(5,2) DEFAULT NULL,
  `tardanza_minutos` int(11) DEFAULT 0,
  `tiempo_extra_minutos` int(11) NOT NULL DEFAULT 0,
  `horas_extra_asignadas` tinyint(1) NOT NULL DEFAULT 0,
  `hora_inicio_extra` time DEFAULT NULL,
  `estado` enum('Puntual','Tardanza','Falta','Fuera de Rango','Incompleto','Justificada') DEFAULT 'Incompleto',
  `observaciones` text DEFAULT NULL,
  `justificacion` varchar(255) DEFAULT NULL,
  `registrado_via` enum('AppSheet','Web','Manual') DEFAULT 'AppSheet',
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Registro unificado de asistencia para administrativos y técnicos';

--
-- Volcado de datos para la tabla `rrhh_asistencia`
--

INSERT INTO `rrhh_asistencia` (`id`, `id_personal`, `id_tecnico`, `id_programacion`, `fecha`, `tipo_registro`, `hora_entrada`, `hora_salida`, `hora_inicio_almuerzo`, `hora_fin_almuerzo`, `exceso_almuerzo_minutos`, `hora_esperada_entrada`, `hora_esperada_salida`, `gps_entrada`, `gps_salida`, `distancia_cliente_metros`, `dentro_rango_50m`, `foto_entrada`, `foto_salida`, `fotos_servicio`, `horas_trabajadas`, `tardanza_minutos`, `tiempo_extra_minutos`, `horas_extra_asignadas`, `hora_inicio_extra`, `estado`, `observaciones`, `justificacion`, `registrado_via`, `fecha_creacion`, `modificado_por`, `fecha_modificacion`) VALUES
(3, 14, NULL, NULL, '2026-04-15', 'Oficina', '11:30:19', '17:32:36', '14:43:30', '16:09:59', 41, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.36, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-15 11:30:19', NULL, '2026-04-15 17:32:36'),
(4, 10, NULL, NULL, '2026-04-15', 'Oficina', '11:32:07', '19:07:07', '12:24:57', '13:12:44', 2, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.55, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-15 11:32:07', NULL, '2026-04-15 19:07:07'),
(5, 15, NULL, NULL, '2026-04-15', 'Oficina', '11:35:29', '14:25:38', NULL, NULL, 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 2.84, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-15 11:35:29', NULL, '2026-04-15 14:25:38'),
(6, 17, NULL, NULL, '2026-04-15', 'Oficina', '11:36:54', '17:30:06', '13:29:48', '14:08:37', 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.89, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-15 11:36:54', NULL, '2026-04-15 17:30:06'),
(7, 11, NULL, NULL, '2026-04-15', 'Oficina', '11:37:41', '19:05:10', NULL, NULL, 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.46, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-15 11:37:41', NULL, '2026-04-15 19:05:10'),
(8, 18, NULL, NULL, '2026-04-15', 'Oficina', '11:39:17', '16:15:39', '13:29:11', '14:06:18', 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.61, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-15 11:39:17', NULL, '2026-04-15 16:15:39'),
(9, 19, NULL, NULL, '2026-04-15', 'Oficina', '11:39:49', '18:10:07', '12:48:30', '13:30:46', 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.51, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-15 11:39:49', NULL, '2026-04-15 18:10:07'),
(10, 20, NULL, NULL, '2026-04-15', 'Oficina', '11:42:07', NULL, NULL, NULL, 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, -12, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-15 11:42:07', NULL, NULL),
(11, 17, NULL, NULL, '2026-04-16', 'Oficina', '06:05:11', NULL, NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-16 06:05:11', NULL, NULL),
(12, 14, NULL, NULL, '2026-04-16', 'Oficina', '08:02:55', '16:34:33', '14:47:57', '15:21:56', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.53, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-16 08:02:55', NULL, '2026-04-16 16:34:33'),
(13, 10, NULL, NULL, '2026-04-16', 'Oficina', '08:04:40', '17:46:08', '12:28:05', '13:21:35', 8, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.56, 0, 0, 0, NULL, 'Puntual', 'Compesar horas de falta', NULL, 'Web', '2026-04-16 08:04:40', 10, '2026-04-16 17:46:08'),
(14, 18, NULL, NULL, '2026-04-16', 'Oficina', '08:13:36', '16:03:25', '13:10:43', '13:47:53', 0, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.83, -13, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-16 08:13:36', NULL, '2026-04-16 16:03:25'),
(15, 19, NULL, NULL, '2026-04-16', 'Oficina', '08:17:10', '17:49:22', '13:51:11', '14:30:15', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.54, -17, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-16 08:17:10', NULL, '2026-04-16 17:49:22'),
(16, 11, NULL, NULL, '2026-04-16', 'Oficina', '08:17:18', '18:23:21', '13:10:11', '13:59:15', 4, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 10.03, -17, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-16 08:17:18', NULL, '2026-04-16 18:23:21'),
(17, 20, NULL, NULL, '2026-04-16', 'Oficina', '08:26:48', NULL, NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, -26, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-16 08:26:48', NULL, NULL),
(18, 13, NULL, NULL, '2026-04-16', 'Oficina', '08:43:43', '17:40:20', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.94, -43, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-16 08:43:43', NULL, '2026-04-16 17:40:20'),
(19, 15, NULL, NULL, '2026-04-16', 'Oficina', '08:51:54', '14:44:14', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.87, -51, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-16 08:51:54', NULL, '2026-04-16 14:44:14'),
(20, 17, NULL, NULL, '2026-04-17', 'Oficina', '06:02:26', NULL, NULL, NULL, 0, '06:00:00', '15:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-17 06:02:26', NULL, NULL),
(21, 10, NULL, NULL, '2026-04-17', 'Oficina', '08:04:32', '17:04:42', '13:06:18', '13:52:12', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.00, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-17 08:04:32', NULL, '2026-04-17 17:04:42'),
(22, 18, NULL, NULL, '2026-04-17', 'Oficina', '08:08:02', '16:08:47', '13:15:23', '13:54:10', 0, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.01, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-17 08:08:02', NULL, '2026-04-17 16:08:47'),
(23, 14, NULL, NULL, '2026-04-17', 'Oficina', '08:10:57', '17:31:26', '14:35:02', '15:19:30', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.34, -10, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-17 08:10:57', NULL, '2026-04-17 17:31:26'),
(24, 11, NULL, NULL, '2026-04-17', 'Oficina', '08:17:25', '18:06:34', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.82, -17, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-17 08:17:25', NULL, '2026-04-17 18:06:34'),
(25, 13, NULL, NULL, '2026-04-17', 'Oficina', '08:17:46', '17:30:16', '12:59:48', '13:19:21', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.21, -17, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-17 08:17:46', NULL, '2026-04-17 17:30:16'),
(26, 15, NULL, NULL, '2026-04-17', 'Oficina', '08:23:22', '15:13:32', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.84, -23, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-17 08:23:22', NULL, '2026-04-17 15:13:32'),
(27, 20, NULL, NULL, '2026-04-17', 'Oficina', '08:24:50', '14:24:50', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.00, -24, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-17 08:24:50', NULL, '2026-04-17 14:24:50'),
(28, 19, NULL, NULL, '2026-04-17', 'Oficina', '08:35:03', '17:50:11', '12:41:41', '13:24:46', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.25, -35, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-17 08:35:03', NULL, '2026-04-17 17:50:11'),
(29, 17, NULL, NULL, '2026-04-18', 'Oficina', '06:02:34', '10:15:47', NULL, NULL, 0, '06:00:00', '15:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.22, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-18 06:02:34', NULL, '2026-04-18 10:15:47'),
(30, 10, NULL, NULL, '2026-04-18', 'Oficina', '07:57:30', '12:27:00', NULL, NULL, 0, '08:00:00', '12:15:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.49, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-18 07:57:30', NULL, '2026-04-18 12:27:00'),
(31, 14, NULL, NULL, '2026-04-18', 'Oficina', '07:58:15', '12:34:37', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.61, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-18 07:58:15', NULL, '2026-04-18 12:34:37'),
(32, 18, NULL, NULL, '2026-04-18', 'Oficina', '08:00:27', '12:48:41', NULL, NULL, 0, '08:00:00', '12:15:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.80, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-18 08:00:27', NULL, '2026-04-18 12:48:41'),
(33, 19, NULL, NULL, '2026-04-18', 'Oficina', '08:15:43', '13:02:38', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.78, -15, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-18 08:15:43', NULL, '2026-04-18 13:02:38'),
(34, 13, NULL, NULL, '2026-04-18', 'Oficina', '08:27:18', '13:03:10', NULL, NULL, 0, '08:00:00', '12:15:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.60, -27, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-18 08:27:18', NULL, '2026-04-18 13:03:10'),
(35, 11, NULL, NULL, '2026-04-18', 'Oficina', '08:30:42', '12:58:30', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.46, -30, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-18 08:30:42', NULL, '2026-04-18 12:58:30'),
(36, 14, NULL, NULL, '2026-04-20', 'Oficina', '08:08:55', '17:30:02', '14:57:06', '15:41:08', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.35, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-20 08:08:55', NULL, '2026-04-20 17:30:02'),
(37, 13, NULL, NULL, '2026-04-20', 'Oficina', '08:09:12', '18:00:31', '14:16:21', '15:28:39', 27, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.41, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-20 08:09:12', NULL, '2026-04-20 18:00:31'),
(38, 19, NULL, NULL, '2026-04-20', 'Oficina', '08:10:49', '14:59:16', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.81, -10, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-20 08:10:49', NULL, '2026-04-20 14:59:16'),
(39, 15, NULL, NULL, '2026-04-20', 'Oficina', '08:12:58', '14:43:09', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.50, -12, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-20 08:12:58', NULL, '2026-04-20 14:43:09'),
(40, 18, NULL, NULL, '2026-04-20', 'Oficina', '08:15:37', '16:00:52', '13:40:23', '14:09:46', 0, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.75, -15, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-20 08:15:37', NULL, '2026-04-20 16:00:52'),
(41, 11, NULL, NULL, '2026-04-20', 'Oficina', '08:24:15', '18:12:26', '13:42:52', '14:29:22', 1, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.78, -24, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-20 08:24:15', NULL, '2026-04-20 18:12:26'),
(42, 20, NULL, NULL, '2026-04-20', 'Oficina', '08:31:04', NULL, NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, -31, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-20 08:31:04', NULL, NULL),
(43, 10, NULL, NULL, '2026-04-20', 'Oficina', '09:24:26', '19:24:09', '12:21:57', '13:14:51', 7, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.88, -84, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-20 09:24:26', NULL, '2026-04-20 19:24:09'),
(44, 14, NULL, NULL, '2026-04-21', 'Oficina', '07:53:35', '17:12:30', '14:40:17', '15:23:32', 0, '07:40:00', '17:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.32, -13, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-21 07:53:35', NULL, '2026-04-21 17:12:30'),
(45, 15, NULL, NULL, '2026-04-21', 'Oficina', '07:54:11', '14:29:04', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.58, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-21 07:54:11', NULL, '2026-04-21 14:29:04'),
(46, 13, NULL, NULL, '2026-04-21', 'Oficina', '07:55:14', '18:03:36', '13:44:31', '14:50:05', 20, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.81, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-21 07:55:14', NULL, '2026-04-21 18:03:36'),
(47, 10, NULL, NULL, '2026-04-21', 'Oficina', '08:02:51', '18:42:01', '12:39:40', '13:30:32', 5, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 10.57, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-21 08:02:51', NULL, '2026-04-21 18:42:01'),
(48, 18, NULL, NULL, '2026-04-21', 'Oficina', '08:15:44', '14:06:04', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.84, -15, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-21 08:15:44', NULL, '2026-04-21 14:06:04'),
(49, 20, NULL, NULL, '2026-04-21', 'Oficina', '08:30:58', NULL, NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, -30, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-21 08:30:58', NULL, NULL),
(50, 11, NULL, NULL, '2026-04-21', 'Oficina', '08:42:54', '18:19:19', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.61, -42, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-21 08:42:54', NULL, '2026-04-21 18:19:19'),
(51, 19, NULL, NULL, '2026-04-21', 'Oficina', '09:12:15', '18:29:17', '13:51:26', '14:54:31', 18, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.98, -72, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-21 09:12:15', NULL, '2026-04-21 18:29:17'),
(52, 13, NULL, NULL, '2026-04-22', 'Oficina', '08:00:02', '19:22:41', NULL, NULL, 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 11.38, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-22 08:00:02', NULL, '2026-04-22 19:22:41'),
(53, 14, NULL, NULL, '2026-04-22', 'Oficina', '08:02:40', '17:35:44', '14:35:55', '15:20:17', 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.55, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-22 08:02:40', NULL, '2026-04-22 17:35:44'),
(54, 18, NULL, NULL, '2026-04-22', 'Oficina', '08:02:50', '16:06:17', '13:10:32', '13:45:18', 0, '11:30:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.06, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-22 08:02:50', NULL, '2026-04-22 16:06:17'),
(55, 15, NULL, NULL, '2026-04-22', 'Oficina', '08:08:04', '14:24:10', NULL, NULL, 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.27, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-22 08:08:04', NULL, '2026-04-22 14:24:10'),
(56, 11, NULL, NULL, '2026-04-22', 'Oficina', '08:13:44', '18:03:40', NULL, NULL, 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.83, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-22 08:13:44', NULL, '2026-04-22 18:03:40'),
(57, 20, NULL, NULL, '2026-04-22', 'Oficina', '08:34:51', '14:32:39', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.96, -34, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-22 08:34:51', NULL, '2026-04-22 14:32:39'),
(58, 19, NULL, NULL, '2026-04-22', 'Oficina', '08:43:21', '18:31:38', '14:08:10', '14:52:18', 0, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.80, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-22 08:43:21', NULL, '2026-04-22 18:31:38'),
(59, 10, NULL, NULL, '2026-04-22', 'Oficina', '11:04:07', '18:26:34', '13:13:29', '14:31:41', 33, '11:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.82, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-22 11:04:07', NULL, '2026-04-22 18:26:34'),
(60, 14, NULL, NULL, '2026-04-23', 'Oficina', '07:39:44', '17:02:00', '14:43:43', '15:29:36', 0, '07:40:00', '17:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.37, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-23 07:39:44', NULL, '2026-04-23 17:02:00'),
(61, 13, NULL, NULL, '2026-04-23', 'Oficina', '08:00:41', '17:31:01', '17:30:49', '17:30:55', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.51, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-23 08:00:41', NULL, '2026-04-23 17:31:01'),
(62, 15, NULL, NULL, '2026-04-23', 'Oficina', '08:10:40', '14:31:15', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.34, -10, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-23 08:10:40', NULL, '2026-04-23 14:31:15'),
(63, 10, NULL, NULL, '2026-04-23', 'Oficina', '08:22:31', '20:18:34', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 11.93, -22, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-23 08:22:31', NULL, '2026-04-23 20:18:34'),
(64, 18, NULL, NULL, '2026-04-23', 'Oficina', '08:34:56', '14:03:43', '13:17:55', '13:56:32', 0, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.48, -34, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-23 08:34:56', NULL, '2026-04-23 14:03:43'),
(65, 11, NULL, NULL, '2026-04-23', 'Oficina', '08:53:42', '18:04:56', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.19, -53, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-23 08:53:42', NULL, '2026-04-23 18:04:56'),
(66, 19, NULL, NULL, '2026-04-23', 'Oficina', '09:08:25', '17:59:47', '13:40:42', '14:34:14', 8, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.73, -68, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-23 09:08:25', NULL, '2026-04-23 17:59:47'),
(67, 17, NULL, NULL, '2026-04-24', 'Oficina', '08:05:34', '17:52:59', NULL, NULL, 0, '06:00:00', '15:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.79, -125, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-24 08:05:34', NULL, '2026-04-24 17:52:59'),
(68, 18, NULL, NULL, '2026-04-24', 'Oficina', '08:06:12', '16:10:30', NULL, NULL, 0, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.07, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-24 08:06:12', NULL, '2026-04-24 16:10:30'),
(69, 11, NULL, NULL, '2026-04-24', 'Oficina', '08:15:11', '20:25:22', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 12.17, -15, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-24 08:15:11', NULL, '2026-04-24 20:25:22'),
(70, 14, NULL, NULL, '2026-04-24', 'Oficina', '08:16:14', '17:44:08', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.47, -16, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-24 08:16:14', NULL, '2026-04-24 17:44:08'),
(71, 15, NULL, NULL, '2026-04-24', 'Oficina', '08:22:54', '16:17:32', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.91, -22, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-24 08:22:54', NULL, '2026-04-24 16:17:32'),
(72, 19, NULL, NULL, '2026-04-24', 'Oficina', '08:33:12', '18:12:21', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.65, -33, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-24 08:33:12', NULL, '2026-04-24 18:12:21'),
(73, 20, NULL, NULL, '2026-04-24', 'Oficina', '08:33:26', NULL, NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, -33, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-24 08:33:26', NULL, NULL),
(74, 13, NULL, NULL, '2026-04-24', 'Oficina', '08:37:15', '18:51:06', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 10.23, -37, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-24 08:37:15', NULL, '2026-04-24 18:51:06'),
(75, 10, NULL, NULL, '2026-04-24', 'Oficina', '13:10:35', '20:10:38', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.00, -310, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-24 13:10:35', NULL, '2026-04-24 20:10:38'),
(76, 18, NULL, NULL, '2026-04-25', 'Oficina', '07:00:08', '14:19:11', NULL, NULL, 0, '07:00:00', '13:15:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.32, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-25 07:00:08', NULL, '2026-04-25 14:19:11'),
(77, 17, NULL, NULL, '2026-04-25', 'Oficina', '08:00:59', NULL, NULL, NULL, 0, '06:00:00', '15:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, -120, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-25 08:00:59', NULL, NULL),
(78, 14, NULL, NULL, '2026-04-25', 'Oficina', '08:11:59', '12:30:39', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.31, -11, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-25 08:11:59', NULL, '2026-04-25 12:30:39'),
(79, 11, NULL, NULL, '2026-04-25', 'Oficina', '08:22:39', '13:11:40', '13:11:33', '13:11:38', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.82, -22, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-25 08:22:39', NULL, '2026-04-25 13:11:40'),
(80, 10, NULL, NULL, '2026-04-25', 'Oficina', '08:26:18', '12:24:10', NULL, NULL, 0, '08:00:00', '12:15:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 3.96, -26, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-25 08:26:18', NULL, '2026-04-25 12:24:10'),
(81, 19, NULL, NULL, '2026-04-25', 'Oficina', '08:34:57', '13:00:06', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.42, -34, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-25 08:34:57', NULL, '2026-04-25 13:00:06'),
(82, 17, NULL, NULL, '2026-04-27', 'Oficina', '05:56:12', NULL, NULL, NULL, 0, '06:00:00', '15:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-27 05:56:12', NULL, NULL),
(83, 13, NULL, NULL, '2026-04-27', 'Oficina', '07:04:01', '17:52:00', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 10.80, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-27 07:04:01', NULL, '2026-04-27 17:52:00'),
(84, 10, NULL, NULL, '2026-04-27', 'Oficina', '07:29:07', '18:45:50', NULL, NULL, 0, '07:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 11.28, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-27 07:29:07', NULL, '2026-04-27 18:45:50'),
(85, 14, NULL, NULL, '2026-04-27', 'Oficina', '08:05:35', '17:31:17', '14:38:04', '15:22:44', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.43, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-27 08:05:35', NULL, '2026-04-27 17:31:17'),
(86, 15, NULL, NULL, '2026-04-27', 'Oficina', '08:16:50', '13:41:24', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.41, -16, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-27 08:16:50', NULL, '2026-04-27 13:41:24'),
(87, 18, NULL, NULL, '2026-04-27', 'Oficina', '08:29:17', '16:02:07', '14:03:05', '14:39:04', 0, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.55, -29, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-27 08:29:17', NULL, '2026-04-27 16:02:07'),
(88, 19, NULL, NULL, '2026-04-27', 'Oficina', '08:34:54', '20:15:31', '13:45:47', '13:46:14', 0, '08:30:00', '18:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 11.68, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-27 08:34:54', NULL, '2026-04-27 20:15:31'),
(89, 17, NULL, NULL, '2026-04-28', 'Oficina', '06:07:39', NULL, NULL, NULL, 0, '06:00:00', '15:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-28 06:07:39', NULL, NULL),
(90, 14, NULL, NULL, '2026-04-28', 'Oficina', '07:45:52', '17:00:10', '14:41:47', '15:23:09', 0, '07:40:00', '17:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.24, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-28 07:45:52', NULL, '2026-04-28 17:00:10'),
(91, 18, NULL, NULL, '2026-04-28', 'Oficina', '08:19:22', NULL, '13:14:25', '13:54:27', 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, -19, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-28 08:19:22', NULL, '2026-04-28 13:54:27'),
(92, 15, NULL, NULL, '2026-04-28', 'Oficina', '08:22:45', '14:11:32', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.81, -22, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-28 08:22:45', NULL, '2026-04-28 14:11:32'),
(93, 13, NULL, NULL, '2026-04-28', 'Oficina', '08:29:18', NULL, NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, -29, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-28 08:29:18', NULL, NULL),
(94, 19, NULL, NULL, '2026-04-28', 'Oficina', '08:58:22', '17:43:17', '12:54:29', '13:37:48', 0, '08:30:00', '18:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.75, -28, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-28 08:58:22', NULL, '2026-04-28 17:43:17'),
(95, 10, NULL, NULL, '2026-04-28', 'Oficina', '10:42:39', '17:41:12', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.98, -162, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-28 10:42:39', NULL, '2026-04-28 17:41:12'),
(96, 17, NULL, NULL, '2026-04-29', 'Oficina', '06:30:39', '15:31:14', '12:34:33', '13:14:49', 0, '06:00:00', '15:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.01, -30, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-29 06:30:39', NULL, '2026-04-29 15:31:14'),
(97, 14, NULL, NULL, '2026-04-29', 'Oficina', '08:05:56', '17:44:44', '14:33:53', '15:22:53', 4, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.58, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-29 08:05:56', NULL, '2026-04-29 17:44:44'),
(98, 15, NULL, NULL, '2026-04-29', 'Oficina', '08:16:00', '14:19:17', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.05, -16, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-29 08:16:00', NULL, '2026-04-29 14:19:17'),
(99, 18, NULL, NULL, '2026-04-29', 'Oficina', '08:19:50', '16:20:04', '13:28:16', '14:09:54', 0, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.00, -19, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-29 08:19:50', NULL, '2026-04-29 16:20:04'),
(100, 19, NULL, NULL, '2026-04-29', 'Oficina', '08:30:54', '18:45:04', '12:20:24', '13:26:07', 20, '08:30:00', '18:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.91, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-29 08:30:54', NULL, '2026-04-29 18:45:04'),
(101, 10, NULL, NULL, '2026-04-29', 'Oficina', '08:34:04', '18:39:35', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 10.09, -34, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-29 08:34:04', NULL, '2026-04-29 18:39:35'),
(102, 17, NULL, NULL, '2026-04-30', 'Oficina', '06:00:35', NULL, NULL, NULL, 0, '06:00:00', '15:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-30 06:00:35', NULL, NULL),
(103, 14, NULL, NULL, '2026-04-30', 'Oficina', '07:44:09', '17:01:33', '14:21:17', '15:07:14', 0, '07:40:00', '17:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.29, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-30 07:44:09', NULL, '2026-04-30 17:01:33'),
(104, 15, NULL, NULL, '2026-04-30', 'Oficina', '08:06:07', '14:09:08', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.05, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-30 08:06:07', NULL, '2026-04-30 14:09:08'),
(105, 18, NULL, NULL, '2026-04-30', 'Oficina', '08:19:53', '16:01:30', '13:10:31', '13:50:42', 0, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.69, -19, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-30 08:19:53', NULL, '2026-04-30 16:01:30'),
(106, 19, NULL, NULL, '2026-04-30', 'Oficina', '09:25:19', '18:30:45', '13:01:06', '13:56:30', 10, '08:30:00', '18:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.92, -55, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-30 09:25:19', NULL, '2026-04-30 18:30:45'),
(107, 10, NULL, NULL, '2026-04-30', 'Oficina', '12:09:46', '23:18:14', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 11.14, -249, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-04-30 12:09:46', NULL, '2026-04-30 23:18:14'),
(108, 18, NULL, NULL, '2026-05-01', 'Oficina', '08:07:14', '13:13:33', NULL, NULL, 0, '08:00:00', '13:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.11, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-05-01 08:07:14', NULL, '2026-05-01 13:13:33'),
(109, 14, NULL, NULL, '2026-05-02', 'Oficina', '08:06:16', '12:33:54', NULL, NULL, 0, '08:00:00', '12:15:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.46, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-05-02 08:06:16', NULL, '2026-05-02 12:33:54'),
(110, 19, NULL, NULL, '2026-05-02', 'Oficina', '08:06:47', '12:42:02', NULL, NULL, 0, '08:30:00', '11:45:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 4.59, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-05-02 08:06:47', NULL, '2026-05-02 12:42:02'),
(111, 10, NULL, NULL, '2026-05-02', 'Oficina', '08:39:07', '16:18:48', NULL, NULL, 0, '08:00:00', '12:15:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.66, -39, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-02 08:39:07', NULL, '2026-05-02 16:18:48'),
(112, 11, NULL, NULL, '2026-05-04', 'Oficina', '08:14:39', '17:46:37', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.53, -14, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-04 08:14:39', NULL, '2026-05-04 17:46:37'),
(113, 14, NULL, NULL, '2026-05-04', 'Oficina', '08:15:38', '17:32:42', '14:29:54', '15:15:29', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.28, -15, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-04 08:15:38', NULL, '2026-05-04 17:32:42'),
(114, 18, NULL, NULL, '2026-05-04', 'Oficina', '08:16:12', '16:06:17', '13:42:27', '14:25:03', 0, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.83, -16, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-04 08:16:12', NULL, '2026-05-04 16:06:17'),
(115, 15, NULL, NULL, '2026-05-04', 'Oficina', '08:21:12', '14:09:02', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.80, -21, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-04 08:21:12', NULL, '2026-05-04 14:09:02'),
(116, 10, NULL, NULL, '2026-05-04', 'Oficina', '08:34:25', NULL, '12:10:12', '14:11:34', 76, '07:30:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, -64, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-04 08:34:25', NULL, '2026-05-04 14:11:34'),
(117, 19, NULL, NULL, '2026-05-04', 'Oficina', '08:55:07', '17:47:34', '13:24:01', '14:10:46', 1, '08:30:00', '18:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.85, -25, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-04 08:55:07', NULL, '2026-05-04 17:47:34'),
(118, 14, NULL, NULL, '2026-05-05', 'Oficina', '08:01:27', '17:04:02', '14:31:37', '15:05:59', 0, '07:40:00', '17:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.04, -21, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-05 08:01:27', NULL, '2026-05-05 17:04:02'),
(119, 10, NULL, NULL, '2026-05-05', 'Oficina', '08:10:42', NULL, NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, -10, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-05 08:10:42', NULL, NULL),
(120, 15, NULL, NULL, '2026-05-05', 'Oficina', '08:16:12', '14:23:54', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.13, -16, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-05 08:16:12', NULL, '2026-05-05 14:23:54'),
(121, 18, NULL, NULL, '2026-05-05', 'Oficina', '08:30:14', '16:39:29', '13:29:37', '14:12:53', 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.15, -30, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-05 08:30:14', NULL, '2026-05-05 16:39:29'),
(122, 19, NULL, NULL, '2026-05-05', 'Oficina', '08:50:22', '17:56:53', '12:20:35', '13:04:52', 0, '08:30:00', '18:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.11, -20, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-05 08:50:22', NULL, '2026-05-05 17:56:53'),
(123, 14, NULL, NULL, '2026-05-06', 'Oficina', '08:04:27', '17:55:58', '15:32:39', '16:17:25', 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.86, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-05-06 08:04:27', NULL, '2026-05-06 17:55:58'),
(124, 11, NULL, NULL, '2026-05-06', 'Oficina', '08:17:06', '18:23:16', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 10.10, -17, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-06 08:17:06', NULL, '2026-05-06 18:23:16'),
(125, 15, NULL, NULL, '2026-05-06', 'Oficina', '08:21:06', '15:47:43', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.44, -21, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-06 08:21:06', NULL, '2026-05-06 15:47:43'),
(126, 18, NULL, NULL, '2026-05-06', 'Oficina', '08:22:50', '17:57:34', '13:49:37', '14:27:32', 0, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.58, -22, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-06 08:22:50', NULL, '2026-05-06 17:57:34'),
(127, 10, NULL, NULL, '2026-05-06', 'Oficina', '08:39:59', '20:43:35', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 12.06, -39, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-06 08:39:59', NULL, '2026-05-06 20:43:35'),
(128, 19, NULL, NULL, '2026-05-06', 'Oficina', '10:23:04', '18:40:08', '13:37:50', '14:22:56', 0, '08:30:00', '18:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 8.28, -113, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-06 10:23:04', NULL, '2026-05-06 18:40:08'),
(129, 14, NULL, NULL, '2026-05-07', 'Oficina', '07:48:01', '17:03:20', '14:31:30', '15:16:18', 0, '07:40:00', '17:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.26, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-05-07 07:48:01', NULL, '2026-05-07 17:03:20'),
(130, 11, NULL, NULL, '2026-05-07', 'Oficina', '08:16:02', '17:56:46', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.68, -16, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-07 08:16:02', NULL, '2026-05-07 17:56:46'),
(131, 10, NULL, NULL, '2026-05-07', 'Oficina', '08:27:54', '20:44:36', NULL, NULL, 0, '08:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 12.28, -27, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-07 08:27:54', NULL, '2026-05-07 20:44:36'),
(132, 15, NULL, NULL, '2026-05-07', 'Oficina', '08:31:45', '14:28:05', NULL, NULL, 0, '08:00:00', '14:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 5.94, -31, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-07 08:31:45', NULL, '2026-05-07 14:28:05'),
(133, 19, NULL, NULL, '2026-05-07', 'Oficina', '08:47:56', '18:20:44', '12:27:47', '13:15:20', 2, '08:30:00', '18:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 9.52, -17, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-07 08:47:56', NULL, '2026-05-07 18:20:44'),
(134, 18, NULL, NULL, '2026-05-07', 'Oficina', '08:48:00', '16:00:08', '13:33:30', '14:23:38', 5, '08:00:00', '16:00:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 7.12, -48, 0, 0, NULL, 'Tardanza', NULL, NULL, 'Web', '2026-05-07 08:48:00', NULL, '2026-05-07 16:00:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rrhh_horarios`
--

CREATE TABLE `rrhh_horarios` (
  `id` int(11) NOT NULL,
  `id_personal` int(11) DEFAULT NULL,
  `id_tecnico` int(11) DEFAULT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  `hora_entrada_esperada` time NOT NULL,
  `hora_salida_esperada` time NOT NULL,
  `tolerancia_minutos` int(11) DEFAULT 10,
  `activo` tinyint(1) DEFAULT 1,
  `es_descanso` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Si es true, es día de descanso (no se marca asistencia)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Horarios laborales esperados por empleado';

--
-- Volcado de datos para la tabla `rrhh_horarios`
--

INSERT INTO `rrhh_horarios` (`id`, `id_personal`, `id_tecnico`, `dia_semana`, `hora_entrada_esperada`, `hora_salida_esperada`, `tolerancia_minutos`, `activo`, `es_descanso`) VALUES
(99, 16, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(100, 16, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(101, 16, NULL, 'Miércoles', '11:30:00', '17:30:00', 10, 1, 0),
(102, 16, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(103, 16, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(104, 16, NULL, 'Sábado', '08:00:00', '17:30:00', 10, 1, 0),
(105, 16, NULL, 'Domingo', '00:00:00', '00:00:00', 10, 1, 1),
(246, 12, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(247, 12, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(248, 12, NULL, 'Miércoles', '08:30:00', '17:30:00', 10, 1, 0),
(249, 12, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(250, 12, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(251, 12, NULL, 'Sábado', '08:00:00', '17:30:00', 10, 1, 0),
(252, 12, NULL, 'Domingo', '00:00:00', '00:00:00', 10, 1, 1),
(295, 13, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(296, 13, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(297, 13, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(298, 13, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(299, 13, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(300, 13, NULL, 'Sábado', '08:00:00', '12:15:00', 10, 1, 0),
(301, 13, NULL, 'Domingo', '00:00:00', '00:00:00', 10, 1, 1),
(302, 14, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(303, 14, NULL, 'Martes', '07:40:00', '17:00:00', 10, 1, 0),
(304, 14, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(305, 14, NULL, 'Jueves', '07:40:00', '17:00:00', 10, 1, 0),
(306, 14, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(307, 14, NULL, 'Sábado', '08:00:00', '12:15:00', 10, 1, 0),
(308, 14, NULL, 'Domingo', '00:00:00', '00:00:00', 10, 1, 1),
(316, 17, NULL, 'Lunes', '06:00:00', '15:30:00', 10, 1, 0),
(317, 17, NULL, 'Martes', '06:00:00', '15:30:00', 10, 1, 0),
(318, 17, NULL, 'Miércoles', '06:00:00', '15:30:00', 10, 1, 0),
(319, 17, NULL, 'Jueves', '06:00:00', '15:30:00', 10, 1, 0),
(320, 17, NULL, 'Viernes', '06:00:00', '15:30:00', 10, 1, 0),
(321, 17, NULL, 'Sábado', '06:00:00', '10:15:00', 10, 1, 0),
(322, 17, NULL, 'Domingo', '00:00:00', '00:00:00', 10, 1, 1),
(337, 20, NULL, 'Lunes', '08:00:00', '14:00:00', 10, 1, 0),
(338, 20, NULL, 'Martes', '08:00:00', '14:00:00', 10, 1, 0),
(339, 20, NULL, 'Miércoles', '08:00:00', '14:00:00', 10, 1, 0),
(340, 20, NULL, 'Jueves', '08:00:00', '14:00:00', 10, 1, 0),
(341, 20, NULL, 'Viernes', '08:00:00', '14:00:00', 10, 1, 0),
(342, 20, NULL, 'Sábado', '00:00:00', '00:00:00', 10, 1, 1),
(343, 20, NULL, 'Domingo', '00:00:00', '00:00:00', 10, 1, 1),
(372, 18, NULL, 'Lunes', '08:00:00', '16:00:00', 10, 1, 0),
(373, 18, NULL, 'Martes', '08:00:00', '16:30:00', 10, 1, 0),
(374, 18, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(375, 18, NULL, 'Jueves', '08:00:00', '16:00:00', 10, 1, 0),
(376, 18, NULL, 'Viernes', '08:00:00', '15:00:00', 10, 1, 0),
(377, 18, NULL, 'Sábado', '00:00:00', '00:00:00', 10, 1, 1),
(378, 18, NULL, 'Domingo', '00:00:00', '00:00:00', 10, 1, 1),
(379, 10, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(380, 10, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(381, 10, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(382, 10, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(383, 10, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(384, 10, NULL, 'Sábado', '08:00:00', '12:15:00', 10, 1, 0),
(385, 10, NULL, 'Domingo', '00:00:00', '00:00:00', 10, 1, 1),
(386, 11, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(387, 11, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(388, 11, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(389, 11, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(390, 11, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(391, 11, NULL, 'Sábado', '08:00:00', '12:15:00', 10, 1, 0),
(392, 11, NULL, 'Domingo', '00:00:00', '00:00:00', 10, 1, 1),
(393, 15, NULL, 'Lunes', '08:00:00', '14:00:00', 10, 1, 0),
(394, 15, NULL, 'Martes', '08:00:00', '14:00:00', 10, 1, 0),
(395, 15, NULL, 'Miércoles', '08:00:00', '14:00:00', 10, 1, 0),
(396, 15, NULL, 'Jueves', '08:00:00', '14:00:00', 10, 1, 0),
(397, 15, NULL, 'Viernes', '00:00:00', '00:00:00', 10, 1, 1),
(398, 15, NULL, 'Sábado', '08:00:00', '14:00:00', 10, 1, 0),
(399, 15, NULL, 'Domingo', '00:00:00', '00:00:00', 10, 1, 1),
(407, 19, NULL, 'Lunes', '08:30:00', '18:00:00', 10, 1, 0),
(408, 19, NULL, 'Martes', '08:30:00', '18:00:00', 10, 1, 0),
(409, 19, NULL, 'Miércoles', '08:30:00', '18:30:00', 10, 1, 0),
(410, 19, NULL, 'Jueves', '08:30:00', '18:00:00', 10, 1, 0),
(411, 19, NULL, 'Viernes', '08:30:00', '18:00:00', 10, 1, 0),
(412, 19, NULL, 'Sábado', '08:30:00', '14:15:00', 10, 1, 0),
(413, 19, NULL, 'Domingo', '13:00:00', '16:00:00', 10, 1, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rrhh_justificaciones`
--

CREATE TABLE `rrhh_justificaciones` (
  `id` int(11) NOT NULL,
  `id_asistencia` int(11) NOT NULL,
  `tipo` enum('Tardanza','Falta','Salida Anticipada','Permiso') NOT NULL,
  `motivo` text NOT NULL,
  `documento_respaldo` varchar(255) DEFAULT NULL,
  `aprobado_por` int(11) DEFAULT NULL,
  `estado_aprobacion` enum('Pendiente','Aprobado','Rechazado') DEFAULT 'Pendiente',
  `fecha_solicitud` datetime DEFAULT current_timestamp(),
  `fecha_respuesta` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Justificaciones de tardanzas y faltas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salida_prog_fab_detalles`
--

CREATE TABLE `salida_prog_fab_detalles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_programacion_fabricacion` int(10) UNSIGNED NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad_entregada` int(11) NOT NULL,
  `id_lote` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `duracion_estimada` int(11) DEFAULT 60 COMMENT 'Duración estimada en minutos',
  `requiere_movilidad` tinyint(1) DEFAULT 0 COMMENT 'Si necesita vehículo (asignar a Jordi)',
  `requiere_certificado` tinyint(1) DEFAULT 0 COMMENT 'Si genera certificado al finalizar',
  `plantilla_certificado` varchar(255) DEFAULT NULL COMMENT 'Ruta de plantilla PDF'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`id`, `nombre`, `descripcion`, `estado`, `duracion_estimada`, `requiere_movilidad`, `requiere_certificado`, `plantilla_certificado`) VALUES
(1, 'DESINSECTACION QUIMICA', '---', 'inactivo', 60, 0, 0, NULL),
(2, 'DESINSECTACION QUIMICA', '---', 'activo', 60, 0, 0, NULL),
(3, 'DESINFECCION', '---', 'activo', 60, 0, 0, NULL),
(4, 'DESINSECTACION QUIMICA CON FOSFINA', '---', 'activo', 60, 0, 0, NULL),
(5, 'MEDICION GAS DE FOSFINA', '---', 'activo', 60, 0, 0, NULL),
(6, 'DESRATIZACION', '---', 'activo', 60, 0, 0, NULL),
(7, 'MONITOREO DE CUCARACHAS', '---', 'activo', 60, 0, 0, NULL),
(8, 'INTERVENCION POR CUCARACHAS', '---', 'activo', 60, 0, 0, NULL),
(9, 'DESINSECTACION FISICA', '---', 'activo', 60, 0, 0, NULL),
(10, 'LIMPIEZA DE CISTERNAS Y RESERVORIOS', '---', 'activo', 60, 0, 0, NULL),
(11, 'CONTROL AVIAR', '---', 'activo', 60, 0, 0, NULL),
(12, 'LIMPIEZA DE TRAMPA DE GRASA', '---', 'activo', 60, 0, 0, NULL),
(13, 'FUMIGACION', '---', 'activo', 60, 0, 0, NULL),
(14, 'FUMIGACION Y DESINFECCION', '---', 'activo', 60, 0, 0, NULL),
(15, 'INSTALACION DE COMETA', '---', 'activo', 60, 0, 0, NULL),
(16, 'FUMIGACION E INTERVENCION POR HORMIGAS', '---', 'activo', 60, 0, 0, NULL),
(17, 'REPARACIÓN DE TRAMPA DE LUZ', 'Reparación y ajuste de trampa de luz para asegurar su operatividad', 'activo', 60, 0, 0, NULL),
(18, 'REPARACIÓN DE TRAMPA DE LUZ', 'Arreglo de trampa de luz (cambio de fluorescente y/o balastro)', 'activo', 60, 0, 0, NULL),
(19, 'LIMPIEZA DE TANQUE DE AGUA', 'Limpieza y desinfección de tanque de agua', 'activo', 60, 0, 0, NULL),
(20, 'LIMPIEZA DE RESERVORIOS', '---', 'activo', 60, 0, 0, NULL),
(21, 'LIMPIEZA DE RESERVORIO DE CISTERNA Y TANQUE ROTOPLAST', '----', 'activo', 60, 0, 0, NULL),
(22, 'LIMPIEZA DE CISTERNA Y TANQUE', '---', 'activo', 60, 0, 0, NULL),
(23, 'DESRATIZACIÓN Y FUMIGACIÓN', '-', 'activo', 60, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio_producto`
--

CREATE TABLE `servicio_producto` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_servicio` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_equipo` int(11) DEFAULT NULL,
  `cantidad_default` decimal(10,2) NOT NULL DEFAULT 1.00,
  `observacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `servicio_producto`
--

INSERT INTO `servicio_producto` (`id`, `id_servicio`, `id_producto`, `id_equipo`, `cantidad_default`, `observacion`) VALUES
(1, 15, 32, NULL, 1.00, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tecnicos`
--

CREATE TABLE `tecnicos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `dni` char(10) NOT NULL,
  `celular` char(13) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `id_personal` int(10) UNSIGNED DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `autorizado_conducir` tinyint(1) DEFAULT 0,
  `carga_maxima_semanal` int(11) DEFAULT 40,
  `estado` enum('Activo','Inactivo','Licencia') DEFAULT 'Activo',
  `id_exponente_vinculado` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `tecnicos`
--

INSERT INTO `tecnicos` (`id`, `nombre`, `apellidos`, `dni`, `celular`, `correo`, `id_personal`, `especialidad`, `autorizado_conducir`, `carga_maxima_semanal`, `estado`, `id_exponente_vinculado`) VALUES
(1, 'Ricki Yordi', 'Choque Alacote', '47931115', '922824390', NULL, 23, 'Técnico Fumigación', 1, 40, 'Activo', NULL),
(2, 'Carlos Emilio', 'Lastra Hernandez', '00724882', NULL, 'carlosemiliolastrahernandez@gmail.com', NULL, NULL, 0, 40, 'Activo', NULL),
(3, 'Ricardo Jose', 'Velarde Quiñonez', '00435485', '926019820', 'ricardo.v4868@hotmail.com', NULL, NULL, 0, 40, 'Activo', NULL),
(4, 'Luis Abner', 'Diaz Nevado', '80339068', '976305098', 'abner01978@gmail.com', NULL, NULL, 0, 40, 'Activo', NULL),
(5, 'Luis Enrrique', 'Noriega Gomez', '73266918', '926385277', 'luisnorgo@gmail.com', NULL, NULL, 0, 40, 'Activo', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tecnico_disponibilidad`
--

CREATE TABLE `tecnico_disponibilidad` (
  `id` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tipo` enum('Laboral','Descanso','Vacaciones','Licencia','Feriado') DEFAULT 'Laboral',
  `horas_disponibles` int(11) DEFAULT 8,
  `observaciones` varchar(255) DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `id` int(11) NOT NULL,
  `placa` varchar(10) NOT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  `capacidad_carga` decimal(8,2) DEFAULT NULL,
  `estado` enum('Disponible','En Uso','Mantenimiento','Fuera de Servicio') DEFAULT 'Disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `vehiculos`
--

INSERT INTO `vehiculos` (`id`, `placa`, `modelo`, `marca`, `anio`, `capacidad_carga`, `estado`) VALUES
(1, 'CMY-562', 'C37', 'DFSK', 2024, 200.00, 'Disponible');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividades_mantenieminto`
--
ALTER TABLE `actividades_mantenieminto`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `area`
--
ALTER TABLE `area`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indices de la tabla `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indices de la tabla `caja_chica`
--
ALTER TABLE `caja_chica`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cargo`
--
ALTER TABLE `cargo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `catalogo_capacitacion_auditoria`
--
ALTER TABLE `catalogo_capacitacion_auditoria`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cliente_planta`
--
ALTER TABLE `cliente_planta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_planta_id_cliente_foreign` (`id_cliente`);

--
-- Indices de la tabla `cliente_planta_area`
--
ALTER TABLE `cliente_planta_area`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_planta_area_id_cliente_planta_foreign` (`id_cliente_planta`);

--
-- Indices de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cot_cli` (`id_cliente`),
  ADD KEY `fk_cot_per` (`id_personal_creador`),
  ADD KEY `fk_cotizacion_multicim` (`id_multicim`);

--
-- Indices de la tabla `cotizacion_beneficio`
--
ALTER TABLE `cotizacion_beneficio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cotizacion_beneficio_id_cotizacion_foreign` (`id_cotizacion`),
  ADD KEY `cotizacion_beneficio_id_catalogo_cap_aud_foreign` (`id_catalogo_cap_aud`);

--
-- Indices de la tabla `cotizacion_detalle`
--
ALTER TABLE `cotizacion_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_cot_orig` (`id_cotizacion`),
  ADD KEY `fk_det_cot_ser` (`id_servicio`),
  ADD KEY `fk_det_cot_pro` (`id_producto`),
  ADD KEY `cotizacion_detalle_id_catalogo_cap_aud_foreign` (`id_catalogo_cap_aud`),
  ADD KEY `cotizacion_detalle_id_cliente_planta_foreign` (`id_cliente_planta`);

--
-- Indices de la tabla `detalle_entrada_devolucion_fabricacion`
--
ALTER TABLE `detalle_entrada_devolucion_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_efd_producto` (`id_producto`),
  ADD KEY `idx_det_efd_header` (`id_entrada_devolucion_fabricacion`),
  ADD KEY `idx_det_efd_tipo_producto` (`tipo`,`id_producto`),
  ADD KEY `detalle_entrada_devolucion_fabricacion_id_lote_foreign` (`id_lote`);

--
-- Indices de la tabla `detalle_entrega_epp`
--
ALTER TABLE `detalle_entrega_epp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `detalle_entrega_epp_id_entrega_epp_foreign` (`id_entrega_epp`),
  ADD KEY `detalle_entrega_epp_id_producto_foreign` (`id_producto`),
  ADD KEY `detalle_entrega_epp_id_entrega_reemplazo_foreign` (`id_entrega_reemplazo`);

--
-- Indices de la tabla `detalle_ordenes_compra`
--
ALTER TABLE `detalle_ordenes_compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `detalle_ordenes_compra_id_orden_compra_index` (`id_orden_compra`),
  ADD KEY `detalle_ordenes_compra_id_producto_index` (`id_producto`),
  ADD KEY `detalle_ordenes_compra_id_lote_index` (`id_lote`);

--
-- Indices de la tabla `detalle_orden_asesoria`
--
ALTER TABLE `detalle_orden_asesoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `detalle_orden_asesoria_id_orden_asesoria_index` (`id_orden_asesoria`);

--
-- Indices de la tabla `detalle_orden_capacitacion_equipos`
--
ALTER TABLE `detalle_orden_capacitacion_equipos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_orden_capacitacion_materiales`
--
ALTER TABLE `detalle_orden_capacitacion_materiales`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_orden_fabricacion`
--
ALTER TABLE `detalle_orden_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_of_producto` (`id_producto_final`),
  ADD KEY `idx_det_of_orden` (`id_orden_fabricacion`);

--
-- Indices de la tabla `detalle_orden_producto`
--
ALTER TABLE `detalle_orden_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_dop_op` (`id_orden_producto`),
  ADD KEY `fk_dop_pro` (`id_producto`),
  ADD KEY `detalle_orden_producto_id_lote_index` (`id_lote`);

--
-- Indices de la tabla `detalle_orden_servicio`
--
ALTER TABLE `detalle_orden_servicio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_dos_os` (`id_orden_servicio`),
  ADD KEY `fk_dos_ser` (`id_servicio`),
  ADD KEY `detalle_orden_servicio_id_cliente_planta_foreign` (`id_cliente_planta`);

--
-- Indices de la tabla `entrada_devolucion_fabricacion`
--
ALTER TABLE `entrada_devolucion_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_efd_prog` (`id_programacion_fabricacion`),
  ADD KEY `idx_efd_orden` (`id_orden_fabricacion`),
  ADD KEY `idx_efd_estado` (`estado`);

--
-- Indices de la tabla `entrega_epp`
--
ALTER TABLE `entrega_epp`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `entrega_epp_numero_entrega_unique` (`numero_entrega`),
  ADD KEY `entrega_epp_id_tecnico_foreign` (`id_tecnico`),
  ADD KEY `entrega_epp_registrado_por_foreign` (`registrado_por`),
  ADD KEY `entrega_epp_devuelto_por_foreign` (`devuelto_por`);

--
-- Indices de la tabla `equipo`
--
ALTER TABLE `equipo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `exponentes`
--
ALTER TABLE `exponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_exponentes_tecnico_vinculado` (`id_tecnico_vinculado`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `fichas_operacionales`
--
ALTER TABLE `fichas_operacionales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fichas_operacionales_id_programacion_servicio_index` (`id_programacion_servicio`),
  ADD KEY `fichas_operacionales_id_grupo_programacion_index` (`id_grupo_programacion`),
  ADD KEY `fichas_operacionales_estado_index` (`estado`),
  ADD KEY `correlativo` (`correlativo`);

--
-- Indices de la tabla `formatos_operacionales`
--
ALTER TABLE `formatos_operacionales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fo_id_programacion_servicio` (`id_programacion_servicio`),
  ADD KEY `idx_fo_id_grupo_programacion` (`id_grupo_programacion`),
  ADD KEY `idx_fo_estado` (`estado`),
  ADD KEY `correlativo` (`correlativo`);

--
-- Indices de la tabla `formato_operacional_detalles`
--
ALTER TABLE `formato_operacional_detalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fod_id_formato_operacional` (`id_formato_operacional`),
  ADD KEY `idx_fod_tipo_seccion` (`tipo_seccion`),
  ADD KEY `idx_fod_id_producto` (`id_producto`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inventario_productos` (`id_productos`);

--
-- Indices de la tabla `inventario_ajustes`
--
ALTER TABLE `inventario_ajustes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventario_ajustes_id_producto_fecha_ajuste_index` (`id_producto`,`fecha_ajuste`),
  ADD KEY `inventario_ajustes_id_usuario_index` (`id_usuario`),
  ADD KEY `inventario_ajustes_tipo_ajuste_index` (`tipo_ajuste`),
  ADD KEY `inventario_ajustes_id_lote_index` (`id_lote`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `kardex`
--
ALTER TABLE `kardex`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kardex_id_usuario_foreign` (`id_usuario`),
  ADD KEY `kardex_id_producto_fecha_movimiento_index` (`id_producto`,`fecha_movimiento`),
  ADD KEY `kardex_tipo_movimiento_index` (`tipo_movimiento`),
  ADD KEY `kardex_id_lote_index` (`id_lote`);

--
-- Indices de la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lotes_id_producto_numero_lote_unique` (`id_producto`,`numero_lote`),
  ADD KEY `lotes_fecha_vencimiento_index` (`fecha_vencimiento`),
  ADD KEY `lotes_estado_index` (`estado`),
  ADD KEY `lotes_id_producto_estado_index` (`id_producto`,`estado`);

--
-- Indices de la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mantenimiento_equipo` (`id_equipo`),
  ADD KEY `fk_mantenimiento_act` (`id_actmanten`),
  ADD KEY `mantenimiento_id_programacion_foreign` (`id_programacion`);

--
-- Indices de la tabla `mantenimiento_vehiculo`
--
ALTER TABLE `mantenimiento_vehiculo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mantenimiento_vehiculo_id_programacion_foreign` (`id_programacion`),
  ADD KEY `mantenimiento_vehiculo_id_vehiculo_foreign` (`id_vehiculo`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `multicim`
--
ALTER TABLE `multicim`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `oei_fichas`
--
ALTER TABLE `oei_fichas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_n_ficha` (`n_ficha`),
  ADD KEY `idx_fecha` (`fecha_servicio`),
  ADD KEY `idx_estado` (`estado_servicio`),
  ADD KEY `idx_recibida` (`recibida_oei`),
  ADD KEY `fk_ficha_prog` (`id_programacion`),
  ADD KEY `fk_ficha_tec` (`id_tecnico`),
  ADD KEY `fk_ficha_recibidor` (`recibida_por`),
  ADD KEY `fk_ficha_creador` (`creado_por`),
  ADD KEY `fk_ficha_modificador` (`modificado_por`),
  ADD KEY `idx_fichas_pendientes` (`recibida_oei`,`fecha_servicio`);

--
-- Indices de la tabla `oei_ficha_anexos`
--
ALTER TABLE `oei_ficha_anexos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_anexo_ficha` (`id_ficha`);

--
-- Indices de la tabla `oei_ficha_monitoreo`
--
ALTER TABLE `oei_ficha_monitoreo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dispositivo` (`codigo_dispositivo`),
  ADD KEY `fk_monitoreo_ficha` (`id_ficha`);

--
-- Indices de la tabla `oei_informe_detalle_fichas`
--
ALTER TABLE `oei_informe_detalle_fichas`
  ADD PRIMARY KEY (`id_informe`,`id_ficha`),
  ADD KEY `fk_bridge_ficha` (`id_ficha`);

--
-- Indices de la tabla `oei_informe_final`
--
ALTER TABLE `oei_informe_final`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_informe` (`codigo_informe`),
  ADD KEY `idx_periodo` (`periodo`),
  ADD KEY `idx_cliente` (`id_cliente`),
  ADD KEY `idx_estado` (`estado_informe`),
  ADD KEY `fk_inf_elaboro` (`id_personal_elaboro`),
  ADD KEY `fk_inf_reviso` (`id_personal_reviso`),
  ADD KEY `fk_inf_aprobo` (`id_personal_aprobo`),
  ADD KEY `fk_inf_modificador` (`modificado_por`),
  ADD KEY `idx_informes_cliente_periodo` (`id_cliente`,`periodo`);

--
-- Indices de la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ordenes_compra_numero_orden_compra_unique` (`numero_orden_compra`),
  ADD KEY `ordenes_compra_id_usuario_foreign` (`id_usuario`),
  ADD KEY `ordenes_compra_estado_fecha_compra_index` (`estado`,`fecha_compra`),
  ADD KEY `ordenes_compra_id_proveedor_index` (`id_proveedor`);

--
-- Indices de la tabla `orden_asesoria`
--
ALTER TABLE `orden_asesoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orden_asesoria_numero_orden_unique` (`numero_orden`),
  ADD UNIQUE KEY `orden_asesoria_id_cotizacion_unique` (`id_cotizacion`),
  ADD KEY `orden_asesoria_id_cliente_index` (`id_cliente`),
  ADD KEY `orden_asesoria_id_servicio_index` (`id_servicio`),
  ADD KEY `orden_asesoria_estado_index` (`estado`),
  ADD KEY `orden_asesoria_fecha_servicio_index` (`fecha_servicio`),
  ADD KEY `orden_asesoria_id_cliente_planta_foreign` (`id_cliente_planta`),
  ADD KEY `orden_asesoria_id_cliente_planta_area_foreign` (`id_cliente_planta_area`);

--
-- Indices de la tabla `orden_asesoria_exponentes`
--
ALTER TABLE `orden_asesoria_exponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_orden_asesoria_exponente` (`id_orden_asesoria`,`id_exponente`);

--
-- Indices de la tabla `orden_auditoria`
--
ALTER TABLE `orden_auditoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orden_auditoria_numero_orden_unique` (`numero_orden`),
  ADD UNIQUE KEY `orden_auditoria_id_cotizacion_unique` (`id_cotizacion`),
  ADD KEY `orden_auditoria_id_cliente_index` (`id_cliente`),
  ADD KEY `orden_auditoria_id_servicio_index` (`id_servicio`),
  ADD KEY `orden_auditoria_estado_index` (`estado`),
  ADD KEY `orden_auditoria_fecha_servicio_index` (`fecha_servicio`),
  ADD KEY `fk_orden_auditoria_exponente` (`id_exponente`),
  ADD KEY `fk_orden_auditoria_emitido_por` (`emitido_por`);

--
-- Indices de la tabla `orden_auditoria_exponentes`
--
ALTER TABLE `orden_auditoria_exponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_orden_auditoria_exponente` (`id_orden_auditoria`,`id_exponente`),
  ADD KEY `fk_orden_auditoria_exp_exponente` (`id_exponente`);

--
-- Indices de la tabla `orden_capacitacion_auditoria`
--
ALTER TABLE `orden_capacitacion_auditoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_oca_cot` (`id_cotizacion`),
  ADD KEY `fk_oca_cli` (`id_cliente`),
  ADD KEY `fk_oca_ser` (`id_servicio`),
  ADD KEY `fk_oca_pon` (`id_ponente`),
  ADD KEY `orden_capacitacion_auditoria_id_exponente_foreign` (`id_exponente`);

--
-- Indices de la tabla `orden_capacitacion_ponentes`
--
ALTER TABLE `orden_capacitacion_ponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `oc_ponentes_orden_ponente_unique` (`id_orden_capacitacion`,`id_ponente`),
  ADD KEY `orden_capacitacion_ponentes_id_ponente_foreign` (`id_ponente`),
  ADD KEY `orden_capacitacion_ponentes_id_exponente_foreign` (`id_exponente`);

--
-- Indices de la tabla `orden_fabricacion`
--
ALTER TABLE `orden_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orden_fabricacion_codigo_unique` (`codigo`),
  ADD KEY `idx_of_fecha_estado` (`fecha_orden`,`estado`);

--
-- Indices de la tabla `orden_producto`
--
ALTER TABLE `orden_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_op_cot` (`id_cotizacion`),
  ADD KEY `fk_op_cli` (`id_cliente`),
  ADD KEY `fk_op_per` (`emitido_por`);

--
-- Indices de la tabla `orden_servicio`
--
ALTER TABLE `orden_servicio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_os_cot` (`id_cotizacion`),
  ADD KEY `fk_os_cli` (`id_cliente`),
  ADD KEY `fk_os_per` (`emitido_por`);

--
-- Indices de la tabla `orden_servicio_equipo`
--
ALTER TABLE `orden_servicio_equipo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ose_orden_equipo_planta_area_unique` (`id_orden_servicio`,`id_servicio`,`id_equipo`,`id_cliente_planta`,`id_cliente_planta_area`),
  ADD KEY `orden_servicio_equipo_id_equipo_foreign` (`id_equipo`),
  ADD KEY `ose_servicio_fk` (`id_servicio`),
  ADD KEY `ose_id_orden_servicio_index` (`id_orden_servicio`),
  ADD KEY `orden_servicio_equipo_id_cliente_planta_foreign` (`id_cliente_planta`),
  ADD KEY `orden_servicio_equipo_id_cliente_planta_area_foreign` (`id_cliente_planta_area`);

--
-- Indices de la tabla `orden_servicio_producto`
--
ALTER TABLE `orden_servicio_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orden_servicio_producto_id_orden_servicio_foreign` (`id_orden_servicio`),
  ADD KEY `orden_servicio_producto_id_producto_foreign` (`id_producto`),
  ADD KEY `osp_servicio_fk` (`id_servicio`),
  ADD KEY `orden_servicio_producto_id_cliente_planta_foreign` (`id_cliente_planta`),
  ADD KEY `orden_servicio_producto_id_cliente_planta_area_foreign` (`id_cliente_planta_area`),
  ADD KEY `orden_servicio_producto_id_equipo_foreign` (`id_equipo`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `personal`
--
ALTER TABLE `personal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_personal_area` (`id_area`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `productos_sku_unique` (`sku`),
  ADD KEY `fk_productos_categoria` (`id_categoria`);

--
-- Indices de la tabla `producto_receta_detalle`
--
ALTER TABLE `producto_receta_detalle`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_producto_receta_final_insumo` (`id_producto_final`,`id_producto_insumo`),
  ADD KEY `producto_receta_detalle_id_producto_insumo_foreign` (`id_producto_insumo`);

--
-- Indices de la tabla `programacion_asesoria`
--
ALTER TABLE `programacion_asesoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_asesoria_orden_fecha` (`id_orden_asesoria`,`fecha_programada`);

--
-- Indices de la tabla `programacion_asesoria_exponentes`
--
ALTER TABLE `programacion_asesoria_exponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_prog_ase_exponente` (`id_programacion_asesoria`,`id_exponente`),
  ADD KEY `idx_prog_ase_exp_prog` (`id_programacion_asesoria`),
  ADD KEY `idx_prog_ase_exp_exp` (`id_exponente`);

--
-- Indices de la tabla `programacion_capacitacion`
--
ALTER TABLE `programacion_capacitacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_cap_orden_fecha` (`id_orden_capacitacion`,`fecha_programada`),
  ADD KEY `idx_prog_cap_tecnico_conductor` (`id_tecnico_conductor`);

--
-- Indices de la tabla `programacion_capacitacion_exponentes`
--
ALTER TABLE `programacion_capacitacion_exponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_prog_cap_exponente` (`id_programacion_capacitacion`,`id_exponente`),
  ADD KEY `idx_prog_cap_exp_prog` (`id_programacion_capacitacion`),
  ADD KEY `idx_prog_cap_exp_exp` (`id_exponente`);

--
-- Indices de la tabla `programacion_exponentes`
--
ALTER TABLE `programacion_exponentes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `programacion_fabricacion`
--
ALTER TABLE `programacion_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_fabricacion_fecha_estado` (`fecha_programada`,`estado_ejecucion`),
  ADD KEY `idx_prog_fabricacion_tecnico` (`id_tecnico_asignado`),
  ADD KEY `idx_prog_fabricacion_of` (`id_orden_fabricacion`);

--
-- Indices de la tabla `programacion_historial`
--
ALTER TABLE `programacion_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_hist_prog` (`id_programacion`),
  ADD KEY `fk_hist_user` (`modificado_por`);

--
-- Indices de la tabla `programacion_insumos`
--
ALTER TABLE `programacion_insumos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pi_prog` (`id_programacion`),
  ADD KEY `fk_pi_prod` (`id_producto`),
  ADD KEY `programacion_insumos_id_lote_index` (`id_lote`);

--
-- Indices de la tabla `programacion_mantenimiento`
--
ALTER TABLE `programacion_mantenimiento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `programacion_mantenimiento_id_equipo_foreign` (`id_equipo`),
  ADD KEY `programacion_mantenimiento_id_actmanten_foreign` (`id_actmanten`);

--
-- Indices de la tabla `programacion_mantenimiento_vehiculo`
--
ALTER TABLE `programacion_mantenimiento_vehiculo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `programacion_mantenimiento_vehiculo_id_vehiculo_foreign` (`id_vehiculo`);

--
-- Indices de la tabla `programacion_notificaciones`
--
ALTER TABLE `programacion_notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_prog` (`id_programacion`);

--
-- Indices de la tabla `programacion_otros`
--
ALTER TABLE `programacion_otros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_otros_fecha_estado` (`fecha_programada`,`estado_ejecucion`),
  ADD KEY `idx_prog_otros_tecnico` (`id_tecnico_asignado`);

--
-- Indices de la tabla `programacion_servicio`
--
ALTER TABLE `programacion_servicio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fecha` (`fecha_programada`),
  ADD KEY `idx_tecnico_fecha` (`id_tecnico_asignado`,`fecha_programada`),
  ADD KEY `fk_prog_os` (`id_orden_servicio`),
  ADD KEY `fk_prog_oca` (`id_orden_capacitacion`),
  ADD KEY `fk_prog_serv` (`id_servicio`),
  ADD KEY `fk_prog_veh` (`id_vehiculo`),
  ADD KEY `fk_prog_creador` (`creado_por`),
  ADD KEY `fk_prog_modificador` (`modificado_por`),
  ADD KEY `idx_prog_estado` (`estado_ejecucion`),
  ADD KEY `idx_prog_fecha_estado` (`fecha_programada`,`estado_ejecucion`),
  ADD KEY `programacion_servicio_id_cliente_planta_foreign` (`id_cliente_planta`),
  ADD KEY `idx_prog_serv_requiere_recursos` (`requiere_asignacion_recursos`),
  ADD KEY `idx_prog_serv_id_grupo_programacion` (`id_grupo_programacion`);

--
-- Indices de la tabla `programacion_servicio_grupos`
--
ALTER TABLE `programacion_servicio_grupos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_serv_grupo_fecha_hora` (`fecha_programada`,`hora_inicio`),
  ADD KEY `idx_prog_serv_grupo_cliente_planta` (`id_cliente`,`id_cliente_planta`),
  ADD KEY `programacion_servicio_grupos_id_cliente_planta_foreign` (`id_cliente_planta`);

--
-- Indices de la tabla `programacion_servicio_inicios`
--
ALTER TABLE `programacion_servicio_inicios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_serv_inicios_programacion` (`id_programacion`),
  ADD KEY `idx_prog_serv_inicios_usuario` (`id_usuario`),
  ADD KEY `idx_prog_serv_inicios_prog_usuario` (`id_programacion`,`id_usuario`),
  ADD KEY `idx_prog_serv_inicios_fecha_inicio` (`fecha_inicio`),
  ADD KEY `idx_prog_serv_inicios_tecnico` (`id_tecnico`);

--
-- Indices de la tabla `programacion_tecnicos`
--
ALTER TABLE `programacion_tecnicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `programacion_tecnicos_id_programacion_id_tecnico_unique` (`id_programacion`,`id_tecnico`),
  ADD KEY `programacion_tecnicos_id_tecnico_foreign` (`id_tecnico`);

--
-- Indices de la tabla `programacion_visita`
--
ALTER TABLE `programacion_visita`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_visita_cliente_fecha` (`id_cliente`,`fecha_programada`),
  ADD KEY `idx_prog_visita_tecnico` (`id_tecnico_asignado`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `proveedores_ruc_unique` (`ruc`),
  ADD KEY `proveedores_estado_index` (`estado`),
  ADD KEY `proveedores_razon_social_index` (`razon_social`);

--
-- Indices de la tabla `proyecciones`
--
ALTER TABLE `proyecciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_proyeccion_multicim` (`id_multicim`),
  ADD KEY `fk_proyeccion_os` (`id_orden_servicio`),
  ADD KEY `fk_proyeccion_op` (`id_orden_producto`),
  ADD KEY `fk_proyeccion_oca` (`id_orden_capacitacion_auditoria`),
  ADD KEY `idx_proyecciones_tipo_idref` (`tipo_orden`,`id_referencia`);

--
-- Indices de la tabla `rrhh_asistencia`
--
ALTER TABLE `rrhh_asistencia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_tipo` (`tipo_registro`),
  ADD KEY `fk_asist_per` (`id_personal`),
  ADD KEY `fk_asist_tec` (`id_tecnico`),
  ADD KEY `fk_asist_prog` (`id_programacion`),
  ADD KEY `fk_asist_mod` (`modificado_por`),
  ADD KEY `idx_asistencia_fecha_tipo` (`fecha`,`tipo_registro`);

--
-- Indices de la tabla `rrhh_horarios`
--
ALTER TABLE `rrhh_horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_horario_per` (`id_personal`),
  ADD KEY `fk_horario_tec` (`id_tecnico`);

--
-- Indices de la tabla `rrhh_justificaciones`
--
ALTER TABLE `rrhh_justificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_just_asist` (`id_asistencia`),
  ADD KEY `fk_just_aprobador` (`aprobado_por`);

--
-- Indices de la tabla `salida_prog_fab_detalles`
--
ALTER TABLE `salida_prog_fab_detalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_salida_prog_fab_detalles_prog_prod` (`id_programacion_fabricacion`,`id_producto`),
  ADD KEY `idx_salida_prog_fab_detalles_lote` (`id_lote`),
  ADD KEY `fk_salida_prog_fab_detalles_prod` (`id_producto`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `servicio_producto`
--
ALTER TABLE `servicio_producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sp_servicio_producto_equipo_unique` (`id_servicio`,`id_producto`,`id_equipo`),
  ADD KEY `servicio_producto_id_producto_foreign` (`id_producto`),
  ADD KEY `servicio_producto_id_equipo_foreign` (`id_equipo`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indices de la tabla `tecnicos`
--
ALTER TABLE `tecnicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `uq_tecnicos_exponente_vinculado` (`id_exponente_vinculado`),
  ADD UNIQUE KEY `uq_tecnicos_id_personal` (`id_personal`),
  ADD KEY `idx_tecnico_estado` (`estado`),
  ADD KEY `idx_tecnicos_id_personal` (`id_personal`);

--
-- Indices de la tabla `tecnico_disponibilidad`
--
ALTER TABLE `tecnico_disponibilidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tecnico_fecha` (`id_tecnico`,`fecha`),
  ADD KEY `fk_disp_creador` (`creado_por`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vehiculo_estado` (`estado`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividades_mantenieminto`
--
ALTER TABLE `actividades_mantenieminto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `area`
--
ALTER TABLE `area`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `caja_chica`
--
ALTER TABLE `caja_chica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cargo`
--
ALTER TABLE `cargo`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `catalogo_capacitacion_auditoria`
--
ALTER TABLE `catalogo_capacitacion_auditoria`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `cliente_planta`
--
ALTER TABLE `cliente_planta`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT de la tabla `cliente_planta_area`
--
ALTER TABLE `cliente_planta_area`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `cotizacion_beneficio`
--
ALTER TABLE `cotizacion_beneficio`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cotizacion_detalle`
--
ALTER TABLE `cotizacion_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=153;

--
-- AUTO_INCREMENT de la tabla `detalle_entrada_devolucion_fabricacion`
--
ALTER TABLE `detalle_entrada_devolucion_fabricacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `detalle_entrega_epp`
--
ALTER TABLE `detalle_entrega_epp`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `detalle_ordenes_compra`
--
ALTER TABLE `detalle_ordenes_compra`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_asesoria`
--
ALTER TABLE `detalle_orden_asesoria`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_capacitacion_equipos`
--
ALTER TABLE `detalle_orden_capacitacion_equipos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_capacitacion_materiales`
--
ALTER TABLE `detalle_orden_capacitacion_materiales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_fabricacion`
--
ALTER TABLE `detalle_orden_fabricacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_producto`
--
ALTER TABLE `detalle_orden_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_servicio`
--
ALTER TABLE `detalle_orden_servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT de la tabla `entrada_devolucion_fabricacion`
--
ALTER TABLE `entrada_devolucion_fabricacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `entrega_epp`
--
ALTER TABLE `entrega_epp`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `equipo`
--
ALTER TABLE `equipo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `exponentes`
--
ALTER TABLE `exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `fichas_operacionales`
--
ALTER TABLE `fichas_operacionales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `formatos_operacionales`
--
ALTER TABLE `formatos_operacionales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `formato_operacional_detalles`
--
ALTER TABLE `formato_operacional_detalles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=266;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `inventario_ajustes`
--
ALTER TABLE `inventario_ajustes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `kardex`
--
ALTER TABLE `kardex`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=227;

--
-- AUTO_INCREMENT de la tabla `lotes`
--
ALTER TABLE `lotes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `mantenimiento_vehiculo`
--
ALTER TABLE `mantenimiento_vehiculo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=225;

--
-- AUTO_INCREMENT de la tabla `multicim`
--
ALTER TABLE `multicim`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `oei_fichas`
--
ALTER TABLE `oei_fichas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oei_ficha_anexos`
--
ALTER TABLE `oei_ficha_anexos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oei_ficha_monitoreo`
--
ALTER TABLE `oei_ficha_monitoreo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oei_informe_final`
--
ALTER TABLE `oei_informe_final`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `orden_asesoria`
--
ALTER TABLE `orden_asesoria`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `orden_asesoria_exponentes`
--
ALTER TABLE `orden_asesoria_exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `orden_auditoria`
--
ALTER TABLE `orden_auditoria`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `orden_auditoria_exponentes`
--
ALTER TABLE `orden_auditoria_exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `orden_capacitacion_auditoria`
--
ALTER TABLE `orden_capacitacion_auditoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `orden_capacitacion_ponentes`
--
ALTER TABLE `orden_capacitacion_ponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `orden_fabricacion`
--
ALTER TABLE `orden_fabricacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `orden_producto`
--
ALTER TABLE `orden_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `orden_servicio`
--
ALTER TABLE `orden_servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `orden_servicio_equipo`
--
ALTER TABLE `orden_servicio_equipo`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `orden_servicio_producto`
--
ALTER TABLE `orden_servicio_producto`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT de la tabla `personal`
--
ALTER TABLE `personal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=492;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `producto_receta_detalle`
--
ALTER TABLE `producto_receta_detalle`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `programacion_asesoria`
--
ALTER TABLE `programacion_asesoria`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `programacion_asesoria_exponentes`
--
ALTER TABLE `programacion_asesoria_exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `programacion_capacitacion`
--
ALTER TABLE `programacion_capacitacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `programacion_capacitacion_exponentes`
--
ALTER TABLE `programacion_capacitacion_exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `programacion_exponentes`
--
ALTER TABLE `programacion_exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_fabricacion`
--
ALTER TABLE `programacion_fabricacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `programacion_historial`
--
ALTER TABLE `programacion_historial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_insumos`
--
ALTER TABLE `programacion_insumos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1431;

--
-- AUTO_INCREMENT de la tabla `programacion_mantenimiento`
--
ALTER TABLE `programacion_mantenimiento`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `programacion_mantenimiento_vehiculo`
--
ALTER TABLE `programacion_mantenimiento_vehiculo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_notificaciones`
--
ALTER TABLE `programacion_notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_otros`
--
ALTER TABLE `programacion_otros`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_servicio`
--
ALTER TABLE `programacion_servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=396;

--
-- AUTO_INCREMENT de la tabla `programacion_servicio_grupos`
--
ALTER TABLE `programacion_servicio_grupos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `programacion_servicio_inicios`
--
ALTER TABLE `programacion_servicio_inicios`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `programacion_tecnicos`
--
ALTER TABLE `programacion_tecnicos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT de la tabla `programacion_visita`
--
ALTER TABLE `programacion_visita`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `proyecciones`
--
ALTER TABLE `proyecciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `rrhh_asistencia`
--
ALTER TABLE `rrhh_asistencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- AUTO_INCREMENT de la tabla `rrhh_horarios`
--
ALTER TABLE `rrhh_horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=414;

--
-- AUTO_INCREMENT de la tabla `rrhh_justificaciones`
--
ALTER TABLE `rrhh_justificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `salida_prog_fab_detalles`
--
ALTER TABLE `salida_prog_fab_detalles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `servicio_producto`
--
ALTER TABLE `servicio_producto`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `tecnicos`
--
ALTER TABLE `tecnicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tecnico_disponibilidad`
--
ALTER TABLE `tecnico_disponibilidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cliente_planta`
--
ALTER TABLE `cliente_planta`
  ADD CONSTRAINT `cliente_planta_id_cliente_foreign` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cliente_planta_area`
--
ALTER TABLE `cliente_planta_area`
  ADD CONSTRAINT `cliente_planta_area_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD CONSTRAINT `fk_cot_cli` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_cot_per` FOREIGN KEY (`id_personal_creador`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_cotizacion_multicim` FOREIGN KEY (`id_multicim`) REFERENCES `multicim` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `cotizacion_beneficio`
--
ALTER TABLE `cotizacion_beneficio`
  ADD CONSTRAINT `cotizacion_beneficio_id_catalogo_cap_aud_foreign` FOREIGN KEY (`id_catalogo_cap_aud`) REFERENCES `catalogo_capacitacion_auditoria` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cotizacion_beneficio_id_cotizacion_foreign` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cotizacion_detalle`
--
ALTER TABLE `cotizacion_detalle`
  ADD CONSTRAINT `cotizacion_detalle_id_catalogo_cap_aud_foreign` FOREIGN KEY (`id_catalogo_cap_aud`) REFERENCES `catalogo_capacitacion_auditoria` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cotizacion_detalle_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_det_cot_orig` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`),
  ADD CONSTRAINT `fk_det_cot_pro` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_det_cot_ser` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `detalle_entrada_devolucion_fabricacion`
--
ALTER TABLE `detalle_entrada_devolucion_fabricacion`
  ADD CONSTRAINT `detalle_entrada_devolucion_fabricacion_id_lote_foreign` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_det_efd_header` FOREIGN KEY (`id_entrada_devolucion_fabricacion`) REFERENCES `entrada_devolucion_fabricacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_det_efd_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `detalle_entrega_epp`
--
ALTER TABLE `detalle_entrega_epp`
  ADD CONSTRAINT `detalle_entrega_epp_id_entrega_epp_foreign` FOREIGN KEY (`id_entrega_epp`) REFERENCES `entrega_epp` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_entrega_epp_id_entrega_reemplazo_foreign` FOREIGN KEY (`id_entrega_reemplazo`) REFERENCES `entrega_epp` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `detalle_entrega_epp_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `detalle_ordenes_compra`
--
ALTER TABLE `detalle_ordenes_compra`
  ADD CONSTRAINT `detalle_ordenes_compra_id_lote_foreign` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `detalle_ordenes_compra_id_orden_compra_foreign` FOREIGN KEY (`id_orden_compra`) REFERENCES `ordenes_compra` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_ordenes_compra_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `detalle_orden_fabricacion`
--
ALTER TABLE `detalle_orden_fabricacion`
  ADD CONSTRAINT `fk_det_of_orden` FOREIGN KEY (`id_orden_fabricacion`) REFERENCES `orden_fabricacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_det_of_producto` FOREIGN KEY (`id_producto_final`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `detalle_orden_producto`
--
ALTER TABLE `detalle_orden_producto`
  ADD CONSTRAINT `detalle_orden_producto_id_lote_foreign` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_dop_op` FOREIGN KEY (`id_orden_producto`) REFERENCES `orden_producto` (`id`),
  ADD CONSTRAINT `fk_dop_pro` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `detalle_orden_servicio`
--
ALTER TABLE `detalle_orden_servicio`
  ADD CONSTRAINT `detalle_orden_servicio_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_dos_os` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`),
  ADD CONSTRAINT `fk_dos_ser` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `entrada_devolucion_fabricacion`
--
ALTER TABLE `entrada_devolucion_fabricacion`
  ADD CONSTRAINT `fk_efd_orden` FOREIGN KEY (`id_orden_fabricacion`) REFERENCES `orden_fabricacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_efd_programacion` FOREIGN KEY (`id_programacion_fabricacion`) REFERENCES `programacion_fabricacion` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `entrega_epp`
--
ALTER TABLE `entrega_epp`
  ADD CONSTRAINT `entrega_epp_devuelto_por_foreign` FOREIGN KEY (`devuelto_por`) REFERENCES `personal` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `entrega_epp_id_tecnico_foreign` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `entrega_epp_registrado_por_foreign` FOREIGN KEY (`registrado_por`) REFERENCES `personal` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `fichas_operacionales`
--
ALTER TABLE `fichas_operacionales`
  ADD CONSTRAINT `fichas_operacionales_id_programacion_servicio_foreign` FOREIGN KEY (`id_programacion_servicio`) REFERENCES `programacion_servicio` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `formatos_operacionales`
--
ALTER TABLE `formatos_operacionales`
  ADD CONSTRAINT `formatos_operacionales_id_grupo_programacion_foreign` FOREIGN KEY (`id_grupo_programacion`) REFERENCES `programacion_servicio_grupos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `formato_operacional_detalles`
--
ALTER TABLE `formato_operacional_detalles`
  ADD CONSTRAINT `formato_operacional_detalles_id_formato_operacional_foreign` FOREIGN KEY (`id_formato_operacional`) REFERENCES `formatos_operacionales` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `fk_inventario_productos` FOREIGN KEY (`id_productos`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `inventario_ajustes`
--
ALTER TABLE `inventario_ajustes`
  ADD CONSTRAINT `inventario_ajustes_id_lote_foreign` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `kardex`
--
ALTER TABLE `kardex`
  ADD CONSTRAINT `kardex_id_lote_foreign` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `kardex_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kardex_id_usuario_foreign` FOREIGN KEY (`id_usuario`) REFERENCES `personal` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD CONSTRAINT `lotes_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  ADD CONSTRAINT `fk_mantenimiento_act` FOREIGN KEY (`id_actmanten`) REFERENCES `actividades_mantenieminto` (`id`),
  ADD CONSTRAINT `fk_mantenimiento_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`),
  ADD CONSTRAINT `mantenimiento_id_programacion_foreign` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_mantenimiento` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mantenimiento_vehiculo`
--
ALTER TABLE `mantenimiento_vehiculo`
  ADD CONSTRAINT `mantenimiento_vehiculo_id_programacion_foreign` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_mantenimiento_vehiculo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mantenimiento_vehiculo_id_vehiculo_foreign` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id`);

--
-- Filtros para la tabla `oei_fichas`
--
ALTER TABLE `oei_fichas`
  ADD CONSTRAINT `fk_ficha_creador` FOREIGN KEY (`creado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_ficha_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_ficha_prog` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`),
  ADD CONSTRAINT `fk_ficha_recibidor` FOREIGN KEY (`recibida_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_ficha_tec` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`);

--
-- Filtros para la tabla `oei_ficha_anexos`
--
ALTER TABLE `oei_ficha_anexos`
  ADD CONSTRAINT `fk_anexo_ficha` FOREIGN KEY (`id_ficha`) REFERENCES `oei_fichas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `oei_ficha_monitoreo`
--
ALTER TABLE `oei_ficha_monitoreo`
  ADD CONSTRAINT `fk_monitoreo_ficha` FOREIGN KEY (`id_ficha`) REFERENCES `oei_fichas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `oei_informe_detalle_fichas`
--
ALTER TABLE `oei_informe_detalle_fichas`
  ADD CONSTRAINT `fk_bridge_ficha` FOREIGN KEY (`id_ficha`) REFERENCES `oei_fichas` (`id`),
  ADD CONSTRAINT `fk_bridge_inf` FOREIGN KEY (`id_informe`) REFERENCES `oei_informe_final` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `oei_informe_final`
--
ALTER TABLE `oei_informe_final`
  ADD CONSTRAINT `fk_inf_aprobo` FOREIGN KEY (`id_personal_aprobo`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_inf_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_inf_elaboro` FOREIGN KEY (`id_personal_elaboro`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_inf_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_inf_reviso` FOREIGN KEY (`id_personal_reviso`) REFERENCES `personal` (`id`);

--
-- Filtros para la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD CONSTRAINT `ordenes_compra_id_proveedor_foreign` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id`),
  ADD CONSTRAINT `ordenes_compra_id_usuario_foreign` FOREIGN KEY (`id_usuario`) REFERENCES `personal` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `orden_asesoria`
--
ALTER TABLE `orden_asesoria`
  ADD CONSTRAINT `orden_asesoria_id_cliente_planta_area_foreign` FOREIGN KEY (`id_cliente_planta_area`) REFERENCES `cliente_planta_area` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_asesoria_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `orden_auditoria`
--
ALTER TABLE `orden_auditoria`
  ADD CONSTRAINT `fk_orden_auditoria_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_orden_auditoria_cotizacion` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_orden_auditoria_emitido_por` FOREIGN KEY (`emitido_por`) REFERENCES `personal` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orden_auditoria_exponente` FOREIGN KEY (`id_exponente`) REFERENCES `exponentes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orden_auditoria_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `orden_auditoria_exponentes`
--
ALTER TABLE `orden_auditoria_exponentes`
  ADD CONSTRAINT `fk_orden_auditoria_exp_exponente` FOREIGN KEY (`id_exponente`) REFERENCES `exponentes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_orden_auditoria_exp_orden` FOREIGN KEY (`id_orden_auditoria`) REFERENCES `orden_auditoria` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `orden_capacitacion_auditoria`
--
ALTER TABLE `orden_capacitacion_auditoria`
  ADD CONSTRAINT `fk_oca_cli` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_oca_cot` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`),
  ADD CONSTRAINT `fk_oca_ser` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `orden_capacitacion_ponentes`
--
ALTER TABLE `orden_capacitacion_ponentes`
  ADD CONSTRAINT `orden_capacitacion_ponentes_id_exponente_foreign` FOREIGN KEY (`id_exponente`) REFERENCES `exponentes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orden_capacitacion_ponentes_id_orden_capacitacion_foreign` FOREIGN KEY (`id_orden_capacitacion`) REFERENCES `orden_capacitacion_auditoria` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orden_capacitacion_ponentes_id_ponente_foreign` FOREIGN KEY (`id_ponente`) REFERENCES `personal` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `orden_producto`
--
ALTER TABLE `orden_producto`
  ADD CONSTRAINT `fk_op_cli` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_op_cot` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`),
  ADD CONSTRAINT `fk_op_per` FOREIGN KEY (`emitido_por`) REFERENCES `personal` (`id`);

--
-- Filtros para la tabla `orden_servicio`
--
ALTER TABLE `orden_servicio`
  ADD CONSTRAINT `fk_os_cli` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_os_cot` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`),
  ADD CONSTRAINT `fk_os_per` FOREIGN KEY (`emitido_por`) REFERENCES `personal` (`id`);

--
-- Filtros para la tabla `orden_servicio_equipo`
--
ALTER TABLE `orden_servicio_equipo`
  ADD CONSTRAINT `orden_servicio_equipo_id_cliente_planta_area_foreign` FOREIGN KEY (`id_cliente_planta_area`) REFERENCES `cliente_planta_area` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_servicio_equipo_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_servicio_equipo_id_equipo_foreign` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orden_servicio_equipo_id_orden_servicio_foreign` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ose_servicio_fk` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `orden_servicio_producto`
--
ALTER TABLE `orden_servicio_producto`
  ADD CONSTRAINT `orden_servicio_producto_id_cliente_planta_area_foreign` FOREIGN KEY (`id_cliente_planta_area`) REFERENCES `cliente_planta_area` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_servicio_producto_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_servicio_producto_id_equipo_foreign` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_servicio_producto_id_orden_servicio_foreign` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orden_servicio_producto_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `osp_servicio_fk` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `personal`
--
ALTER TABLE `personal`
  ADD CONSTRAINT `fk_personal_area` FOREIGN KEY (`id_area`) REFERENCES `area` (`id`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id`);

--
-- Filtros para la tabla `producto_receta_detalle`
--
ALTER TABLE `producto_receta_detalle`
  ADD CONSTRAINT `producto_receta_detalle_id_producto_final_foreign` FOREIGN KEY (`id_producto_final`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_receta_detalle_id_producto_insumo_foreign` FOREIGN KEY (`id_producto_insumo`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `programacion_fabricacion`
--
ALTER TABLE `programacion_fabricacion`
  ADD CONSTRAINT `fk_prog_fabricacion_of` FOREIGN KEY (`id_orden_fabricacion`) REFERENCES `orden_fabricacion` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `programacion_historial`
--
ALTER TABLE `programacion_historial`
  ADD CONSTRAINT `fk_hist_prog` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`),
  ADD CONSTRAINT `fk_hist_user` FOREIGN KEY (`modificado_por`) REFERENCES `personal` (`id`);

--
-- Filtros para la tabla `programacion_insumos`
--
ALTER TABLE `programacion_insumos`
  ADD CONSTRAINT `fk_pi_prod` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_pi_prog` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`),
  ADD CONSTRAINT `programacion_insumos_id_lote_foreign` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `programacion_mantenimiento`
--
ALTER TABLE `programacion_mantenimiento`
  ADD CONSTRAINT `programacion_mantenimiento_id_actmanten_foreign` FOREIGN KEY (`id_actmanten`) REFERENCES `actividades_mantenieminto` (`id`),
  ADD CONSTRAINT `programacion_mantenimiento_id_equipo_foreign` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`);

--
-- Filtros para la tabla `programacion_mantenimiento_vehiculo`
--
ALTER TABLE `programacion_mantenimiento_vehiculo`
  ADD CONSTRAINT `programacion_mantenimiento_vehiculo_id_vehiculo_foreign` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id`);

--
-- Filtros para la tabla `programacion_notificaciones`
--
ALTER TABLE `programacion_notificaciones`
  ADD CONSTRAINT `fk_notif_prog` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`);

--
-- Filtros para la tabla `programacion_servicio`
--
ALTER TABLE `programacion_servicio`
  ADD CONSTRAINT `fk_prog_creador` FOREIGN KEY (`creado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_prog_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_prog_oca` FOREIGN KEY (`id_orden_capacitacion`) REFERENCES `orden_capacitacion_auditoria` (`id`),
  ADD CONSTRAINT `fk_prog_os` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`),
  ADD CONSTRAINT `fk_prog_serv` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`),
  ADD CONSTRAINT `fk_prog_tec` FOREIGN KEY (`id_tecnico_asignado`) REFERENCES `tecnicos` (`id`),
  ADD CONSTRAINT `fk_prog_veh` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id`),
  ADD CONSTRAINT `programacion_servicio_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `programacion_servicio_id_grupo_programacion_foreign` FOREIGN KEY (`id_grupo_programacion`) REFERENCES `programacion_servicio_grupos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `programacion_servicio_grupos`
--
ALTER TABLE `programacion_servicio_grupos`
  ADD CONSTRAINT `programacion_servicio_grupos_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `programacion_servicio_inicios`
--
ALTER TABLE `programacion_servicio_inicios`
  ADD CONSTRAINT `fk_prog_serv_inicios_programacion` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `programacion_tecnicos`
--
ALTER TABLE `programacion_tecnicos`
  ADD CONSTRAINT `programacion_tecnicos_id_programacion_foreign` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `programacion_tecnicos_id_tecnico_foreign` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `proyecciones`
--
ALTER TABLE `proyecciones`
  ADD CONSTRAINT `fk_proyeccion_multicim` FOREIGN KEY (`id_multicim`) REFERENCES `multicim` (`id`),
  ADD CONSTRAINT `fk_proyeccion_oca` FOREIGN KEY (`id_orden_capacitacion_auditoria`) REFERENCES `orden_capacitacion_auditoria` (`id`),
  ADD CONSTRAINT `fk_proyeccion_op` FOREIGN KEY (`id_orden_producto`) REFERENCES `orden_producto` (`id`),
  ADD CONSTRAINT `fk_proyeccion_os` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`);

--
-- Filtros para la tabla `rrhh_asistencia`
--
ALTER TABLE `rrhh_asistencia`
  ADD CONSTRAINT `fk_asist_mod` FOREIGN KEY (`modificado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_asist_per` FOREIGN KEY (`id_personal`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_asist_prog` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`),
  ADD CONSTRAINT `fk_asist_tec` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`);

--
-- Filtros para la tabla `rrhh_horarios`
--
ALTER TABLE `rrhh_horarios`
  ADD CONSTRAINT `fk_horario_per` FOREIGN KEY (`id_personal`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_horario_tec` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`);

--
-- Filtros para la tabla `rrhh_justificaciones`
--
ALTER TABLE `rrhh_justificaciones`
  ADD CONSTRAINT `fk_just_aprobador` FOREIGN KEY (`aprobado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_just_asist` FOREIGN KEY (`id_asistencia`) REFERENCES `rrhh_asistencia` (`id`);

--
-- Filtros para la tabla `salida_prog_fab_detalles`
--
ALTER TABLE `salida_prog_fab_detalles`
  ADD CONSTRAINT `fk_salida_prog_fab_detalles_lote` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_salida_prog_fab_detalles_prod` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_salida_prog_fab_detalles_prog_fab` FOREIGN KEY (`id_programacion_fabricacion`) REFERENCES `programacion_fabricacion` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `servicio_producto`
--
ALTER TABLE `servicio_producto`
  ADD CONSTRAINT `servicio_producto_id_equipo_foreign` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `servicio_producto_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `servicio_producto_id_servicio_foreign` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tecnico_disponibilidad`
--
ALTER TABLE `tecnico_disponibilidad`
  ADD CONSTRAINT `fk_disp_creador` FOREIGN KEY (`creado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_disp_tec` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
