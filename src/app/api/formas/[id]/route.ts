import { NextRequest, NextResponse } from 'next/server';
import Forma from '@/models/Forma';

// GET - Obtener forma por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const formaId = parseInt(id);
    
    if (isNaN(formaId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const forma = await Forma.findByPk(formaId, { raw: true });
    
    if (!forma) {
      return NextResponse.json(
        { error: 'Forma no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(forma);
  } catch (error) {
    console.error('Error obteniendo forma:', error);
    return NextResponse.json(
      { error: 'Error obteniendo forma' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar forma
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const formaId = parseInt(id);
    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.nombre_forma) {
      return NextResponse.json(
        { error: 'El nombre de la forma es requerido' },
        { status: 400 }
      );
    }

    if (!body.codigo_forma) {
      return NextResponse.json(
        { error: 'El código de la forma es requerido' },
        { status: 400 }
      );
    }

    // Buscar la forma
    const forma = await Forma.findByPk(id);
    if (!forma) {
      return NextResponse.json(
        { error: 'Forma no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar la forma
    await forma.update({
      nombre_forma: body.nombre_forma,
      codigo_forma: body.codigo_forma
    });

    return NextResponse.json(forma);
  } catch (error) {
    console.error('Error actualizando forma:', error);
    return NextResponse.json(
      { error: 'Error actualizando forma' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar forma
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const formaId = parseInt(id);
    
    // Buscar la forma
    const forma = await Forma.findByPk(formaId);
    if (!forma) {
      return NextResponse.json(
        { error: 'Forma no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la forma
    await forma.destroy();

    return NextResponse.json({ message: 'Forma eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando forma:', error);
    return NextResponse.json(
      { error: 'Error eliminando forma' },
      { status: 500 }
    );
  }
} 