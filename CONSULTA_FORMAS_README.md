# Módulo de Consulta de Formas

Este módulo permite gestionar y consultar las formas disponibles en el sistema, conectándose a la base de datos XMLS.

## Configuración

### 1. Variables de Entorno

Agrega la siguiente variable de entorno en tu archivo `.env.local`:

```env
XMLS_DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_base_datos
```

### 2. Estructura de la Base de Datos

El módulo espera una tabla `formas` en la base de datos XMLS con la siguiente estructura:

```sql
CREATE TABLE public.formas (
    id SERIAL PRIMARY KEY,
    numero INTEGER,
    nombre_forma VARCHAR NOT NULL,
    descripcion TEXT,
    tipo VARCHAR,
    fecha_creacion TIMESTAMP,
    fecha_actualizacion TIMESTAMP
);
```

### 3. Insertar el Menú

Ejecuta el siguiente comando para agregar el menú de consulta de formas:

```bash
node src/scripts/insert-formas-menu.js
```

### 4. Probar la Conexión

Para verificar que todo esté funcionando correctamente:

```bash
npx tsx src/scripts/test-xmls-db.ts
```

## Funcionalidades

### 📋 Listado de Formas
- Visualización de todas las formas en una tabla
- Paginación y ordenamiento
- Estadísticas de formas con y sin descripción

### 🔍 Filtros de Búsqueda
- Búsqueda por nombre de la forma
- Filtrado por tipo
- Limpieza de filtros

### ➕ Gestión CRUD
- **Crear**: Agregar nuevas formas con nombre, descripción y tipo
- **Leer**: Visualizar detalles de las formas
- **Actualizar**: Modificar información de formas existentes
- **Eliminar**: Eliminar formas con confirmación

### 📊 Estadísticas
- Total de formas
- Formas con descripción
- Formas sin descripción
- Porcentajes de completitud

## Estructura de Archivos

```
src/
├── app/
│   ├── api/formas/
│   │   ├── route.ts                    # API principal (GET, POST)
│   │   └── [id]/route.ts               # API individual (GET, PUT, DELETE)
│   └── (dashboard)/consulta-formas/
│       └── page.tsx                    # Página principal
├── components/
│   ├── AddFormaModal.tsx               # Modal para agregar formas
│   └── EditFormaModal.tsx              # Modal para editar formas
├── models/
│   └── Forma.ts                        # Modelo Sequelize
├── types/
│   └── forma.ts                        # Tipos TypeScript
└── lib/
    └── db.ts                           # Conexión XMLS agregada
```

## API Endpoints

### GET /api/formas
Lista todas las formas con filtros opcionales:
- `?nombre=texto` - Filtrar por nombre
- `?tipo=texto` - Filtrar por tipo

### POST /api/formas
Crea una nueva forma:
```json
{
  "nombre_forma": "Nombre de la forma",
  "descripcion": "Descripción opcional",
  "tipo": "Tipo opcional"
}
```

### GET /api/formas/[id]
Obtiene una forma específica por ID.

### PUT /api/formas/[id]
Actualiza una forma existente:
```json
{
  "nombre_forma": "Nuevo nombre",
  "descripcion": "Nueva descripción",
  "tipo": "Nuevo tipo"
}
```

### DELETE /api/formas/[id]
Elimina una forma específica.

## Iconos

El módulo utiliza el icono `IconClipboardList` de Tabler Icons para representar las formas en el menú de navegación.

## Permisos

El script de inserción del menú automáticamente asigna permisos de lectura y escritura a todos los roles existentes en el sistema.

## Solución de Problemas

### Error de Conexión a XMLS
1. Verifica que `XMLS_DATABASE_URL` esté configurada correctamente
2. Asegúrate de que la base de datos XMLS esté accesible
3. Ejecuta el script de prueba para diagnosticar problemas

### Tabla Formas No Encontrada
1. Verifica que la tabla `formas` exista en la base de datos XMLS
2. Confirma que la estructura de la tabla coincida con el modelo
3. Ejecuta el script de prueba para verificar la estructura

### Menú No Aparece
1. Ejecuta el script de inserción del menú
2. Verifica que el usuario tenga los permisos necesarios
3. Recarga la aplicación y limpia el caché del navegador 