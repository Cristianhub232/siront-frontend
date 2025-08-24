import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwtUtils';
import { User, Role } from '@/models';
import { getMenusByRole } from "@/controllers/menuController";

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  }

  const decoded = verifyToken(token);

  if (!decoded?.id) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
  }

  try {
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = user.get({ plain: true });
    
    // Extraer el rol antes de usarlo
    const { role, ...rest } = userData;
    
    // Usar el nombre del rol del usuario para obtener los menús
    const roleName = typeof role === 'object' && role?.name ? role.name : role;
    const menus = await getMenusByRole(roleName);
    const responseUser = {
      ...rest,
      role: typeof role === 'object' && role?.name ? role.name : role,
    };

    return NextResponse.json({ user: responseUser, menus }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/me] Error:', err);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
