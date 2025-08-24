import { NextRequest, NextResponse } from 'next/server';
import { xmlsSequelize } from '@/lib/db';
import { jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not defined');
}
const SECRET = new TextEncoder().encode(jwtSecret);

// GET - Obtener una notificación específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const query = `
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
      WHERE n.id = $1
    `;

    const [result] = await xmlsSequelize.query(query, {
      bind: [id],
      type: 'SELECT'
    });

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    const notification = result[0] as any;

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
        updated_at: notification.updated_at,
        creator: {
          id: notification.created_by,
          username: notification.creator_username,
          nombre: notification.creator_nombre,
          apellido: notification.creator_apellido
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo notificación:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo notificación' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar notificación (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();
    const { title, message, type, priority, is_active, expires_at } = body;

    // Validaciones
    if (title && title.length > 255) {
      return NextResponse.json({ success: false, error: 'El título no puede exceder 255 caracteres' }, { status: 400 });
    }

    if (type && !['info', 'warning', 'error', 'success'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Tipo de notificación inválido' }, { status: 400 });
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json({ success: false, error: 'Prioridad inválida' }, { status: 400 });
    }

    // Construir query de actualización dinámicamente
    const updateFields: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      queryParams.push(title);
    }

    if (message !== undefined) {
      updateFields.push(`message = $${paramIndex++}`);
      queryParams.push(message);
    }

    if (type !== undefined) {
      updateFields.push(`type = $${paramIndex++}`);
      queryParams.push(type);
    }

    if (priority !== undefined) {
      updateFields.push(`priority = $${paramIndex++}`);
      queryParams.push(priority);
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      queryParams.push(is_active);
    }

    if (expires_at !== undefined) {
      updateFields.push(`expires_at = $${paramIndex++}`);
      queryParams.push(expires_at);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: 'No hay campos para actualizar' }, { status: 400 });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    queryParams.push(id);

    const updateQuery = `
      UPDATE app.notifications 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, message, type, priority, created_by, is_active, expires_at, created_at, updated_at
    `;

    const [result] = await xmlsSequelize.query(updateQuery, {
      bind: queryParams,
      type: 'SELECT'
    });

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    const notification = result[0] as any;

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
      message: 'Notificación actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando notificación:', error);
    return NextResponse.json(
      { success: false, error: 'Error actualizando notificación' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar notificación (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const deleteQuery = `
      DELETE FROM app.notifications 
      WHERE id = $1
      RETURNING id
    `;

    const [result] = await xmlsSequelize.query(deleteQuery, {
      bind: [id],
      type: 'SELECT'
    });

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando notificación:', error);
    return NextResponse.json(
      { success: false, error: 'Error eliminando notificación' },
      { status: 500 }
    );
  }
} 