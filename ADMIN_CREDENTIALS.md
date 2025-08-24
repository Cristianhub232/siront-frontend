# 🔐 Credenciales de Administrador - SIRONT Frontend

## 👤 Usuario Administrador

### 📧 Credenciales de Acceso
- **Usuario**: `admin`
- **Email**: `admin@example.com`
- **Contraseña**: `admin123`
- **Rol**: `admin`
- **Estado**: Activo

### 🌐 Acceso a la Aplicación
- **URL**: http://localhost:3001
- **Página de login**: http://localhost:3001/login

### 🔑 Permisos del Administrador
El usuario admin tiene acceso completo a todas las funcionalidades:

- ✅ **Dashboard** - Vista general del sistema
- ✅ **Usuarios** - Gestión completa de usuarios
- ✅ **Consulta Bancos** - Consulta y edición de bancos
- ✅ **Códigos Presupuestarios** - Gestión de códigos presupuestarios
- ✅ **Empresas Petroleras** - Administración de empresas petroleras
- ✅ **Consulta Formas** - Consulta y gestión de formas
- ✅ **Formas No Validadas** - Gestión de formas no validadas
- ✅ **Creación Conceptos** - Creación y edición de conceptos
- ✅ **Planillas Recaudación** - Gestión de planillas de recaudación
- ✅ **Reportes Cierre** - Generación y gestión de reportes

### 🗄️ Base de Datos
- **Servidor**: localhost
- **Base de datos**: xmls
- **Esquema**: app
- **Usuario DB**: ont
- **Contraseña DB**: 123456

### 🛠️ Gestión de la Aplicación

#### Estado del Servidor
```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs siront-frontend

# Reiniciar aplicación
pm2 restart siront-frontend
```

#### Script de Gestión Interactivo
```bash
# Ejecutar script de gestión
./manage-app.sh
```

### 🔄 Otros Usuarios en el Sistema
Actualmente existen los siguientes usuarios:

1. **admin** (admin@example.com) - Administrador
2. **testuser** (test@example.com) - Usuario de prueba
3. **usuario1** (usuario1@example.com) - Usuario estándar
4. **cristian** (crisarelia1964@gmail.com) - Usuario existente

### 📝 Notas Importantes

1. **Seguridad**: La contraseña `admin123` es temporal y debe cambiarse en producción
2. **Roles**: El sistema tiene dos roles configurados: `admin` y `user`
3. **Permisos**: Los permisos se gestionan a través de la tabla `role_menu_permissions`
4. **Migración**: Los datos se migraron exitosamente del esquema anterior

### 🔧 Solución de Problemas

Si hay problemas de autenticación:

1. Verificar conexión a la base de datos:
   ```bash
   node scripts/test-db-connection.cjs
   ```

2. Verificar usuario admin:
   ```bash
   node scripts/create-admin-user.cjs
   ```

3. Ver logs de la aplicación:
   ```bash
   pm2 logs siront-frontend
   ```

---

**✅ Usuario administrador configurado y funcionando correctamente**  
**📅 Última actualización: 24 de agosto de 2025** 