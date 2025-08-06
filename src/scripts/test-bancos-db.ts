import { xmlsSequelize } from '@/lib/db';
import { Op } from 'sequelize';
import Banco from '@/models/Banco';

console.log('XMLS_DATABASE_URL:', process.env.XMLS_DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

if (!process.env.XMLS_DATABASE_URL) {
  console.error('❌ XMLS_DATABASE_URL no está configurada');
  process.exit(1);
}

async function testBancosConnection() {
  try {
    console.log('🔄 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión exitosa a XMLS');

    console.log('📊 Probando consulta a la tabla bancos...');
    
    // Contar total de bancos
    const totalBancos = await Banco.count();
    console.log(`📈 Total de bancos: ${totalBancos}`);

    // Obtener algunos bancos de ejemplo
    const bancosEjemplo = await Banco.findAll({
      limit: 5,
      order: [['nombre', 'ASC']]
    });

    console.log('📋 Ejemplos de bancos:');
    bancosEjemplo.forEach((banco: any, index: number) => {
      console.log(`   ${index + 1}. ${banco.nombre} (${banco.codigo || 'Sin código'})`);
    });

    // Estadísticas
    const bancosConDescripcion = await Banco.count({
      where: {
        descripcion: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: '' }
          ]
        }
      }
    });

    const bancosSinDescripcion = totalBancos - bancosConDescripcion;
    const porcentajeCompletitud = totalBancos > 0 ? Math.round((bancosConDescripcion / totalBancos) * 100) : 0;

    console.log('\n📊 Estadísticas:');
    console.log(`   - Total: ${totalBancos}`);
    console.log(`   - Con descripción: ${bancosConDescripcion}`);
    console.log(`   - Sin descripción: ${bancosSinDescripcion}`);
    console.log(`   - Completitud: ${porcentajeCompletitud}%`);

    console.log('🎉 Prueba completada exitosamente');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await xmlsSequelize.close();
  }
}

testBancosConnection(); 