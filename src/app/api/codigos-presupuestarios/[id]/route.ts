import { NextRequest, NextResponse } from "next/server";
import CodigoPresupuestario from "@/models/CodigoPresupuestario";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const codigo = await CodigoPresupuestario.findByPk(id);
    
    if (!codigo) {
      return NextResponse.json(
        { error: "Código presupuestario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(codigo);
  } catch (error) {
    console.error("Error fetching codigo presupuestario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { codigo_presupuestario, designacion_presupuestario } = body;

    const codigo = await CodigoPresupuestario.findByPk(id);
    
    if (!codigo) {
      return NextResponse.json(
        { error: "Código presupuestario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el nuevo código ya existe (si se está cambiando)
    if (codigo_presupuestario && codigo_presupuestario !== (codigo as any).codigo_presupuestario) {
      const existingCodigo = await CodigoPresupuestario.findOne({
        where: { codigo_presupuestario }
      });

      if (existingCodigo) {
        return NextResponse.json(
          { error: "El código presupuestario ya existe" },
          { status: 409 }
        );
      }
    }

    // Actualizar campos
    if (codigo_presupuestario) {
      (codigo as any).codigo_presupuestario = codigo_presupuestario;
    }
    if (designacion_presupuestario) {
      (codigo as any).designacion_presupuestario = designacion_presupuestario;
    }

    await codigo.save();

    return NextResponse.json(codigo);
  } catch (error) {
    console.error("Error updating codigo presupuestario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const codigo = await CodigoPresupuestario.findByPk(id);
    
    if (!codigo) {
      return NextResponse.json(
        { error: "Código presupuestario no encontrado" },
        { status: 404 }
      );
    }

    await codigo.destroy();

    return NextResponse.json(
      { message: "Código presupuestario eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting codigo presupuestario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 