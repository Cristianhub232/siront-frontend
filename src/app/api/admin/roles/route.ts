import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/models/index";


// GET: listar roles
export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const roles = await Role.findAll({ order: [["createdAt", "DESC"]] });
    return NextResponse.json({ roles }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/roles] Error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// POST: crear nuevo rol
export async function POST(req: NextRequest) {
  // token ya fue validado por middleware
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Nombre de rol inválido" },
        { status: 400 }
      );
    }

    const exists = await Role.findOne({ where: { name: name.trim() } });
    if (exists) {
      return NextResponse.json(
        { error: "Ya existe un rol con ese nombre" },
        { status: 409 }
      );
    }

    const newRole = await Role.create({ name: name.trim() });

    return NextResponse.json(
      { message: "Rol creado exitosamente", role: newRole },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/roles] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


