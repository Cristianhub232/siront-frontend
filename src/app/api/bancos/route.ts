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
    const tipo = searchParams.get('tipo');

    // Construir filtros
    const whereClause: any = {};
    if (nombre) {
      whereClause.nombre = {
        [Op.iLike]: `%${nombre}%`
      };
    }
    if (codigo) {
      whereClause.codigo = {
        [Op.iLike]: `%${codigo}%`
      };
    }
    if (tipo) {
      whereClause.tipo = tipo;
    }

    const bancos = await Banco.findAll({
      where: whereClause,
      order: [['nombre', 'ASC']],
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
    if (!body.nombre || body.nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del banco es requerido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un banco con el mismo nombre
    const bancoExistente = await Banco.findOne({
      where: {
        nombre: body.nombre.trim()
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
      codigo: body.codigo?.trim(),
      nombre: body.nombre.trim(),
      descripcion: body.descripcion?.trim(),
      tipo: body.tipo?.trim(),
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
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