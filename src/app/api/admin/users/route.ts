import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { User, Role } from '@/models/index';
import { verifyToken } from '@/lib/jwtUtils';
import { createUserSchema } from '@/schemas/userSchemas';
import { hashPassword } from '@/lib/authUtils';
import { UniqueConstraintError, Op } from 'sequelize';

// GET /api/auth/users → listar usuarios
export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }
  if (!verifyToken(token)) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const email = searchParams.get('email');

    // Construir condiciones de búsqueda
    const whereClause: any = {};
    if (username) {
      whereClause.username = { [Op.iLike]: `%${username}%` };
    }
    if (email) {
      whereClause.email = { [Op.iLike]: `%${email}%` };
    }

    const users = await User.findAll({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('[GET /api/auth/users] Error fetching users:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  if (!verifyToken(token)) return NextResponse.json({ error: 'Token inválido' }, { status: 403 });

  try {
    const body = createUserSchema.parse(await req.json());

    // Validación de duplicados
    if (await User.findOne({ where: { username: body.username } })) {
      return NextResponse.json({ error: 'El nombre de usuario ya existe' }, { status: 409 });
    }
    if (await User.findOne({ where: { email: body.email } })) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    // Obtener role_id a partir del nombre de rol
    const roleObj = await Role.findOne({ where: { name: body.role } });
    if (!roleObj) {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }

    // Crear usuario
    const password_hash = await hashPassword(body.password);
    const newUser = await User.create({
      username: body.username,
      email: body.email,
      password_hash,
      role_id: roleObj.getDataValue('id'),
      status: true,
    });

    // Preparar respuesta sin password_hash
    const userSafe = newUser.get({ plain: true }) as any;
    delete userSafe.password_hash;
    userSafe.role = body.role;

    return NextResponse.json(userSafe, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      // Simplificar respuesta: solo mensajes de error
      const messages = err.issues.map(issue => issue.message);
      return NextResponse.json({ errors: messages }, { status: 400 });
    }
    if (err instanceof UniqueConstraintError) {
      const messages = err.errors.map((e: any) => e.message);
      return NextResponse.json({ errors: messages }, { status: 409 });
    }
    console.error('[POST /api/auth/users] Error:', err);
    return NextResponse.json({ error: 'Error creando usuario' }, { status: 500 });
  }
}
