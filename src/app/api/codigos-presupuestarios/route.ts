import { NextRequest, NextResponse } from "next/server";
import CodigoPresupuestario from "@/models/CodigoPresupuestario";
import { Op } from "sequelize";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get("codigo");
    const designacion = searchParams.get("designacion");

    // Construir condiciones de búsqueda
    const where: any = {};
    
    if (codigo) {
      where.codigo_presupuestario = {
        [Op.iLike]: `%${codigo}%`
      };
    }
    
    if (designacion) {
      where.designacion_presupuestario = {
        [Op.iLike]: `%${designacion}%`
      };
    }

    const codigos = await CodigoPresupuestario.findAll({
      where,
      order: [["codigo_presupuestario", "ASC"]]
    });

    return NextResponse.json(codigos);
  } catch (error) {
    console.error("Error fetching codigos presupuestarios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codigo_presupuestario, designacion_presupuestario } = body;

    // Validaciones
    if (!codigo_presupuestario || !designacion_presupuestario) {
      return NextResponse.json(
        { error: "Código presupuestario y designación son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el código ya existe
    const existingCodigo = await CodigoPresupuestario.findOne({
      where: { codigo_presupuestario }
    });

    if (existingCodigo) {
      return NextResponse.json(
        { error: "El código presupuestario ya existe" },
        { status: 409 }
      );
    }

    const nuevoCodigo = await CodigoPresupuestario.create({
      codigo_presupuestario,
      designacion_presupuestario
    });

    return NextResponse.json(nuevoCodigo, { status: 201 });
  } catch (error) {
    console.error("Error creating codigo presupuestario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 