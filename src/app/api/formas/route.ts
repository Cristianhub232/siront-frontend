import { NextRequest, NextResponse } from 'next/server';
import Forma from '@/models/Forma';
import { Op } from 'sequelize';

// GET - Listar todas las formas con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nombre = searchParams.get('nombre');
    const codigo = searchParams.get('codigo');

    // Construir condiciones de búsqueda
    const whereConditions: any = {};
    
    if (nombre) {
      whereConditions.nombre_forma = {
        [Op.iLike]: `%${nombre}%`
      };
    }
    
    if (codigo) {
      whereConditions.codigo_forma = {
        [Op.iLike]: `%${codigo}%`
      };
    }

    const formas = await Forma.findAll({
      where: whereConditions,
      order: [['id', 'ASC']],
      raw: true
    });

    return NextResponse.json(formas);
  } catch (error) {
    console.error('Error obteniendo formas:', error);
    return NextResponse.json(
      { error: 'Error obteniendo formas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva forma
export async function POST(request: NextRequest) {
  try {
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

    // Crear la forma
    const nuevaForma = await Forma.create({
      nombre_forma: body.nombre_forma,
      codigo_forma: body.codigo_forma
    });

    return NextResponse.json(nuevaForma, { status: 201 });
  } catch (error) {
    console.error('Error creando forma:', error);
    return NextResponse.json(
      { error: 'Error creando forma' },
      { status: 500 }
    );
  }
} 