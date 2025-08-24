import { NextRequest, NextResponse } from "next/server";
import { logoutUser, verifySession } from "@/controllers/authController";

export async function POST(req: NextRequest) {
  try {
    // Obtener el token de la cookie
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Verificar la sesión
    const sessionResult = await verifySession(token);
    
    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { error: "Sesión inválida" },
        { status: 401 }
      );
    }

    // Obtener información del cliente
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Cerrar sesión
    const result = await logoutUser(
      sessionResult.user.id,
      token,
      ipAddress,
      userAgent
    );

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Crear respuesta y eliminar cookie
    const response = NextResponse.json({
      message: result.message
    });

    // Eliminar la cookie de autenticación
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    console.log(`✅ Logout exitoso para usuario: ${sessionResult.user.username}`);

    return response;
  } catch (error) {
    console.error("❌ Error en endpoint de logout:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
