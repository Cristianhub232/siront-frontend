import { NextRequest, NextResponse } from 'next/server';
import EmpresaPetrolera from '@/models/EmpresaPetrolera';

// GET - Obtener empresa petrolera por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const empresaId = parseInt(id);
    
    if (isNaN(empresaId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const empresa = await EmpresaPetrolera.findByPk(empresaId, { raw: true });
    
    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa petrolera no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Error obteniendo empresa petrolera:', error);
    return NextResponse.json(
      { error: 'Error obteniendo empresa petrolera' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar empresa petrolera
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const empresaId = parseInt(id);
    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.nombre_empresa) {
      return NextResponse.json(
        { error: 'El nombre de la empresa es requerido' },
        { status: 400 }
      );
    }

    // Buscar la empresa
    const empresa = await EmpresaPetrolera.findByPk(id);
    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa petrolera no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar la empresa
    await empresa.update({
      nombre_empresa: body.nombre_empresa,
      rif: body.rif || null,
      fecha_actualizacion: new Date()
    });

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Error actualizando empresa petrolera:', error);
    return NextResponse.json(
      { error: 'Error actualizando empresa petrolera' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar empresa petrolera
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const empresaId = parseInt(id);
    
    // Buscar la empresa
    const empresa = await EmpresaPetrolera.findByPk(empresaId);
    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa petrolera no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la empresa
    await empresa.destroy();

    return NextResponse.json({ message: 'Empresa petrolera eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando empresa petrolera:', error);
    return NextResponse.json(
      { error: 'Error eliminando empresa petrolera' },
      { status: 500 }
    );
  }
} 