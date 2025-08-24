import { NextRequest, NextResponse } from 'next/server';
import { Menu } from '@/models/index';
import { verifyToken } from '@/lib/jwtUtils';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (!verifyToken(token)) return NextResponse.json({ error: 'Token inválido' }, { status: 403 });

  try {
    const menus = await Menu.findAll({
      where: { status: true },
      order: [['orden', 'ASC']],
      attributes: ['id', 'key', 'label', 'route', 'section', 'parent_id', 'orden']
    });

    return NextResponse.json(menus, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/menus] Error:', error);
    return NextResponse.json(
      { error: 'Error obteniendo menús' },
      { status: 500 }
    );
  }
} 