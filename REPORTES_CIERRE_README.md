# Módulo de Reportes de Cierre

Este módulo permite generar reportes financieros de cierre basados en la sumatoria de montos de la tabla `conceptos_2024` del esquema `data_lake`, agrupados por códigos presupuestarios.

## 🎯 Funcionalidades

### 📊 Dashboard de Estadísticas
- **Total Conceptos**: Cantidad total de registros en la tabla
- **Total Monto**: Suma total de todos los montos
- **Promedio Monto**: Promedio de los montos registrados
- **Códigos Únicos**: Cantidad de códigos presupuestarios diferentes

### 🔍 Filtros Avanzados
- Búsqueda por código presupuestario
- Filtrado por rango de fechas
- Aplicación y limpieza de filtros

### 📋 Resumen por Código Presupuestario
- Lista detallada de cada código presupuestario
- Estadísticas individuales (cantidad, total, promedio, máximo, mínimo)
- Acceso directo para generar reportes específicos

### 📄 Generación de Reportes
- Selección de código presupuestario
- Definición de período de fechas
- Título personalizable del reporte
- Exportación a PDF (implementación futura)

## 🗄️ Estructura de la Base de Datos

### Tabla: `data_lake.conceptos_2024`
```sql
CREATE TABLE data_lake.conceptos_2024 (
    id SERIAL PRIMARY KEY,
    codigo_presupuestario VARCHAR(50) NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    fecha_registro DATE NOT NULL,
    tipo_operacion VARCHAR(50),
    mes INTEGER,
    anio INTEGER,
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🚀 Configuración

### 1. Variables de Entorno
Asegúrate de tener configurada la variable de entorno para la base de datos XMLS:

```env
XMLS_DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_base_datos
```

### 2. Insertar el Menú
Ejecuta el siguiente comando para agregar el menú de reportes de cierre:

```bash
node src/scripts/insert-reportes-cierre-menu.cjs
```

### 3. Verificar Conexión
Para verificar que todo esté funcionando correctamente:

```bash
npx tsx src/scripts/test-xmls-db.ts
```

## 📁 Estructura de Archivos

```
src/
├── app/
│   ├── api/reportes-cierre/
│   │   └── route.ts                    # API principal (GET, POST)
│   └── (dashboard)/reportes-cierre/
│       └── page.tsx                    # Página principal
├── components/
│   └── GenerarReporteModal.tsx         # Modal para generar reportes
├── models/
│   └── Concepto2024.ts                 # Modelo Sequelize
├── types/
│   └── reporteCierre.ts                # Tipos TypeScript
└── scripts/
    └── insert-reportes-cierre-menu.cjs # Script de inserción del menú
```

## 🔌 API Endpoints

### GET /api/reportes-cierre
Obtiene estadísticas y resúmenes de conceptos con filtros opcionales:
- `?codigo_presupuestario=texto` - Filtrar por código
- `?fecha_inicio=YYYY-MM-DD` - Fecha de inicio del período
- `?fecha_fin=YYYY-MM-DD` - Fecha de fin del período

**Respuesta:**
```json
{
  "resumen": [
    {
      "codigo_presupuestario": "001-001-001",
      "cantidad_conceptos": 150,
      "total_monto": 1500000.00,
      "promedio_monto": 10000.00,
      "monto_maximo": 50000.00,
      "monto_minimo": 100.00
    }
  ],
  "estadisticas": {
    "total_conceptos": 1500,
    "total_monto": 15000000.00,
    "promedio_monto": 10000.00
  },
  "conceptosPorMes": [
    {
      "mes": 1,
      "cantidad": 125,
      "monto_total": 1250000.00
    }
  ]
}
```

### POST /api/reportes-cierre
Genera un nuevo reporte de cierre:
```json
{
  "codigo_presupuestario": "001-001-001",
  "periodo_inicio": "2024-01-01",
  "periodo_fin": "2024-12-31",
  "titulo": "Reporte de Cierre Personalizado"
}
```

**Respuesta:**
```json
{
  "id": "uuid-del-reporte",
  "titulo": "Reporte de Cierre - 001-001-001",
  "codigo_presupuestario": "001-001-001",
  "fecha_generacion": "2024-01-15T10:30:00Z",
  "total_monto": 1500000.00,
  "cantidad_conceptos": 150,
  "periodo_inicio": "2024-01-01",
  "periodo_fin": "2024-12-31",
  "estado": "GENERADO",
  "conceptos": [...]
}
```

## 🎨 Interfaz de Usuario

### Dashboard Principal
- **Cards de Estadísticas**: Visualización de métricas clave
- **Filtros de Búsqueda**: Formulario para filtrar datos
- **Tabla de Resumen**: Lista detallada por código presupuestario
- **Botón de Generación**: Acceso rápido para crear reportes

### Modal de Generación
- **Selector de Código**: Dropdown con códigos disponibles
- **Selector de Fechas**: Inputs de fecha inicio y fin
- **Título Personalizable**: Campo de texto con generación automática
- **Información del Reporte**: Descripción de lo que se generará

## 📊 Características del Reporte

### Contenido del PDF (Futuro)
1. **Encabezado**: Título, período y fecha de generación
2. **Resumen Ejecutivo**: Totales y estadísticas principales
3. **Detalle por Concepto**: Lista completa de registros
4. **Gráficos**: Distribución por mes, evolución temporal
5. **Pie de Página**: Información de generación y paginación

### Estadísticas Incluidas
- Total de conceptos en el período
- Suma total de montos
- Promedio de montos
- Monto máximo y mínimo
- Distribución por meses
- Comparación con períodos anteriores

## 🔧 Configuración Avanzada

### Personalización de Formatos
```typescript
// Formato de moneda venezolano
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2
  }).format(amount);
};
```

### Filtros Personalizados
```typescript
// Agregar filtros adicionales
const filtrosAdicionales = {
  tipo_operacion: 'INGRESO',
  monto_minimo: 1000,
  monto_maximo: 100000
};
```

## 🚀 Próximas Mejoras

### Generación de PDF
- Integración con librería PDF (jsPDF, Puppeteer)
- Plantillas personalizables
- Firma digital y marca de agua

### Reportes Programados
- Generación automática mensual/trimestral
- Envío por email
- Almacenamiento en la nube

### Análisis Avanzado
- Gráficos interactivos
- Comparativas entre períodos
- Alertas de desviaciones

### Exportación Adicional
- Formato Excel (.xlsx)
- Formato CSV
- Integración con sistemas externos

## 🛠️ Solución de Problemas

### Error de Conexión a XMLS
1. Verificar `XMLS_DATABASE_URL` en `.env.local`
2. Confirmar acceso a la base de datos
3. Verificar que la tabla `conceptos_2024` existe

### Datos No Cargados
1. Verificar permisos de usuario en la base de datos
2. Confirmar que hay datos en el período seleccionado
3. Revisar logs de la aplicación

### Menú No Aparece
1. Ejecutar script de inserción del menú
2. Verificar permisos del usuario
3. Limpiar caché del navegador

## 📞 Soporte

Para soporte técnico o reportar problemas:
- Revisar logs de la aplicación
- Verificar configuración de base de datos
- Contactar al equipo de desarrollo 