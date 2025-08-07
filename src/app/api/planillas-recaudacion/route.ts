import { NextRequest, NextResponse } from 'next/server';
import { xmlsSequelize } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Obtener parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 250); // Máximo 250 registros, por defecto 25
    const offset = (page - 1) * limit;
    
    // Obtener filtros de la URL
    const rif_contribuyente = searchParams.get('rif_contribuyente');
    const cod_seg_planilla = searchParams.get('cod_seg_planilla');
    const nombre_banco = searchParams.get('nombre_banco');
    const codigo_banco = searchParams.get('codigo_banco');
    const nombre_forma = searchParams.get('nombre_forma');
    const codigo_forma = searchParams.get('codigo_forma');
    const codigo_presupuestario = searchParams.get('codigo_presupuestario');
    const designacion_presupuestario = searchParams.get('designacion_presupuestario');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const monto_minimo = searchParams.get('monto_minimo');
    const monto_maximo = searchParams.get('monto_maximo');

    // Construir la consulta usando la vista materializada actualizada
    let query = `
      SELECT 
        rif_contribuyente,
        cod_seg_planilla,
        fecha_trans,
        num_planilla,
        monto_total_trans,
        monto_concepto,
        codigo_presupuestario,
        designacion_presupuestario,
        nombre_forma,
        codigo_forma,
        codigo_banco,
        nombre_banco
      FROM datalake.planillas_recaudacion_2024_mv
      WHERE registro = true
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    // Aplicar filtros usando la vista materializada
    if (rif_contribuyente) {
      conditions.push(`rif_contribuyente ILIKE $${params.length + 1}`);
      params.push(`%${rif_contribuyente}%`);
    }

    if (cod_seg_planilla) {
      conditions.push(`cod_seg_planilla ILIKE $${params.length + 1}`);
      params.push(`%${cod_seg_planilla}%`);
    }

    if (nombre_banco) {
      conditions.push(`nombre_banco ILIKE $${params.length + 1}`);
      params.push(`%${nombre_banco}%`);
    }

    if (codigo_banco) {
      conditions.push(`codigo_banco ILIKE $${params.length + 1}`);
      params.push(`%${codigo_banco}%`);
    }

    if (nombre_forma) {
      conditions.push(`nombre_forma ILIKE $${params.length + 1}`);
      params.push(`%${nombre_forma}%`);
    }

    if (codigo_forma) {
      conditions.push(`codigo_forma ILIKE $${params.length + 1}`);
      params.push(`%${codigo_forma}%`);
    }

    if (codigo_presupuestario) {
      conditions.push(`codigo_presupuestario ILIKE $${params.length + 1}`);
      params.push(`%${codigo_presupuestario}%`);
    }

    if (designacion_presupuestario) {
      conditions.push(`designacion_presupuestario ILIKE $${params.length + 1}`);
      params.push(`%${designacion_presupuestario}%`);
    }

    if (fecha_desde) {
      conditions.push(`fecha_trans >= $${params.length + 1}`);
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      conditions.push(`fecha_trans <= $${params.length + 1}`);
      params.push(fecha_hasta);
    }

    if (monto_minimo) {
      conditions.push(`monto_total_trans >= $${params.length + 1}`);
      params.push(parseFloat(monto_minimo));
    }

    if (monto_maximo) {
      conditions.push(`monto_total_trans <= $${params.length + 1}`);
      params.push(parseFloat(monto_maximo));
    }

    // Agregar condiciones a la consulta
    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    // Agregar ORDER BY
    query += ` ORDER BY fecha_trans DESC`;

    // Agregar paginación
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    console.log('Final query with pagination:', query);

    // Ejecutar la consulta principal
    console.log('Main query:', query);
    console.log('Main params:', params);
    
    const result = await xmlsSequelize.query(query, {
      bind: params,
      type: 'SELECT'
    });

    console.log('Main result length:', Array.isArray(result) ? result.length : 'Not array');

    // Query para contar total de registros usando la vista materializada
    let countQuery = `
      SELECT COUNT(*) as total
      FROM datalake.planillas_recaudacion_2024_mv
      WHERE registro = true
    `;
    
    console.log('Count query:', countQuery);

    const countConditions: string[] = [];
    const countParams: any[] = [];

    // Aplicar los mismos filtros para el conteo usando la vista materializada
    if (rif_contribuyente) {
      countConditions.push(`rif_contribuyente ILIKE $${countParams.length + 1}`);
      countParams.push(`%${rif_contribuyente}%`);
    }

    if (cod_seg_planilla) {
      countConditions.push(`cod_seg_planilla ILIKE $${countParams.length + 1}`);
      countParams.push(`%${cod_seg_planilla}%`);
    }

    if (nombre_banco) {
      countConditions.push(`nombre_banco ILIKE $${countParams.length + 1}`);
      countParams.push(`%${nombre_banco}%`);
    }

    if (codigo_banco) {
      countConditions.push(`codigo_banco ILIKE $${countParams.length + 1}`);
      countParams.push(`%${codigo_banco}%`);
    }

    if (nombre_forma) {
      countConditions.push(`nombre_forma ILIKE $${countParams.length + 1}`);
      countParams.push(`%${nombre_forma}%`);
    }

    if (codigo_forma) {
      countConditions.push(`codigo_forma ILIKE $${countParams.length + 1}`);
      countParams.push(`%${codigo_forma}%`);
    }

    if (codigo_presupuestario) {
      countConditions.push(`codigo_presupuestario ILIKE $${countParams.length + 1}`);
      countParams.push(`%${codigo_presupuestario}%`);
    }

    if (designacion_presupuestario) {
      countConditions.push(`designacion_presupuestario ILIKE $${countParams.length + 1}`);
      countParams.push(`%${designacion_presupuestario}%`);
    }

    if (fecha_desde) {
      countConditions.push(`fecha_trans >= $${countParams.length + 1}`);
      countParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      countConditions.push(`fecha_trans <= $${countParams.length + 1}`);
      countParams.push(fecha_hasta);
    }

    if (monto_minimo) {
      countConditions.push(`monto_total_trans >= $${countParams.length + 1}`);
      countParams.push(parseFloat(monto_minimo));
    }

    if (monto_maximo) {
      countConditions.push(`monto_total_trans <= $${countParams.length + 1}`);
      countParams.push(parseFloat(monto_maximo));
    }

    if (countConditions.length > 0) {
      countQuery += ` AND ${countConditions.join(' AND ')}`;
    }

    const countResult = await xmlsSequelize.query(countQuery, {
      bind: countParams,
      type: 'SELECT'
    });

    console.log('Count query:', countQuery);
    console.log('Count params:', countParams);
    console.log('Count result:', countResult);

    const totalRecords = parseInt((countResult[0] as any)?.total || '0') || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    // La respuesta de Sequelize devuelve un array de objetos directamente
    const data = Array.isArray(result) ? result : (result && typeof result === 'object' ? [result] : []);

    return NextResponse.json({
      success: true,
      data: data,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: {
        total_planillas: totalRecords,
        monto_total: 0, // Simplificado por rendimiento
        bancos_unicos: 0, // Simplificado por rendimiento
        contribuyentes_unicos: 0, // Simplificado por rendimiento
        formas_unicas: 0, // Simplificado por rendimiento
        promedio_monto: 0 // Simplificado por rendimiento
      }
    });

  } catch (error) {
    console.error('Error al obtener planillas de recaudación:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 