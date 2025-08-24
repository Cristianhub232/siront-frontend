
import { Sequelize } from 'sequelize';

// Cargar variables de entorno si no están disponibles
if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
  } catch (error) {
    console.warn('No se pudo cargar .env.local');
  }
}

// Conexión principal para la aplicación
const databaseUrl = process.env.DATABASE_URL || 'postgresql://ont:123456@localhost:5432/xmls';
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

// Conexión específica para autenticación (esquema app)
const authSequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  schema: 'app',
  define: {
    schema: 'app'
  }
});

// Conexión específica para empresas petroleras (base de datos local)
const petrolerasDatabaseUrl = process.env.PETROLERAS_DATABASE_URL || 'postgresql://ont:123456@localhost:5432/xmls';
const petrolerasSequelize = new Sequelize(petrolerasDatabaseUrl, {
  dialect: 'postgres',
  logging: false,
});

// Conexión específica para formas (base de datos XMLS)
const xmlsDatabaseUrl = process.env.XMLS_DATABASE_URL || 'postgresql://ont:123456@localhost:5432/xmls';
const xmlsSequelize = new Sequelize(xmlsDatabaseUrl, {
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
export { petrolerasSequelize, xmlsSequelize, authSequelize };
