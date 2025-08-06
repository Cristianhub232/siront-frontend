import { config } from 'dotenv';
import { resolve } from 'path';
import { Sequelize } from 'sequelize';

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') });

// Conexión específica para formas (base de datos XMLS)
const xmlsDatabaseUrl = process.env.XMLS_DATABASE_URL;
if (!xmlsDatabaseUrl) {
  throw new Error('XMLS_DATABASE_URL environment variable is not defined');
}

const xmlsSequelize = new Sequelize(xmlsDatabaseUrl, {
  dialect: 'postgres',
  logging: false,
});

async function inspectBancosTable() {
  try {
    console.log('🔍 Inspeccionando tabla bancos en base de datos XMLS...');
    
    // Probar conexión
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión a XMLS establecida correctamente');
    
    // Verificar si la tabla existe
    const tableExists = await xmlsSequelize.getQueryInterface().tableExists('bancos');
    console.log('📋 Tabla bancos existe:', tableExists);
    
    if (tableExists) {
      // Obtener estructura de la tabla
      const tableDescription = await xmlsSequelize.getQueryInterface().describeTable('bancos');
      console.log('📊 Estructura de la tabla bancos:');
      console.log(JSON.stringify(tableDescription, null, 2));
      
      // Contar registros
      const countResult = await xmlsSequelize.query('SELECT COUNT(*) as total FROM public.bancos', {
        type: 'SELECT'
      });
      console.log('📈 Total de registros en bancos:', countResult[0]);
      
      // Obtener algunos registros de ejemplo
      const sampleRecords = await xmlsSequelize.query('SELECT * FROM public.bancos LIMIT 5', {
        type: 'SELECT'
      });
      console.log('📝 Registros de ejemplo:');
      console.log(JSON.stringify(sampleRecords, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error al inspeccionar tabla bancos:', error);
  } finally {
    await xmlsSequelize.close();
  }
}

inspectBancosTable(); 