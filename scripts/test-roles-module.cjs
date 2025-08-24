const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const config = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

const sequelize = new Sequelize(config);

async function testRolesModule() {
  try {
    console.log('🧪 Probando módulo de roles...\n');

    // 1. Verificar conexión a la base de datos
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar tablas del esquema app
    console.log('2. Verificando tablas del esquema app...');
    const tables = ['roles', 'users', 'menus', 'role_menu_permissions'];
    
    for (const table of tables) {
      const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM app.${table}`);
      console.log(`   📊 ${table}: ${count[0].count} registros`);
    }
    console.log('✅ Tablas verificadas\n');

    // 3. Verificar roles existentes
    console.log('3. Verificando roles existentes...');
    const [roles] = await sequelize.query('SELECT id, name, status, description FROM app.roles ORDER BY name');
    console.log('   Roles encontrados:');
    roles.forEach(role => {
      console.log(`   - ${role.name} (${role.status})${role.description ? ` - ${role.description}` : ''}`);
    });
    console.log('✅ Roles verificados\n');

    // 4. Verificar menús disponibles
    console.log('4. Verificando menús disponibles...');
    const [menus] = await sequelize.query('SELECT id, key, label, route, section FROM app.menus WHERE status = true ORDER BY orden');
    console.log('   Menús disponibles:');
    menus.forEach(menu => {
      console.log(`   - ${menu.label} (${menu.section}) -> ${menu.route}`);
    });
    console.log('✅ Menús verificados\n');

    // 5. Verificar permisos de roles
    console.log('5. Verificando permisos de roles...');
    const [permissions] = await sequelize.query(`
      SELECT r.name as role_name, m.label as menu_name, rmp.can_view, rmp.can_edit
      FROM app.role_menu_permissions rmp
      JOIN app.roles r ON rmp.role_id = r.id
      JOIN app.menus m ON rmp.menu_id = m.id
      ORDER BY r.name, m.label
    `);
    
    if (permissions.length > 0) {
      console.log('   Permisos configurados:');
      permissions.forEach(perm => {
        console.log(`   - ${perm.role_name} -> ${perm.menu_name} (ver: ${perm.can_view}, editar: ${perm.can_edit})`);
      });
    } else {
      console.log('   ⚠️  No hay permisos configurados');
    }
    console.log('✅ Permisos verificados\n');

    // 6. Verificar usuarios y sus roles
    console.log('6. Verificando usuarios y roles...');
    const [users] = await sequelize.query(`
      SELECT u.username, u.email, r.name as role_name, u.status
      FROM app.users u
      JOIN app.roles r ON u.role_id = r.id
      ORDER BY u.username
    `);
    
    console.log('   Usuarios y roles:');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) -> ${user.role_name} (${user.status})`);
    });
    console.log('✅ Usuarios verificados\n');

    console.log('🎉 ¡Módulo de roles funcionando correctamente!');
    console.log('\n📝 Resumen:');
    console.log(`   - Roles: ${roles.length}`);
    console.log(`   - Menús: ${menus.length}`);
    console.log(`   - Permisos: ${permissions.length}`);
    console.log(`   - Usuarios: ${users.length}`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar prueba
testRolesModule(); 