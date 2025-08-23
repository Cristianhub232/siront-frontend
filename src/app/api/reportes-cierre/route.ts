import { NextRequest, NextResponse } from 'next/server';
import { xmlsSequelize } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET - Obtener estadísticas y resúmenes de conceptos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo_presupuestario');
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');
    const anio = searchParams.get('anio') || '2024';

    // Construir condiciones WHERE
    let whereConditions = "WHERE pr.registro = true";
    
    if (codigo) {
      whereConditions += ` AND cp.codigo_presupuestario ILIKE '%${codigo}%'`;
    }
    
    if (fechaInicio && fechaFin) {
      whereConditions += ` AND pr.fecha_trans BETWEEN '${fechaInicio}' AND '${fechaFin}'`;
    }

    // Obtener datos agregados por código presupuestario usando vista materializada
    const [resumen] = await xmlsSequelize.query(`
      SELECT 
        codigo_presupuestario,
        designacion_presupuestario,
        COUNT(*) as cantidad_conceptos,
        SUM(total_monto) as total_monto,
        AVG(promedio_monto) as promedio_monto,
        MAX(monto_maximo) as monto_maximo,
        MIN(monto_minimo) as monto_minimo
      FROM datalake.reportes_cierre_mv
      ${whereConditions.replace('WHERE pr.registro = true', '')}
      GROUP BY codigo_presupuestario, designacion_presupuestario
      ORDER BY SUM(total_monto) DESC
    `);

    // Obtener estadísticas generales usando vista materializada
    const [estadisticas] = await xmlsSequelize.query(`
      SELECT 
        COUNT(*) as total_conceptos,
        SUM(total_monto) as total_monto,
        AVG(promedio_monto) as promedio_monto
      FROM datalake.reportes_cierre_mv
      ${whereConditions.replace('WHERE pr.registro = true', '')}
    `);

    // Obtener distribución por mes usando vista materializada
    const [conceptosPorMes] = await xmlsSequelize.query(`
      SELECT 
        mes,
        COUNT(*) as cantidad,
        SUM(total_monto) as monto_total
      FROM datalake.reportes_cierre_mv
      ${whereConditions.replace('WHERE pr.registro = true', '')}
      GROUP BY mes
      ORDER BY mes ASC
    `);

    return NextResponse.json({
      resumen,
      estadisticas: estadisticas[0] || {},
      conceptosPorMes
    });
  } catch (error) {
    console.error('Error obteniendo reportes de cierre:', error);
    return NextResponse.json(
      { error: 'Error obteniendo reportes de cierre' },
      { status: 500 }
    );
  }
}

// POST - Generar nuevo reporte de cierre
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.codigo_presupuestario) {
      return NextResponse.json(
        { error: 'El código presupuestario es requerido' },
        { status: 400 }
      );
    }

    if (!body.periodo_inicio || !body.periodo_fin) {
      return NextResponse.json(
        { error: 'Las fechas de período son requeridas' },
        { status: 400 }
      );
    }

    // Obtener datos del reporte
    const [conceptos] = await xmlsSequelize.query(`
      SELECT 
        pr.monto_total_trans,
        pr.id,
        c.cod_presupuestario,
        c.monto_concepto,
        cp.codigo_presupuestario,
        cp.designacion_presupuestario,
        pr.fecha_trans
      FROM datalake.planillas_recaudacion_2024 pr 
      INNER JOIN datalake.conceptos_2024 c ON pr.id = c.id_planilla
      INNER JOIN public.codigos_presupuestarios cp ON cp.id = c.cod_presupuestario 
      WHERE pr.registro = true
        AND cp.codigo_presupuestario = '${body.codigo_presupuestario}'
        AND pr.fecha_trans BETWEEN '${body.periodo_inicio}' AND '${body.periodo_fin}'
      ORDER BY pr.fecha_trans ASC
    `);

    // Calcular totales
    const totalMonto = conceptos.reduce((sum: number, concepto: any) => sum + Number(concepto.monto_concepto), 0);
    const cantidadConceptos = conceptos.length;

    // Crear objeto del reporte
    const reporte = {
      id: uuidv4(),
      titulo: body.titulo || `Reporte de Cierre - ${body.codigo_presupuestario}`,
      codigo_presupuestario: body.codigo_presupuestario,
      fecha_generacion: new Date(),
      total_monto: totalMonto,
      cantidad_conceptos: cantidadConceptos,
      periodo_inicio: body.periodo_inicio,
      periodo_fin: body.periodo_fin,
      estado: 'GENERADO' as const,
      conceptos: conceptos
    };

    return NextResponse.json(reporte, { status: 201 });
  } catch (error) {
    console.error('Error generando reporte de cierre:', error);
    return NextResponse.json(
      { error: 'Error generando reporte de cierre' },
      { status: 500 }
    );
  }
} 