const { Sequelize } = require('sequelize');

// Configuración de la base de datos local
const xmlsConfig = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

// Crear conexión
const xmlsDB = new Sequelize(xmlsConfig);

async function createMenusTable() {
  try {
    console.log('🔧 Creando tabla menus en esquema app...');
    
    // Crear tabla menus
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.menus (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(255) NOT NULL,
        label VARCHAR(255) NOT NULL,
        icon VARCHAR(255),
        route VARCHAR(255) NOT NULL,
        parent_id UUID REFERENCES app.menus(id) ON DELETE CASCADE,
        section VARCHAR(20) DEFAULT 'main' CHECK (section IN ('main', 'secondary', 'document')),
        status BOOLEAN DEFAULT true,
        orden INTEGER DEFAULT 0,
        metabase_dashboard_id INTEGER,
        UNIQUE(key)
      );
    `);
    console.log('✅ Tabla menus creada');
    
    // Crear tabla role_menu_permissions si no existe
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.role_menu_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,
        menu_id UUID NOT NULL REFERENCES app.menus(id) ON DELETE CASCADE,
        can_view BOOLEAN DEFAULT true,
        can_edit BOOLEAN DEFAULT false,
        UNIQUE(role_id, menu_id)
      );
    `);
    console.log('✅ Tabla role_menu_permissions creada');
    
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
    throw error;
  }
}

async function createIndexes() {
  try {
    console.log('🔍 Creando índices para menus...');
    
    // Índices para menus
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_key ON app.menus(key);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_parent_id ON app.menus(parent_id);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_section ON app.menus(section);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_status ON app.menus(status);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_orden ON app.menus(orden);');
    
    // Índices para role_menu_permissions
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_role_menu_permissions_role_id ON app.role_menu_permissions(role_id);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_role_menu_permissions_menu_id ON app.role_menu_permissions(menu_id);');
    
    console.log('✅ Índices creados');
    
  } catch (error) {
    console.error('❌ Error creando índices:', error.message);
    throw error;
  }
}

async function insertDefaultMenus() {
  try {
    console.log('📝 Insertando menús por defecto...');
    
    // Verificar si ya existen menús
    const [existingMenus] = await xmlsDB.query('SELECT COUNT(*) as count FROM app.menus;');
    
    if (existingMenus[0].count === 0) {
      // Insertar menús principales
      const menus = [
        { key: 'dashboard', label: 'Dashboard', icon: 'home', route: '/dashboard', section: 'main', orden: 1 },
        { key: 'usuarios', label: 'Usuarios', icon: 'users', route: '/usuarios', section: 'main', orden: 2 },
        { key: 'roles', label: 'Roles', icon: 'shield', route: '/roles', section: 'main', orden: 3 },
        { key: 'bancos', label: 'Bancos', icon: 'building', route: '/consulta-bancos', section: 'main', orden: 4 },
        { key: 'formas', label: 'Formas', icon: 'file-text', route: '/consulta-formas', section: 'main', orden: 5 },
        { key: 'empresas', label: 'Empresas Petroleras', icon: 'factory', route: '/empresas-petroleras', section: 'main', orden: 6 },
        { key: 'codigos', label: 'Códigos Presupuestarios', icon: 'hash', route: '/codigos-presupuestarios', section: 'main', orden: 7 },
        { key: 'conceptos', label: 'Creación de Conceptos', icon: 'plus-circle', route: '/creacion-conceptos', section: 'main', orden: 8 },
        { key: 'planillas', label: 'Planillas de Recaudación', icon: 'file-spreadsheet', route: '/planillas-recaudacion', section: 'main', orden: 9 },
        { key: 'formas-no-validadas', label: 'Formas No Validadas', icon: 'alert-triangle', route: '/formas-no-validadas', section: 'main', orden: 10 },
        { key: 'reportes-cierre', label: 'Reportes de Cierre', icon: 'bar-chart', route: '/reportes-cierre', section: 'main', orden: 11 }
      ];
      
      for (const menu of menus) {
        await xmlsDB.query(`
          INSERT INTO app.menus (key, label, icon, route, section, orden, status) 
          VALUES (?, ?, ?, ?, ?, ?, true)
        `, {
          replacements: [menu.key, menu.label, menu.icon, menu.route, menu.section, menu.orden]
        });
      }
      
      console.log('✅ Menús por defecto insertados');
    } else {
      console.log('ℹ️  Los menús ya existen, saltando inserción');
    }
    
  } catch (error) {
    console.error('❌ Error insertando menús por defecto:', error.message);
    throw error;
  }
}

async function assignMenusToRoles() {
  try {
    console.log('🎭 Asignando menús a roles...');
    
    // Obtener roles
    const [roles] = await xmlsDB.query('SELECT id, name FROM app.roles;');
    const [menus] = await xmlsDB.query('SELECT id, key FROM app.menus;');
    
    // Verificar si ya existen asignaciones
    const [existingAssignments] = await xmlsDB.query('SELECT COUNT(*) as count FROM app.role_menu_permissions;');
    
    if (existingAssignments[0].count === 0) {
      const adminRole = roles.find(r => r.name === 'admin');
      const userRole = roles.find(r => r.name === 'user');
      
      if (adminRole && userRole) {
        // Admin tiene acceso a todos los menús
        for (const menu of menus) {
          await xmlsDB.query(`
            INSERT INTO app.role_menu_permissions (role_id, menu_id, can_view, can_edit) 
            VALUES (?, ?, true, true)
          `, {
            replacements: [adminRole.id, menu.id]
          });
        }
        
        // User tiene acceso limitado
        const userMenus = ['dashboard', 'bancos', 'formas', 'empresas', 'codigos', 'planillas'];
        for (const menu of menus) {
          if (userMenus.includes(menu.key)) {
            await xmlsDB.query(`
              INSERT INTO app.role_menu_permissions (role_id, menu_id, can_view, can_edit) 
              VALUES (?, ?, true, false)
            `, {
              replacements: [userRole.id, menu.id]
            });
          }
        }
        
        console.log('✅ Menús asignados a roles');
      }
    } else {
      console.log('ℹ️  Las asignaciones ya existen, saltando inserción');
    }
    
  } catch (error) {
    console.error('❌ Error asignando menús a roles:', error.message);
    throw error;
  }
}

async function verifyTables() {
  try {
    console.log('🔍 Verificando tablas creadas...');
    
    const tables = ['menus', 'role_menu_permissions'];
    
    for (const table of tables) {
      const [count] = await xmlsDB.query(`SELECT COUNT(*) as count FROM app.${table};`);
      console.log(`📊 ${table}: ${count[0].count} registros`);
    }
    
    console.log('✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Creando tablas de menús...');
    console.log('🎯 Base de datos: xmls (localhost)');
    console.log('🎯 Esquema: app');
    console.log('');
    
    // Crear tablas
    await createMenusTable();
    
    // Crear índices
    await createIndexes();
    
    // Insertar menús por defecto
    await insertDefaultMenus();
    
    // Asignar menús a roles
    await assignMenusToRoles();
    
    // Verificar tablas
    await verifyTables();
    
    console.log('');
    console.log('🎉 ¡Tablas de menús creadas exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('1. El endpoint /api/me debería funcionar correctamente');
    console.log('2. Los usuarios tendrán acceso a sus menús correspondientes');
    console.log('3. El sistema de navegación estará disponible');
    
  } catch (error) {
    console.error('💥 Error durante la creación:', error);
    process.exit(1);
  } finally {
    await xmlsDB.close();
  }
}

// Ejecutar creación
main(); 