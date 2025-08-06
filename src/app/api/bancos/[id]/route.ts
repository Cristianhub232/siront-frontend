import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import Banco from '@/models/Banco';
import { UpdateBancoRequest } from '@/types/banco';

// GET /api/bancos/[id] - Obtener banco por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de banco inválido' },
        { status: 400 }
      );
    }

    const banco = await Banco.findByPk(id);
    
    if (!banco) {
      return NextResponse.json(
        { error: 'Banco no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(banco);
  } catch (error) {
    console.error('Error al obtener banco:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/bancos/[id] - Actualizar banco
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body: UpdateBancoRequest = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de banco inválido' },
        { status: 400 }
      );
    }

    const banco = await Banco.findByPk(id);
    
    if (!banco) {
      return NextResponse.json(
        { error: 'Banco no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el nuevo nombre ya existe en otro banco
    if (body.nombre && body.nombre.trim() !== (banco as any).nombre) {
      const bancoExistente = await Banco.findOne({
        where: {
          nombre: body.nombre.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (bancoExistente) {
        return NextResponse.json(
          { error: 'Ya existe un banco con ese nombre' },
          { status: 409 }
        );
      }
    }

    // Actualizar el banco
    await banco.update({
      codigo: body.codigo?.trim(),
      nombre: body.nombre?.trim(),
      descripcion: body.descripcion?.trim(),
      tipo: body.tipo?.trim(),
      fecha_actualizacion: new Date()
    });

    return NextResponse.json(banco);
  } catch (error) {
    console.error('Error al actualizar banco:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/bancos/[id] - Eliminar banco
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de banco inválido' },
        { status: 400 }
      );
    }

    const banco = await Banco.findByPk(id);
    
    if (!banco) {
      return NextResponse.json(
        { error: 'Banco no encontrado' },
        { status: 404 }
      );
    }

    await banco.destroy();

    return NextResponse.json(
      { message: 'Banco eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar banco:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 