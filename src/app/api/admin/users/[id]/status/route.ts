// src/app/api/admin/users/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { User } from "@/models";
import { z } from "zod";
import { updateUserStatusSchema } from "@/schemas/userSchemas";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 2️⃣ Extraer y validar el ID
  const { id } = await params;
  if (!uuidValidate(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  // 3️⃣ Leer el body y manejar JSON malformado
  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch (err) {
    console.error("[PATCH /api/admin/users/:id/status] JSON parse error:", err);
    return NextResponse.json({ error: "JSON malformado" }, { status: 400 });
  }

  // 4️⃣ Validar el contenido con Zod
  let data: { status: 'active' | 'inactive' | 'suspended' };
  try {
    data = updateUserStatusSchema.parse(parsedBody);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err.issues }, { status: 400 });
    }
    console.error("[PATCH /api/admin/users/:id/status] Zod error:", err);
    return NextResponse.json(
      { error: "Error validando datos" },
      { status: 400 }
    );
  }

  // 5️⃣ Actualizar el usuario (soft-delete/reactivar)
  try {
    const [affected] = await User.update(
      { status: data.status },
      { where: { id } }
    );
    if (!affected) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error("[PATCH /api/admin/users/:id/status] DB update error:", err);
    return NextResponse.json(
      { error: "Error actualizando estado" },
      { status: 500 }
    );
  }

  // 6️⃣ Responder éxito sin body
  return NextResponse.json(
    {
      status: data.status,
      message: data.status === 'active'
        ? "Usuario activado correctamente"
        : data.status === 'inactive'
        ? "Usuario desactivado correctamente"
        : "Usuario suspendido correctamente",
    },
    { status: 200 }
  );
}
