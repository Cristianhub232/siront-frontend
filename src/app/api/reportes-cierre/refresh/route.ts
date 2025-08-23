import { NextRequest, NextResponse } from 'next/server';
import { xmlsSequelize } from '@/lib/db';

// POST - Actualizar vista materializada
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando actualización de vista materializada...');
    const startTime = Date.now();

    // Refrescar la vista materializada (sin CONCURRENTLY por ahora)
    await xmlsSequelize.query('REFRESH MATERIALIZED VIEW datalake.reportes_cierre_mv');
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`✅ Vista materializada actualizada en ${executionTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Vista materializada actualizada exitosamente',
      executionTime: executionTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error actualizando vista materializada:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error actualizando vista materializada',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// GET - Obtener estado de la vista materializada
export async function GET() {
  try {
    // Verificar el estado de la vista materializada
    const [mvInfo] = await xmlsSequelize.query(`
      SELECT 
        schemaname,
        matviewname,
        matviewowner,
        definition
      FROM pg_matviews 
      WHERE schemaname = 'datalake' 
      AND matviewname = 'reportes_cierre_mv'
    `);

    if (mvInfo.length === 0) {
      return NextResponse.json({
        exists: false,
        message: 'Vista materializada no encontrada'
      });
    }

    // Obtener estadísticas de la vista materializada
    const [stats] = await xmlsSequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        MIN(fecha_trans) as fecha_minima,
        MAX(fecha_trans) as fecha_maxima,
        COUNT(DISTINCT codigo_presupuestario) as codigos_unicos
      FROM datalake.reportes_cierre_mv
    `);

    return NextResponse.json({
      exists: true,
      info: mvInfo[0],
      stats: stats[0],
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error obteniendo información de la vista materializada:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error obteniendo información de la vista materializada'
      },
      { status: 500 }
    );
  }
} 