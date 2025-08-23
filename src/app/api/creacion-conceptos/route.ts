import { NextRequest, NextResponse } from 'next/server';
import { xmlsSequelize } from '@/lib/db';
import { PlanillaSinConcepto, FormaAgrupada, CodigoPresupuestario, VinculacionForma, ResultadoCreacion } from '@/types/creacionConceptos';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;

    // Obtener planillas sin conceptos paginadas
    const planillasQuery = `
      SELECT 
        id,
        rif_contribuyente,
        num_planilla,
        monto_total_trans,
        codigo_forma,
        nombre_forma,
        planilla_id,
        fecha_trans
      FROM datalake.planillas_sin_conceptos_mv
      ORDER BY monto_total_trans DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM datalake.planillas_sin_conceptos_mv
    `;

    const [planillasResult, countResult] = await Promise.all([
      xmlsSequelize.query(planillasQuery, {
        bind: [limit, offset],
        type: 'SELECT'
      }),
      xmlsSequelize.query(countQuery, {
        type: 'SELECT'
      })
    ]);

    const planillas = planillasResult as PlanillaSinConcepto[];
    const totalRecords = parseInt((countResult as any)[0].total);

    // Obtener estadísticas agrupadas por forma
    const formasQuery = `
      SELECT 
        codigo_forma,
        nombre_forma,
        COUNT(*) as cantidad_planillas,
        SUM(monto_total_trans) as monto_total
      FROM datalake.planillas_sin_conceptos_mv
      GROUP BY codigo_forma, nombre_forma
      ORDER BY monto_total DESC
    `;

    const formasResult = await xmlsSequelize.query(formasQuery, {
      type: 'SELECT'
    });

    const formas = formasResult as FormaAgrupada[];

    // Obtener códigos presupuestarios disponibles
    const codigosQuery = `
      SELECT id, codigo_presupuestario, designacion_presupuestario
      FROM public.codigos_presupuestarios
      ORDER BY codigo_presupuestario
    `;

    const codigosResult = await xmlsSequelize.query(codigosQuery, {
      type: 'SELECT'
    });

    const codigos = codigosResult as CodigoPresupuestario[];

    return NextResponse.json({
      planillas,
      formasAgrupadas: formas,
      codigosPresupuestarios: codigos,
      pagination: {
        page,
        limit,
        total: totalRecords,
        totalPages: Math.ceil(totalRecords / limit)
      },
      totalMonto: formas.reduce((sum, forma) => sum + parseFloat(forma.monto_total.toString()), 0)
    });

  } catch (error) {
    console.error('Error obteniendo datos de creación de conceptos:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo datos de creación de conceptos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vinculaciones } = body;

    if (!vinculaciones || !Array.isArray(vinculaciones)) {
      return NextResponse.json(
        { success: false, error: 'Se requieren las vinculaciones de formas' },
        { status: 400 }
      );
    }

    const resultado: ResultadoCreacion = {
      planillas_procesadas: 0,
      conceptos_creados: 0,
      planillas_validadas: 0,
      errores: []
    };

    // Procesar cada vinculación
    for (const vinculacion of vinculaciones) {
      try {
        const { codigo_forma, codigo_presupuestario_id } = vinculacion;

        // Obtener planillas para esta forma
        const planillasQuery = `
          SELECT planilla_id, monto_total_trans
          FROM datalake.planillas_sin_conceptos_mv
          WHERE codigo_forma = $1
        `;

        const planillasResult = await xmlsSequelize.query(planillasQuery, {
          bind: [codigo_forma],
          type: 'SELECT'
        });

        const planillas = planillasResult as any[];
        resultado.planillas_procesadas += planillas.length;
        
        console.log(`Procesando forma ${codigo_forma}: ${planillas.length} planillas encontradas`);
        
        // Log para el frontend (si fuera necesario en el futuro)
        // Aquí podríamos implementar WebSockets o Server-Sent Events para logs en tiempo real

        // Crear conceptos para cada planilla
        for (const planilla of planillas) {
          try {
            // Insertar concepto
            const insertConceptoQuery = `
              INSERT INTO datalake.conceptos_2024 (id_planilla, cod_presupuestario, monto_concepto, "createdAt", "updatedAt")
              VALUES ($1, $2, $3, NOW(), NOW())
              RETURNING id
            `;

            const insertResult = await xmlsSequelize.query(insertConceptoQuery, {
              bind: [planilla.planilla_id, codigo_presupuestario_id, planilla.monto_total_trans],
              type: 'SELECT'
            });

            const newConcepto = insertResult[0] as any;
            console.log(`Concepto creado con ID: ${newConcepto.id} para planilla ${planilla.planilla_id}`);

            resultado.conceptos_creados++;

            // Verificar si la planilla debe ser validada
            const validacionQuery = `
              SELECT 
                pr.monto_total_trans as monto_planilla,
                COALESCE(SUM(c.monto_concepto), 0) as monto_conceptos
              FROM datalake.planillas_recaudacion_2024 pr
              LEFT JOIN datalake.conceptos_2024 c ON pr.id = c.id_planilla
              WHERE pr.id = $1
              GROUP BY pr.monto_total_trans
            `;

            const validacionResult = await xmlsSequelize.query(validacionQuery, {
              bind: [planilla.planilla_id],
              type: 'SELECT'
            });

            const validacion = validacionResult[0] as any;
            
            // Si los montos coinciden, validar la planilla
            if (Math.abs(validacion.monto_planilla - validacion.monto_conceptos) < 0.01) {
              const updatePlanillaQuery = `
                UPDATE datalake.planillas_recaudacion_2024
                SET registro = true
                WHERE id = $1
              `;

              await xmlsSequelize.query(updatePlanillaQuery, {
                bind: [planilla.planilla_id]
              });

              resultado.planillas_validadas++;
            }

          } catch (error) {
            resultado.errores.push(`Error procesando planilla ${planilla.planilla_id}: ${error}`);
          }
        }

      } catch (error) {
        resultado.errores.push(`Error procesando forma ${vinculacion.codigo_forma}: ${error}`);
      }
    }

    console.log('Resultado del procesamiento:', resultado);
    
    // Refrescar vistas materializadas después del procesamiento
    try {
      console.log('🔄 Refrescando vistas materializadas...');
      const viewsToRefresh = [
        'datalake.planillas_sin_conceptos_mv',
        'datalake.formas_no_validadas_mv'
      ];
      
      for (const view of viewsToRefresh) {
        await xmlsSequelize.query(`REFRESH MATERIALIZED VIEW ${view}`);
        console.log(`✅ ${view} refrescada`);
      }
      
      console.log('✅ Vistas materializadas actualizadas');
    } catch (error) {
      console.error('⚠️ Error refrescando vistas materializadas:', error);
      // No fallar el proceso principal si el refresh falla
    }
    
    return NextResponse.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('Error procesando creación de conceptos:', error);
    return NextResponse.json(
      { success: false, error: 'Error procesando creación de conceptos' },
      { status: 500 }
    );
  }
} 