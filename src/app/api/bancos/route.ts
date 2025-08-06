import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import Banco from '@/models/Banco';
import { BancoFilters, CreateBancoRequest } from '@/types/banco';

// GET /api/bancos - Listar bancos con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nombre = searchParams.get('nombre');
    const codigo = searchParams.get('codigo');

    // Construir filtros
    const whereClause: any = {};
    if (nombre) {
      whereClause.nombre_banco = {
        [Op.iLike]: `%${nombre}%`
      };
    }
    if (codigo) {
      whereClause.codigo_banco = {
        [Op.iLike]: `%${codigo}%`
      };
    }

    const bancos = await Banco.findAll({
      where: whereClause,
      order: [['nombre_banco', 'ASC']],
    });

    return NextResponse.json(bancos);
  } catch (error) {
    console.error('Error al obtener bancos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/bancos - Crear nuevo banco
export async function POST(request: NextRequest) {
  try {
    const body: CreateBancoRequest = await request.json();

    // Validaciones básicas
    if (!body.nombre_banco || body.nombre_banco.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del banco es requerido' },
        { status: 400 }
      );
    }

    if (!body.codigo_banco || body.codigo_banco.trim() === '') {
      return NextResponse.json(
        { error: 'El código del banco es requerido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un banco con el mismo nombre
    const bancoExistente = await Banco.findOne({
      where: {
        nombre_banco: body.nombre_banco.trim()
      }
    });

    if (bancoExistente) {
      return NextResponse.json(
        { error: 'Ya existe un banco con ese nombre' },
        { status: 409 }
      );
    }

    // Crear el banco
    const nuevoBanco = await Banco.create({
      codigo_banco: body.codigo_banco.trim(),
      nombre_banco: body.nombre_banco.trim()
    });

    return NextResponse.json(nuevoBanco, { status: 201 });
  } catch (error) {
    console.error('Error al crear banco:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 