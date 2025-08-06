import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { User, Role } from "@/models";
import { z } from "zod";
import { updateUserSchema } from "@/schemas/userSchemas";
import { hashPassword } from "@/lib/authUtils";

// src/app/api/admin/users/[id]/route.ts

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } =  await params;

  if (!uuidValidate(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
      include: [{ model: Role, as: "role", attributes: ["name"] }],
    });
    if (!user)
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );

    const u = user.get({ plain: true });
    const { role, ...rest } = u;
    return NextResponse.json({
      user: { ...rest, role: typeof role === "object" ? role.name : role },
    });
  } catch (err) {
    console.error("[GET /admin/users/:id] Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uuidValidate(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  let parsedBody: unknown;
  // 1) Leer y parsear JSON con su propio try/catch
  try {
    parsedBody = await req.json();
  } catch (error) {
    console.error('[PATCH /admin/users/:id] JSON parse error:', error);
    return NextResponse.json(
      { error: 'JSON malformado en el body' },
      { status: 400 }
    );
  }

  // 2) Validar con Zod
  let body: Record<string, any>;
  try {
    body = updateUserSchema.parse(parsedBody);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err.issues }, { status: 400 });
    }
    console.error('[PATCH /admin/users/:id] Zod validation error:', err);
    return NextResponse.json(
      { error: 'Error validando datos' },
      { status: 400 }
    );
  }

  // 3) Mapear cambios (password, role, etc.)
  const messages: string[] = [];

  if (body.password) {
    const hashed = await hashPassword(body.password);
    body.password_hash = hashed;
    delete body.password;
    messages.push('Contraseña actualizada');
  }

  if (body.role) {
    const role = await Role.findOne({ where: { name: body.role } });
    if (!role) {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }
    body.role_id = role.getDataValue('id');
    delete body.role;
    messages.push('Rol actualizado');
  }

  if (body.email) {
    messages.push('Email actualizado');
  }
  if (body.username) {
    messages.push('Nombre de usuario actualizado');
  }

  if (messages.length === 0) {
    messages.push('Sin cambios a aplicar');
  }

  // 4) Ejecutar la actualización
  try {
    const [affected] = await User.update(body, { where: { id } });
    if (!affected) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
  } catch (err) {
    console.error('[PATCH /admin/users/:id] DB update error:', err);
    return NextResponse.json({ error: 'Error actualizando usuario' }, { status: 500 });
  }

  // 5) Responder con mensaje
  return NextResponse.json({ message: messages.join(', ') }, { status: 200 });
}


