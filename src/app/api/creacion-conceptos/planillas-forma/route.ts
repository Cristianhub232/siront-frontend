import { NextRequest, NextResponse } from 'next/server';
import { xmlsSequelize } from '@/lib/db';
import { PlanillaSinConcepto } from '@/types/creacionConceptos';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigoForma = searchParams.get('codigo_forma');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!codigoForma) {
      return NextResponse.json(
        { success: false, error: 'Se requiere el código de forma' },
        { status: 400 }
      );
    }

    // Obtener planillas de la forma específica
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
      WHERE codigo_forma = $1
      ORDER BY monto_total_trans DESC
      LIMIT $2
    `;

    const planillasResult = await xmlsSequelize.query(planillasQuery, {
      bind: [parseInt(codigoForma), limit],
      type: 'SELECT'
    });

    const planillas = planillasResult as PlanillaSinConcepto[];

    return NextResponse.json({
      success: true,
      planillas,
      total: planillas.length,
      codigo_forma: codigoForma
    });

  } catch (error) {
    console.error('Error obteniendo planillas de la forma:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo planillas de la forma' },
      { status: 500 }
    );
  }
} 