import { NextRequest, NextResponse } from "next/server";
import { Role, User } from "@/models/index";
import { Op } from "sequelize";

// GET: listar roles
export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    let whereClause = {};
    if (!all) {
      whereClause = { status: 'active' };
    }

    const roles = await Role.findAll({ 
      where: whereClause,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id'],
          required: false
        }
      ]
    });

    // Agregar conteo de usuarios a cada rol
    const rolesWithUserCount = roles.map(role => {
      const roleData = role.get({ plain: true });
      return {
        ...roleData,
        userCount: roleData.users?.length || 0,
        users: undefined // Remover el array de usuarios del response
      };
    });

    return NextResponse.json({ roles: rolesWithUserCount }, { status: 200 });
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
    const { name, description, status = 'active' } = body;

    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Nombre de rol inválido" },
        { status: 400 }
      );
    }

    // Validar estado
    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
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

    const newRole = await Role.create({ 
      name: name.trim(),
      description: description?.trim() || null,
      status: status
    });

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


