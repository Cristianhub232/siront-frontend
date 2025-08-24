import { NextRequest, NextResponse } from 'next/server';
import { xmlsSequelize } from '@/lib/db';
import { jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not defined');
}
const SECRET = new TextEncoder().encode(jwtSecret);

// GET - Obtener notificaciones con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;

    // Construir condiciones WHERE
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      whereConditions.push(`n.type = $${paramIndex++}`);
      params.push(type);
    }

    if (priority) {
      whereConditions.push(`n.priority = $${paramIndex++}`);
      params.push(priority);
    }

    if (isActive !== null && isActive !== undefined) {
      whereConditions.push(`n.is_active = $${paramIndex++}`);
      params.push(isActive === 'true');
    }

    if (search) {
      whereConditions.push(`(n.title ILIKE $${paramIndex} OR n.message ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Obtener notificaciones con información del creador
    const notificationsQuery = `
      SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.priority,
        n.created_by,
        n.is_active,
        n.expires_at,
        n.created_at,
        n.updated_at,
        u.username as creator_username,
        u.first_name as creator_nombre,
        u.last_name as creator_apellido
      FROM app.notifications n
      LEFT JOIN app.users u ON n.created_by = u.id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit, offset);

    const notificationsResult = await xmlsSequelize.query(notificationsQuery, {
      bind: params,
      type: 'SELECT'
    });

    // Manejar el formato de respuesta de Sequelize
    let notifications: any[] = [];
    if (Array.isArray(notificationsResult)) {
      notifications = notificationsResult;
    } else if (notificationsResult && Array.isArray(notificationsResult[0])) {
      notifications = notificationsResult[0];
    } else if (notificationsResult && typeof notificationsResult === 'object') {
      notifications = [notificationsResult];
    }

    // Obtener total de registros para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM app.notifications n
      ${whereClause}
    `;

    const [countResult] = await xmlsSequelize.query(countQuery, {
      bind: params.slice(0, -2), // Excluir limit y offset
      type: 'SELECT'
    });

    // Manejar el formato de respuesta de Sequelize
    let countRow;
    if (Array.isArray(countResult)) {
      countRow = countResult[0];
    } else {
      countRow = countResult;
    }

    const total = parseInt((countRow as any).total || '0');
    const totalPages = Math.ceil(total / limit);

    // Obtener estadísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN expires_at < CURRENT_TIMESTAMP THEN 1 END) as expired,
        COUNT(CASE WHEN type = 'info' THEN 1 END) as info_count,
        COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning_count,
        COUNT(CASE WHEN type = 'error' THEN 1 END) as error_count,
        COUNT(CASE WHEN type = 'success' THEN 1 END) as success_count,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_count,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_count,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_count
      FROM app.notifications
    `;

    const [statsResult] = await xmlsSequelize.query(statsQuery, {
      type: 'SELECT'
    });

    // Manejar el formato de respuesta de Sequelize
    let statsRow;
    if (Array.isArray(statsResult)) {
      statsRow = statsResult[0];
    } else {
      statsRow = statsResult;
    }

    const stats = statsRow as any;

    return NextResponse.json({
      success: true,
      data: notifications.map((notification: any) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        created_by: notification.created_by,
        is_active: notification.is_active,
        expires_at: notification.expires_at,
        created_at: notification.created_at,
        updated_at: notification.updated_at,
        creator: {
          id: notification.created_by,
          username: notification.creator_username,
          nombre: notification.creator_nombre,
          apellido: notification.creator_apellido
        }
      })),
      stats: {
        total: parseInt(stats.total),
        active: parseInt(stats.active),
        expired: parseInt(stats.expired),
        by_type: {
          info: parseInt(stats.info_count),
          warning: parseInt(stats.warning_count),
          error: parseInt(stats.error_count),
          success: parseInt(stats.success_count)
        },
        by_priority: {
          low: parseInt(stats.low_count),
          medium: parseInt(stats.medium_count),
          high: parseInt(stats.high_count)
        }
      },
      pagination: {
        page: 1,
        limit: 10,
        total,
        totalPages: Math.ceil(total / 10)
      }
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      { success: false, error: 'Error obteniendo notificaciones', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva notificación (solo admin)
export async function POST(request: NextRequest) {
  try {
    // Verificar token y permisos de admin
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    if (!payload?.role || payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado (solo admin)' }, { status: 403 });
    }

    const body = await request.json();
    const { title, message, type, priority, expires_at } = body;

    // Validaciones
    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Título y mensaje son requeridos' }, { status: 400 });
    }

    if (title.length > 255) {
      return NextResponse.json({ success: false, error: 'El título no puede exceder 255 caracteres' }, { status: 400 });
    }

    if (!['info', 'warning', 'error', 'success'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Tipo de notificación inválido' }, { status: 400 });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json({ success: false, error: 'Prioridad inválida' }, { status: 400 });
    }

    // Insertar notificación
    const insertQuery = `
      INSERT INTO app.notifications (title, message, type, priority, created_by, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, message, type, priority, created_by, is_active, expires_at, created_at, updated_at
    `;

    const result = await xmlsSequelize.query(insertQuery, {
      bind: [title, message, type, priority, payload.id, expires_at || null],
      type: 'SELECT'
    });

    // Manejar el formato de respuesta de Sequelize
    let notification: any;
    if (Array.isArray(result)) {
      notification = result[0];
    } else if (result && Array.isArray(result[0])) {
      notification = result[0][0];
    } else if (result && typeof result === 'object') {
      notification = result;
    }

    if (!notification) {
      throw new Error('No se pudo crear la notificación');
    }

    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        created_by: notification.created_by,
        is_active: notification.is_active,
        expires_at: notification.expires_at,
        created_at: notification.created_at,
        updated_at: notification.updated_at
      },
      message: 'Notificación creada exitosamente'
    });

  } catch (error) {
    console.error('Error creando notificación:', error);
    return NextResponse.json(
      { success: false, error: 'Error creando notificación' },
      { status: 500 }
    );
  }
} 