require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
const { Sequelize } = require('sequelize');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está configurada');
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function insertBancosMenu() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Insertar menú de bancos
    const bancosMenu = {
      key: 'consulta-bancos',
      label: 'Consulta de Bancos',
      icon: 'Building2',
      route: '/consulta-bancos',
      parentId: null,
      section: 'main',
      status: true,
      metabaseID: null
    };

    console.log('📝 Insertando menú de bancos...');
    
    const [menu, created] = await sequelize.models.Menu.findOrCreate({
      where: { key: bancosMenu.key },
      defaults: bancosMenu
    });

    if (created) {
      console.log('✅ Menú de bancos creado exitosamente');
      console.log('📋 Detalles del menú:');
      console.log(`   - ID: ${menu.id}`);
      console.log(`   - Key: ${menu.key}`);
      console.log(`   - Label: ${menu.label}`);
      console.log(`   - Route: ${menu.route}`);
    } else {
      console.log('ℹ️ El menú de bancos ya existe');
    }

    console.log('🎉 Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

insertBancosMenu(); 