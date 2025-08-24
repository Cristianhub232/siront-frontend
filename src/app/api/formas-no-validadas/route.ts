import { NextRequest, NextResponse } from 'next/server';
import { xmlsSequelize } from '@/lib/db';

// GET - Obtener datos de formas no validadas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;

    // Obtener estadísticas generales
    const [stats] = await xmlsSequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM datalake.formas_no_validadas_mv) as total_formas_no_validadas,
        (SELECT SUM(monto_total_trans) FROM datalake.formas_no_validadas_mv) as total_monto_no_validadas,
        (SELECT COUNT(*) FROM datalake.planillas_recaudacion_2024 WHERE registro = true) as total_formas_validadas,
        (SELECT SUM(monto_total_trans) FROM datalake.planillas_recaudacion_2024 WHERE registro = true) as total_monto_validadas
    `);

    const statsData = stats[0] as {
      total_formas_no_validadas: number;
      total_monto_no_validadas: number;
      total_formas_validadas: number;
      total_monto_validadas: number;
    };
    
    // Calcular porcentajes
    const totalFormas = statsData.total_formas_no_validadas + statsData.total_formas_validadas;
    const totalMonto = statsData.total_monto_no_validadas + statsData.total_monto_validadas;
    
    const porcentajeNoValidadas = totalFormas > 0 ? (statsData.total_formas_no_validadas / totalFormas) * 100 : 0;
    const porcentajeMontoNoValidadas = totalMonto > 0 ? (statsData.total_monto_no_validadas / totalMonto) * 100 : 0;

    // Obtener resumen por forma
    const [resumen] = await xmlsSequelize.query(`
      SELECT 
        codigo_forma,
        nombre_forma,
        COUNT(*) as cantidad_planillas,
        SUM(monto_total_trans) as monto_total,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM datalake.formas_no_validadas_mv)), 2) as porcentaje_forma
      FROM datalake.formas_no_validadas_mv
      GROUP BY codigo_forma, nombre_forma
      ORDER BY monto_total DESC
      LIMIT 10
    `);

    // Obtener datos paginados
    const [formas] = await xmlsSequelize.query(`
      SELECT 
        rif_contribuyente,
        num_planilla,
        monto_total_trans,
        codigo_forma,
        nombre_forma,
        planilla_id
      FROM datalake.formas_no_validadas_mv
      ORDER BY monto_total_trans DESC
      LIMIT $1 OFFSET $2
    `, { bind: [limit, offset] });

    // Obtener total de registros para paginación
    const [totalCount] = await xmlsSequelize.query(`
      SELECT COUNT(*) as total
      FROM datalake.formas_no_validadas_mv
    `);

    const totalRecords = (totalCount[0] as { total: number }).total;
    const totalPages = Math.ceil(totalRecords / limit);

    return NextResponse.json({
      success: true,
      data: formas,
      stats: {
        total_formas_no_validadas: statsData.total_formas_no_validadas,
        total_monto_no_validadas: statsData.total_monto_no_validadas,
        total_formas_validadas: statsData.total_formas_validadas,
        total_monto_validadas: statsData.total_monto_validadas,
        porcentaje_no_validadas: Math.round(porcentajeNoValidadas * 100) / 100,
        porcentaje_monto_no_validadas: Math.round(porcentajeMontoNoValidadas * 100) / 100
      },
      resumen,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo formas no validadas:', error);
    return NextResponse.json(
      { error: 'Error obteniendo formas no validadas' },
      { status: 500 }
    );
  }
} 