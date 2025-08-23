# SIRONT - Sistema de Reportes ONT

Aplicación web frontend para el Sistema de Reportes de la Oficina Nacional de Tránsito (ONT).

## 🚀 Características

- **Autenticación JWT**: Sistema de login seguro con tokens JWT
- **Dashboard Administrativo**: Panel de control con múltiples módulos
- **Gestión de Usuarios**: CRUD completo de usuarios y roles
- **Empresas Petroleras**: Gestión de empresas del sector petrolero
- **Consulta de Formas**: Sistema de consulta y gestión de formas XMLS
- **Carga de Archivos**: Soporte para CSV y Excel
- **Interfaz Moderna**: Diseño responsive con Tailwind CSS

## 🛠️ Tecnologías

- **Frontend**: Next.js 15.3.3, React 19, TypeScript
- **Estilos**: Tailwind CSS 4
- **Base de Datos**: PostgreSQL con Sequelize ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **UI Components**: Radix UI, Lucide React
- **Gestión de Estado**: React Context API
- **Validación**: Zod

## 📋 Prerrequisitos

- Node.js 18+ 
- PostgreSQL
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env.local` con las siguientes variables:
```env
# Configuración de la aplicación
APP_NAME=idnspe-frontend
APP_DIR=/ruta/al/proyecto
BASE_URL=http://localhost
PORT=3000

# Base de datos principal
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_base_datos

# Base de datos de empresas petroleras
PETROLERAS_DATABASE_URL=postgresql://usuario:contraseña@host:puerto/petroleras_db

# Base de datos XMLS (opcional)
XMLS_DATABASE_URL=postgresql://usuario:contraseña@host:puerto/xmls_db

# Configuración de la API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# JWT Secret
JWT_SECRET=tu-super-secret-jwt-key
```

4. **Ejecutar migraciones**
```bash
npm run sync-db
```

5. **Iniciar en desarrollo**
```bash
npm run dev
```

6. **Build para producción**
```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas del dashboard
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI base
│   └── skeletons/        # Componentes de carga
├── context/              # Contextos de React
├── lib/                  # Utilidades y configuraciones
├── models/               # Modelos de Sequelize
├── types/                # Tipos TypeScript
└── utils/                # Utilidades generales
```

## 🔐 Autenticación

El sistema utiliza JWT para la autenticación. Los tokens se almacenan en cookies seguras y se renuevan automáticamente.

## 📊 Módulos Principales

### 👥 Gestión de Usuarios
- Crear, editar, eliminar usuarios
- Asignar roles y permisos
- Gestión de estados (activo/inactivo)

### 🏢 Empresas Petroleras
- CRUD de empresas del sector petrolero
- Carga masiva de datos via CSV/Excel
- Validación de datos

### 📋 Consulta de Formas
- Listado de formas XMLS
- Filtros por nombre y tipo
- Estadísticas de completitud
- Gestión CRUD de formas

## 🚀 Despliegue

### Despliegue Local con PM2
```bash
# Usar el script de despliegue
chmod +x src/scripts/deploy.sh
./src/scripts/deploy.sh
```

### Despliegue en Vercel
```bash
npm install -g vercel
vercel
```

## 🧪 Testing

```bash
# Ejecutar tests de base de datos
npx tsx src/scripts/test-db.ts

# Probar conexión XMLS
npx tsx src/scripts/test-xmls-db.ts
```

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linting del código
- `npm run sync-db` - Sincronizar base de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Ingeniero Cristian Brito** - Ingeniero De Datos - Big Data Enginneer

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo.


