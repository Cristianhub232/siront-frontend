// src/app/api/admin/users/[id]/hard-delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validate as uuidValidate } from 'uuid';
import { User } from '@/models';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uuidValidate(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[DELETE hard /admin/users/:id] Error:', err);
    return NextResponse.json(
      { error: 'Error eliminando usuario' },
      { status: 500 }
    );
  }
}
