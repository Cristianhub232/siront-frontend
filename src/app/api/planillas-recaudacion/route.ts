import { NextRequest, NextResponse } from 'next/server';
import { xmlsSequelize } from '@/lib/db';
import { PlanillaRecaudacionFilters } from '@/types/planillaRecaudacion';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Obtener parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Obtener filtros de la URL
    const filters: PlanillaRecaudacionFilters = {
      rif_contribuyente: searchParams.get('rif_contribuyente') || undefined,
      cod_seg_planilla: searchParams.get('cod_seg_planilla') || undefined,
      nombre_banco: searchParams.get('nombre_banco') || undefined,
      codigo_banco: searchParams.get('codigo_banco') || undefined,
      codigo_presupuestario: searchParams.get('codigo_presupuestario') || undefined,
      designacion_presupuestario: searchParams.get('designacion_presupuestario') || undefined,
      fecha_desde: searchParams.get('fecha_desde') || undefined,
      fecha_hasta: searchParams.get('fecha_hasta') || undefined,
      monto_minimo: searchParams.get('monto_minimo') ? parseFloat(searchParams.get('monto_minimo')!) : undefined,
      monto_maximo: searchParams.get('monto_maximo') ? parseFloat(searchParams.get('monto_maximo')!) : undefined,
    };

    // Construir la consulta base
    let query = `
      SELECT 
        pr.rif_contribuyente,
        pr.cod_seg_planilla,
        pr.fecha_trans,
        pr.monto_total_trans,
        b.nombre_banco,
        b.codigo_banco,
        c.monto_concepto,
        cp.codigo_presupuestario,
        cp.designacion_presupuestario
      FROM datalake.planillas_recaudacion_2024 pr
      INNER JOIN public.bancos b ON pr.cod_banco = b.id
      INNER JOIN datalake.conceptos_2024 c ON pr.id = c.id_planilla
      INNER JOIN public.codigos_presupuestarios cp ON c.cod_presupuestario = cp.id
      WHERE pr.registro = true
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    // Aplicar filtros
    if (filters.rif_contribuyente) {
      conditions.push(`pr.rif_contribuyente ILIKE $${params.length + 1}`);
      params.push(`%${filters.rif_contribuyente}%`);
    }

    if (filters.cod_seg_planilla) {
      conditions.push(`pr.cod_seg_planilla ILIKE $${params.length + 1}`);
      params.push(`%${filters.cod_seg_planilla}%`);
    }

    if (filters.nombre_banco) {
      conditions.push(`b.nombre_banco ILIKE $${params.length + 1}`);
      params.push(`%${filters.nombre_banco}%`);
    }

    if (filters.codigo_banco) {
      conditions.push(`b.codigo_banco ILIKE $${params.length + 1}`);
      params.push(`%${filters.codigo_banco}%`);
    }

    if (filters.codigo_presupuestario) {
      conditions.push(`cp.codigo_presupuestario ILIKE $${params.length + 1}`);
      params.push(`%${filters.codigo_presupuestario}%`);
    }

    if (filters.designacion_presupuestario) {
      conditions.push(`cp.designacion_presupuestario ILIKE $${params.length + 1}`);
      params.push(`%${filters.designacion_presupuestario}%`);
    }

    if (filters.fecha_desde) {
      conditions.push(`pr.fecha_trans >= $${params.length + 1}`);
      params.push(filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      conditions.push(`pr.fecha_trans <= $${params.length + 1}`);
      params.push(filters.fecha_hasta);
    }

    if (filters.monto_minimo !== undefined) {
      conditions.push(`pr.monto_total_trans >= $${params.length + 1}`);
      params.push(filters.monto_minimo);
    }

    if (filters.monto_maximo !== undefined) {
      conditions.push(`pr.monto_total_trans <= $${params.length + 1}`);
      params.push(filters.monto_maximo);
    }

    // Agregar condiciones a la consulta
    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    // Ordenar por fecha de transacción descendente y agregar paginación
    query += ` ORDER BY pr.fecha_trans DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    // Ejecutar la consulta
    const result = await xmlsSequelize.query(query, {
      bind: params,
      type: 'SELECT'
    });

    // Obtener estadísticas
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT pr.cod_seg_planilla) as total_planillas,
        SUM(pr.monto_total_trans) as monto_total,
        AVG(pr.monto_total_trans) as promedio_monto,
        COUNT(DISTINCT b.codigo_banco) as bancos_unicos,
        COUNT(DISTINCT pr.rif_contribuyente) as contribuyentes_unicos
      FROM datalake.planillas_recaudacion_2024 pr
      INNER JOIN public.bancos b ON pr.cod_banco = b.id
      INNER JOIN datalake.conceptos_2024 c ON pr.id = c.id_planilla
      INNER JOIN public.codigos_presupuestarios cp ON c.cod_presupuestario = cp.id
      WHERE pr.registro = true
    `;

    const statsResult = await xmlsSequelize.query(statsQuery, {
      type: 'SELECT'
    });

    const stats = statsResult[0][0] as any;

    // Obtener el total de registros para la paginación
    let countQuery = `
      SELECT COUNT(*) as total
      FROM datalake.planillas_recaudacion_2024 pr
      INNER JOIN public.bancos b ON pr.cod_banco = b.id
      INNER JOIN datalake.conceptos_2024 c ON pr.id = c.id_planilla
      INNER JOIN public.codigos_presupuestarios cp ON c.cod_presupuestario = cp.id
      WHERE pr.registro = true
    `;

    const countConditions: string[] = [];
    const countParams: any[] = [];

    // Aplicar los mismos filtros para el conteo
    if (filters.rif_contribuyente) {
      countConditions.push(`pr.rif_contribuyente ILIKE $${countParams.length + 1}`);
      countParams.push(`%${filters.rif_contribuyente}%`);
    }

    if (filters.cod_seg_planilla) {
      countConditions.push(`pr.cod_seg_planilla ILIKE $${countParams.length + 1}`);
      countParams.push(`%${filters.cod_seg_planilla}%`);
    }

    if (filters.nombre_banco) {
      countConditions.push(`b.nombre_banco ILIKE $${countParams.length + 1}`);
      countParams.push(`%${filters.nombre_banco}%`);
    }

    if (filters.codigo_banco) {
      countConditions.push(`b.codigo_banco ILIKE $${countParams.length + 1}`);
      countParams.push(`%${filters.codigo_banco}%`);
    }

    if (filters.codigo_presupuestario) {
      countConditions.push(`cp.codigo_presupuestario ILIKE $${countParams.length + 1}`);
      countParams.push(`%${filters.codigo_presupuestario}%`);
    }

    if (filters.designacion_presupuestario) {
      countConditions.push(`cp.designacion_presupuestario ILIKE $${countParams.length + 1}`);
      countParams.push(`%${filters.designacion_presupuestario}%`);
    }

    if (filters.fecha_desde) {
      countConditions.push(`pr.fecha_trans >= $${countParams.length + 1}`);
      countParams.push(filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      countConditions.push(`pr.fecha_trans <= $${countParams.length + 1}`);
      countParams.push(filters.fecha_hasta);
    }

    if (filters.monto_minimo !== undefined) {
      countConditions.push(`pr.monto_total_trans >= $${countParams.length + 1}`);
      countParams.push(filters.monto_minimo);
    }

    if (filters.monto_maximo !== undefined) {
      countConditions.push(`pr.monto_total_trans <= $${countParams.length + 1}`);
      countParams.push(filters.monto_maximo);
    }

    if (countConditions.length > 0) {
      countQuery += ` AND ${countConditions.join(' AND ')}`;
    }

    const countResult = await xmlsSequelize.query(countQuery, {
      bind: countParams,
      type: 'SELECT'
    });

    const totalRecords = parseInt((countResult[0][0] as any).total) || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    return NextResponse.json({
      success: true,
      data: result[0],
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: {
        total_planillas: parseInt(stats.total_planillas) || 0,
        monto_total: parseFloat(stats.monto_total) || 0,
        promedio_monto: parseFloat(stats.promedio_monto) || 0,
        bancos_unicos: parseInt(stats.bancos_unicos) || 0,
        contribuyentes_unicos: parseInt(stats.contribuyentes_unicos) || 0
      },
      filters
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