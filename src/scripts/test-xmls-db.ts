import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') });

// Verificar que las variables se cargaron
console.log('🔧 Variables de entorno cargadas:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('PETROLERAS_DATABASE_URL:', process.env.PETROLERAS_DATABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('XMLS_DATABASE_URL:', process.env.XMLS_DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

// Importar después de cargar las variables de entorno
import { xmlsSequelize } from '../lib/db';
import { Forma } from '../models/index';

async function testXmlsDatabase() {
  try {
    // Probar conexión
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión a la base de datos XMLS establecida correctamente.');

    // Verificar si la tabla formas existe
    const tableExists = await xmlsSequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas disponibles en XMLS:', tableExists);

    // Verificar si la tabla formas está en la lista
    const formasTableExists = tableExists.includes('formas');
    console.log('📋 Tabla formas existe:', formasTableExists ? '✅ Sí' : '❌ No');

    if (formasTableExists) {
      // Contar formas
      const formaCount = await Forma.count();
      console.log(`📝 Total de formas en la base de datos: ${formaCount}`);

      // Obtener algunas formas de ejemplo
      const formas = await Forma.findAll({
        limit: 5,
        order: [['numero', 'ASC']],
      });

      console.log('🔍 Formas encontradas:');
      formas.forEach((forma: any, index: number) => {
        console.log(`${index + 1}. ${forma.nombre_forma} (${forma.tipo || 'Sin tipo'})`);
      });

      // Verificar estructura de la tabla
      const tableDescription = await xmlsSequelize.getQueryInterface().describeTable('formas');
      console.log('📊 Estructura de la tabla formas:', Object.keys(tableDescription));
    } else {
      console.log('⚠️ La tabla formas no existe. Verifica que la tabla esté creada en la base de datos XMLS.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await xmlsSequelize.close();
  }
}

testXmlsDatabase(); 