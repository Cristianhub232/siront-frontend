import { NextRequest, NextResponse } from 'next/server';
import EmpresaPetrolera from '@/models/EmpresaPetrolera';
import { Op } from 'sequelize';

// GET - Listar todas las empresas petroleras con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nombre = searchParams.get('nombre');
    const rif = searchParams.get('rif');

    // Construir condiciones de búsqueda
    const whereConditions: any = {};
    
    if (nombre) {
      whereConditions.nombre_empresa = {
        [Op.iLike]: `%${nombre}%`
      };
    }
    
    if (rif) {
      whereConditions.rif = {
        [Op.iLike]: `%${rif}%`
      };
    }

    const empresas = await EmpresaPetrolera.findAll({
      where: whereConditions,
      order: [['numero', 'ASC']],
      raw: true
    });

    return NextResponse.json(empresas);
  } catch (error) {
    console.error('Error obteniendo empresas petroleras:', error);
    return NextResponse.json(
      { error: 'Error obteniendo empresas petroleras' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva empresa petrolera
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.nombre_empresa) {
      return NextResponse.json(
        { error: 'El nombre de la empresa es requerido' },
        { status: 400 }
      );
    }

    // Obtener el siguiente número
    const ultimaEmpresa = await EmpresaPetrolera.findOne({
      order: [['numero', 'DESC']],
      raw: true
    });
    const siguienteNumero = ((ultimaEmpresa as any)?.numero || 0) + 1;

    // Crear la empresa
    const nuevaEmpresa = await EmpresaPetrolera.create({
      numero: siguienteNumero,
      nombre_empresa: body.nombre_empresa,
      rif: body.rif || null,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    });

    return NextResponse.json(nuevaEmpresa, { status: 201 });
  } catch (error) {
    console.error('Error creando empresa petrolera:', error);
    return NextResponse.json(
      { error: 'Error creando empresa petrolera' },
      { status: 500 }
    );
  }
} 