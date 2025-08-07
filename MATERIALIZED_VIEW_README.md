# Vista Materializada - Planillas de Recaudación 2024

## Descripción

Esta vista materializada (`datalake.planillas_recaudacion_2024_mv`) proporciona acceso optimizado a los datos de planillas de recaudación del año 2024, incluyendo información completa de conceptos, códigos presupuestarios, formas y bancos.

## Estructura de la Vista

La vista materializada incluye los siguientes campos:

### Campos de Planilla
- `rif_contribuyente`: RIF del contribuyente
- `cod_seg_planilla`: Código de seguimiento de la planilla
- `fecha_trans`: Fecha de transacción
- `num_planilla`: Número de planilla
- `monto_total_trans`: Monto total de la transacción

### Campos de Concepto
- `monto_concepto`: Monto del concepto específico

### Campos de Código Presupuestario
- `codigo_presupuestario`: Código presupuestario
- `designacion_presupuestario`: Designación del código presupuestario

### Campos de Forma
- `nombre_forma`: Nombre de la forma
- `codigo_forma`: Código de la forma

### Campos de Banco
- `codigo_banco`: Código del banco
- `nombre_banco`: Nombre del banco

### Campo de Control
- `registro`: Indicador de registro activo

## Tablas Relacionadas

La vista materializada se construye a partir de las siguientes tablas:

1. **`datalake.planillas_recaudacion_2024`**: Tabla principal de planillas
2. **`datalake.conceptos_2024`**: Conceptos asociados a las planillas
3. **`public.codigos_presupuestarios`**: Códigos presupuestarios
4. **`public.formas`**: Formas de pago
5. **`public.bancos`**: Información de bancos

## Relaciones

- `planillas_recaudacion_2024.id` → `conceptos_2024.id_planilla`
- `conceptos_2024.cod_presupuestario` → `codigos_presupuestarios.id`
- `planillas_recaudacion_2024.cod_forma` → `formas.id`
- `planillas_recaudacion_2024.cod_banco` → `bancos.id`

## Índices

Para optimizar el rendimiento, se han creado los siguientes índices:

- `idx_planillas_mv_rif_contribuyente`: Índice en RIF del contribuyente
- `idx_planillas_mv_cod_seg_planilla`: Índice en código de seguimiento
- `idx_planillas_mv_fecha_trans`: Índice en fecha de transacción
- `idx_planillas_mv_codigo_forma`: Índice en código de forma
- `idx_planillas_mv_codigo_banco`: Índice en código de banco

## Estadísticas Actuales

- **Total de registros**: 10,137,978
- **Contribuyentes únicos**: 934,317
- **Bancos únicos**: 19
- **Formas únicas**: Múltiples tipos de formas disponibles

## Comandos de Mantenimiento

### Crear/Recrear la Vista Materializada

```bash
npm run create-mv
```

### Refrescar la Vista Materializada

```bash
npm run refresh-mv
```

### Verificar la Vista Materializada

```bash
npm run test-mv
```

## Uso en la API

La vista materializada es utilizada por el endpoint `/api/planillas-recaudacion` para proporcionar:

- **Filtrado avanzado**: Por RIF, código de planilla, banco, forma, código presupuestario, etc.
- **Paginación**: Soporte para paginación con límites configurables
- **Ordenamiento**: Por fecha de transacción (descendente)
- **Estadísticas**: Conteos y totales optimizados

## Filtros Disponibles

La API soporta los siguientes filtros:

- `rif_contribuyente`: Filtro por RIF del contribuyente
- `cod_seg_planilla`: Filtro por código de seguimiento
- `nombre_banco`: Filtro por nombre del banco
- `codigo_banco`: Filtro por código del banco
- `nombre_forma`: Filtro por nombre de la forma
- `codigo_forma`: Filtro por código de la forma
- `codigo_presupuestario`: Filtro por código presupuestario
- `designacion_presupuestario`: Filtro por designación presupuestaria
- `fecha_desde`: Filtro por fecha desde
- `fecha_hasta`: Filtro por fecha hasta
- `monto_minimo`: Filtro por monto mínimo
- `monto_maximo`: Filtro por monto máximo

## Rendimiento

La vista materializada proporciona:

- **Consultas rápidas**: Respuestas en segundos en lugar de minutos
- **Filtrado eficiente**: Índices optimizados para búsquedas comunes
- **Escalabilidad**: Manejo de millones de registros sin degradación de rendimiento

## Troubleshooting

### Error: "column does not exist"

Si aparece un error indicando que una columna no existe, verificar:

1. Que la vista materializada esté actualizada
2. Que todas las tablas relacionadas existan
3. Ejecutar `npm run create-mv` para recrear la vista

### Error: "relation does not exist"

Si la vista materializada no existe:

1. Verificar la conexión a la base de datos XMLS
2. Ejecutar `npm run create-mv` para crear la vista
3. Verificar los permisos de la base de datos

### Rendimiento lento

Si las consultas son lentas:

1. Verificar que los índices estén creados correctamente
2. Considerar refrescar la vista materializada
3. Revisar la configuración de la base de datos

## Notas de Desarrollo

- La vista materializada se actualiza automáticamente cuando se ejecuta `npm run create-mv`
- Los cambios en las tablas base requieren recrear la vista materializada
- Se recomienda monitorear el tamaño de la vista materializada para optimizar el rendimiento 