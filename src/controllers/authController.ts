import { Role, User, Session, AuditLog, Permission } from "@/models/index";
import { comparePassword } from "@/lib/authUtils";
import { signToken } from "@/lib/jwtUtils";
import { authSequelize } from "@/lib/db";
import { Op } from "sequelize";
import crypto from "crypto";

interface LoginResult {
  message?: string;
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  permissions?: string[];
  token?: string;
  error?: string;
}

interface UserWithPermissions {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  login_attempts: number;
  locked_until: Date | null;
  role: {
    name: string;
    permissions: Array<{
      name: string;
      resource: string;
      action: string;
    }>;
  };
}

export async function loginUser(
  username: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  try {
    console.log(`🔍 Intentando login para usuario: ${username}`);

    // 🔍 Buscar el usuario con su rol y permisos
    const user = await User.findOne({
      where: { 
        username,
        status: { [Op.in]: ['active'] }
      },
      include: [
        { 
          model: Role, 
          as: "role", 
          attributes: ["name", "description"],
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["name", "resource", "action"],
              through: { attributes: [] }
            }
          ]
        }
      ],
    }) as UserWithPermissions | null;

    if (!user) {
      console.log(`❌ Usuario no encontrado o inactivo: ${username}`);
      await logAuditEvent(null, 'login_failed', 'auth', null, {
        username,
        reason: 'user_not_found'
      }, ipAddress, userAgent);
      return { error: "Usuario no encontrado o inactivo" };
    }

    // Verificar si la cuenta está bloqueada
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      console.log(`❌ Cuenta bloqueada para usuario: ${username}`);
      await logAuditEvent(user.id, 'login_failed', 'auth', null, {
        reason: 'account_locked',
        locked_until: user.locked_until
      }, ipAddress, userAgent);
      return { error: "Cuenta bloqueada temporalmente" };
    }

    // Verificar contraseña
    const passwordHash = user.password_hash;
    const isPasswordValid = await comparePassword(password, passwordHash);

    if (!isPasswordValid) {
      console.log(`❌ Contraseña inválida para usuario: ${username}`);
      
      // Incrementar intentos de login
      const newLoginAttempts = (user.login_attempts || 0) + 1;
      await User.update(
        { 
          login_attempts: newLoginAttempts,
          ...(newLoginAttempts >= 5 && { 
            locked_until: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
          })
        },
        { where: { id: user.id } }
      );

      await logAuditEvent(user.id, 'login_failed', 'auth', null, {
        reason: 'invalid_password',
        login_attempts: newLoginAttempts
      }, ipAddress, userAgent);

      return { error: "Usuario o contraseña inválidos" };
    }

    // ✅ Login exitoso - resetear intentos de login
    await User.update(
      { 
        login_attempts: 0,
        locked_until: null,
        last_login: new Date()
      },
      { where: { id: user.id } }
    );

    // Generar token JWT
    const token = signToken({
      id: user.id,
      role: user.role.name,
    });

    // Crear sesión en la base de datos
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await Session.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      ip_address: ipAddress,
      user_agent: userAgent
    });

    // Log de auditoría
    await logAuditEvent(user.id, 'login_success', 'auth', null, {
      ip_address: ipAddress,
      user_agent: userAgent
    }, ipAddress, userAgent);

    console.log(`✅ Login exitoso para usuario: ${username}`);

    return {
      message: "Login exitoso",
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role.name,
      permissions: user.role.permissions.map(p => p.name),
      token,
    };
  } catch (err) {
    console.error("[loginUser] Error:", err);
    return { error: "Error interno del servidor" };
  }
}

export async function logoutUser(
  userId: string,
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ message: string } | { error: string }> {
  try {
    console.log(`🔍 Cerrando sesión para usuario: ${userId}`);

    // Eliminar sesión de la base de datos
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await Session.destroy({
      where: {
        user_id: userId,
        token_hash: tokenHash
      }
    });

    // Log de auditoría
    await logAuditEvent(userId, 'logout', 'auth', null, {
      ip_address: ipAddress,
      user_agent: userAgent
    }, ipAddress, userAgent);

    console.log(`✅ Sesión cerrada para usuario: ${userId}`);

    return { message: "Sesión cerrada exitosamente" };
  } catch (err) {
    console.error("[logoutUser] Error:", err);
    return { error: "Error al cerrar sesión" };
  }
}

export async function verifySession(
  token: string,
  ipAddress?: string
): Promise<{ valid: boolean; user?: any; error?: string }> {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const session = await Session.findOne({
      where: {
        token_hash: tokenHash,
        expires_at: { [Op.gt]: new Date() }
      },
      include: [
        {
          model: User,
          as: 'user',
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['name', 'description']
            }
          ]
        }
      ]
    });

    if (!session) {
      return { valid: false, error: "Sesión inválida o expirada" };
    }

    const sessionData = session.get() as any;
    return { 
      valid: true, 
      user: {
        id: sessionData.user.id,
        username: sessionData.user.username,
        email: sessionData.user.email,
        firstName: sessionData.user.first_name,
        lastName: sessionData.user.last_name,
        role: sessionData.user.role.name
      }
    };
  } catch (err) {
    console.error("[verifySession] Error:", err);
    return { valid: false, error: "Error verificando sesión" };
  }
}

async function logAuditEvent(
  userId: string | null,
  action: string,
  resource: string,
  resourceId: string | null,
  details: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (err) {
    console.error("[logAuditEvent] Error:", err);
  }
}
