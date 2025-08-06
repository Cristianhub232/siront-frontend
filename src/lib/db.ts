
import { Sequelize } from 'sequelize';

// Cargar variables de entorno si no están disponibles
if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
  } catch (error) {
    console.warn('No se pudo cargar .env.local');
  }
}

// Conexión principal para la aplicación (localhost)
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

// Conexión específica para empresas petroleras (base de datos remota)
const petrolerasDatabaseUrl = process.env.PETROLERAS_DATABASE_URL;
if (!petrolerasDatabaseUrl) {
  throw new Error('PETROLERAS_DATABASE_URL environment variable is not defined');
}

const petrolerasSequelize = new Sequelize(petrolerasDatabaseUrl, {
  dialect: 'postgres',
  logging: false,
});

// Conexión específica para formas (base de datos XMLS)
const xmlsDatabaseUrl = process.env.XMLS_DATABASE_URL;
let xmlsSequelize: Sequelize;

if (!xmlsDatabaseUrl) {
  console.warn('XMLS_DATABASE_URL environment variable is not defined. XMLS features will be disabled.');
  // Crear una instancia dummy para evitar errores
  xmlsSequelize = new Sequelize('sqlite::memory:', {
    dialect: 'sqlite',
    logging: false,
  });
} else {
  xmlsSequelize = new Sequelize(xmlsDatabaseUrl, {
    dialect: 'postgres',
    logging: false,
  });
}

export default sequelize;
export { petrolerasSequelize, xmlsSequelize };
