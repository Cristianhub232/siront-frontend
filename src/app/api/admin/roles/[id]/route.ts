import { NextRequest, NextResponse } from "next/server";
import { Role, User } from "@/models/index";
import { validate as uuidValidate } from "uuid";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  if (!id || !uuidValidate(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }

    const role = await Role.findByPk(id);
    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    role.set("name", name.trim());
    await role.save();

    return NextResponse.json(
      { message: "Rol actualizado", role },
      { status: 200 }
    );
  } catch (err) {
    console.error("[PUT /api/admin/roles/:id] Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("auth_token")?.value
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = await params

  if (!uuidValidate(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    const role = await Role.findByPk(id, {
      include: [{ model: User, as: "users", attributes: ["id"] }],
    })

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 })
    }

    if ((role as any).users && (role as any).users.length > 0) {
      return NextResponse.json(
        { error: "Rol asignado a usuarios" },
        { status: 400 }
      )
    }

    await Role.destroy({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error("[DELETE /api/admin/roles/:id] Error:", err)
    return NextResponse.json(
      { error: "Error eliminando rol" },
      { status: 500 }
    )
  }
}
