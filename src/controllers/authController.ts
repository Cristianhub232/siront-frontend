import { Role, User } from "@/models/index";
import { comparePassword } from "@/lib/authUtils";
import { signToken } from "@/lib/jwtUtils";

interface LoginResult {
  message?: string;
  id?: string;
  username?: string;
  token?: string;
  error?: string;
}

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResult> {
  try {
    // 🔍 Buscar el usuario con su rol
    const user = await User.findOne({
      where: { username },
      include: [{ model: Role, as: "role", attributes: ["name"] }],
    });

    if (!user) {
      return { error: "Usuario no encontrado" };
    }

    const passwordHash = user.getDataValue("password_hash");
    const isPasswordValid = await comparePassword(password, passwordHash);

    if (!isPasswordValid) {
      return { error: "Usuario o contraseña inválidos" };
    }

    const userId = user.getDataValue("id");
    const userRole = user.get("role") as { name: string };

    if (!userRole || !userRole.name) {
      return { error: "El usuario no tiene un rol válido asignado" };
    }

    // ✅ Generar token con rol incluido
    const token = signToken({
      id: userId,
      role: userRole.name,
    });

    return {
      message: "Login exitoso",
      id: userId,
      username: user.getDataValue("username"),
      token,
    };
  } catch (err) {
    console.error("[loginUser] Error:", err);
    return { error: "Error interno del servidor" };
  }
}
