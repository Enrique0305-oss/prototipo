# Sistema QSCI Group - Panel de Administración

## 📋 Descripción
Panel de administración completo para QSCI Group, empresa de fumigación y control de plagas. Sistema modular desarrollado con Vite + TypeScript.

## 🎨 Paleta de Colores Corporativa
- **Azul Corporativo**: #2c4a7c (Primary)
- **Verde Acción**: #7CB342 (Secondary/Actions)
- **Backgrounds**: #f5f7fa
- **Bordes**: #e2e8f0

## 📂 Estructura del Proyecto

```
src/
├── views/
│   ├── dashboard.ts                    # Dashboard principal con estadísticas
│   ├── almacen-mantenimiento.ts       # Mantenimiento de equipos
│   ├── almacen-inventario.ts          # Gestión de inventario (Kardex)
│   ├── almacen-proveedores.ts         # Gestión de proveedores
│   ├── almacen-entradas-salidas.ts    # Movimientos y préstamo de EPP
│   ├── logistica.ts                   # Gestión de clientes y servicios
│   ├── programaciones.ts              # Calendario de servicios
│   ├── comercial.ts                   # Prospectos y cotizaciones
│   ├── finanzas.ts                    # Dashboard financiero y caja chica
│   ├── facturacion.ts                 # Órdenes y estado de cobranza
│   ├── recursos-humanos.ts            # Asistencia y control de personal
│   ├── operaciones.ts                 # Servicios diarios e informes
│   └── reportes.ts                    # Reportes e inspecciones
├── main.ts                            # Aplicación principal y navegación
├── style.css                          # Estilos base
└── additional-styles.css              # Estilos de componentes

```

## 🚀 Secciones Implementadas

### 1. **Dashboard** ✅
- Estadísticas generales (inventario, servicios, ingresos)
- Tabla de actividades recientes
- Estado del sistema (almacén, operaciones)
- Próximos servicios programados

### 2. **Almacén** ✅
#### Mantenimiento de Equipos
- Tabla de equipos con estado de garantía
- 156 equipos totales, 12 próximos mantenimientos
- Paginación y filtros

#### Inventario
- Gestión de productos (químicos, EPP, equipos)
- Sistema Kardex
- Stock bajo y valorización
- Exportar Excel/PDF

#### Proveedores
- Listado de proveedores con contactos
- Categorización por tipo
- Estado activo/inactivo

#### Entradas y Salidas
- Registro de movimientos
- Préstamo de EPP a técnicos
- Estados: En préstamo, Completado
- Filtros por tipo y fecha

### 3. **Logística** ✅
- Gestión de clientes (tarjetas visuales)
- Información de contacto y ubicación
- Estadísticas por cliente (servicios, frecuencia, facturación)
- Sectores: Industrial, Comercial, Residencial, Alimenticio

### 4. **Programaciones** ✅
- Calendario mensual de servicios
- Sidebar con filtros y disponibilidad de técnicos
- Eventos categorizados por tipo
- Estadísticas: 42 programados, 12 completados, 5 pendientes

### 5. **Comercial y Marketing** ✅
- Gestión de prospectos (Acepta/No acepta)
- Cotizaciones pendientes
- Tasa de conversión: 68%
- Origen: Referido, Web, Llamada

### 6. **Finanzas** ✅
- Dashboard financiero:
  - Ingresos: $84,250
  - Egresos: $52,180
  - Saldo neto: $32,070
- Gráfico de flujo de caja mensual
- Caja chica con evidencias (fotos/PDF)
- Categorías: Transporte, Suministros, Ingresos

### 7. **Facturación y Cobranza** ✅
- Órdenes proyectadas vs contratos fijos
- Estado de cobranza:
  - 18 pendientes ($32,450)
  - 42 cobradas ($84,250)
  - 8 por vencer ($12,800)
- Filtros por estado y tipo

### 8. **Recursos Humanos** ✅
- Control de asistencia (Administrativos/Campo)
- Registro entrada/salida
- Cálculo de horas trabajadas
- Estados: Completo, En Curso, Tardanza, Ausente
- Estadísticas diarias: 21 presentes, 2 tardanzas, 1 ausente
- Exportar Excel/PDF

### 9. **Operaciones e Informes (OEI)** ✅
- Servicios del día: 12 programados, 8 completados
- Fichas entregadas: 8/12
- Informes por cliente con evidencias fotográficas
- Tipos de servicio con badges de color

### 10. **Reportes e Inspección** ✅
- Tarjetas de reportes con detalles
- Evidencias fotográficas
- Tipos: Fumigación, Inspección, Desratización
- 42 reportes del mes, 18 inspecciones
- Descargar PDF individual

## 🎯 Características del Sistema

### Navegación
- Menú lateral con iconos SVG profesionales (Feather Icons style)
- Submenús desplegables (Almacén tiene 4 subsecciones)
- Breadcrumbs en cada vista
- Búsqueda global en header

### Componentes Reutilizables
- **Botones**: Primary (verde), Secondary (blanco/borde)
- **Tables**: Con paginación, filtros y acciones
- **Stats Cards**: Iconos SVG, valores y tendencias
- **Badges**: Estados con colores semánticos
- **Calendar**: Grid mensual con eventos categorizados
- **Client Cards**: Vista de tarjetas con avatares e info

### Estados Visuales
- **success** (verde): Completado, Activo, Disponible
- **warning** (amarillo): Pendiente, Stock Bajo, Tardanza
- **danger** (rojo): Vencido, No Acepta, Ausente
- **info** (azul): En Proceso, Préstamo EPP

### Funcionalidades
- Paginación en todas las tablas
- Filtros por categoría, estado, fecha
- Búsqueda en tiempo real
- Exportación Excel/PDF
- Evidencias fotográficas en informes
- Gráficos de barras (finanzas)

## 🛠️ Tecnologías
- **Frontend**: Vite v7.3.1
- **Lenguaje**: TypeScript
- **Estilos**: CSS Variables + Modular CSS
- **Iconos**: SVG inline (Feather Icons style)
- **Sin dependencias**: No usa React, Vue o librerías externas

## 🔧 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
```

El sistema corre en `http://localhost:5173`

## 📊 Datos de Ejemplo
Todas las vistas incluyen datos de ejemplo realistas:
- Clientes: Logística Transandina, Farmacéutica Central, Almacenes del Norte
- Técnicos: Juan Ramírez, María Soto, Pedro López, Carlos Mendoza
- Productos: Cipermetrina 25% EC, Deltametrina Gel, EPP variado
- Equipos: Nebulizador X-200, Pulverizador B-50

## 🎨 Diseño
- **Clean & Professional**: Sin emojis, iconos SVG profesionales
- **Responsive**: Grid adaptativo para tarjetas y tablas
- **QSCI Branding**: Colores corporativos en toda la UI
- **Hover Effects**: Feedback visual en botones y cards
- **Spacing Consistente**: Sistema de 4px/8px/12px/16px/24px

## 📝 Notas de Desarrollo
- Cada vista es un módulo independiente (src/views/*.ts)
- Sistema de enrutamiento manual en main.ts
- CSS modular separado por funcionalidad
- No usa librerías de componentes externas
- Optimizado para mantenibilidad y escalabilidad

---

**Desarrollado para QSCI Group** - Sistema de Gestión Empresarial v1.0
