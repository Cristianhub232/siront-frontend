import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not defined');
}
const SECRET = new TextEncoder().encode(jwtSecret);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // ✅ Permitir archivos públicos
  if (
    pathname === '/favicon.ico' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/login') ||
    pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico|css|js)$/i)
  ) {
    return NextResponse.next();
  }

  // ✅ Proteger rutas /api/admin/*
  if (pathname.startsWith('/api/admin')) {
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);

      // console.log("🧾 JWT payload:", payload); // 🔍 depuración

      if (!payload?.role || payload.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado (solo admin)' }, { status: 403 });
      }
    } catch (err) {
      console.error("❌ Error verificando token:", err);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    return NextResponse.next();
  }

  // ✅ Proteger páginas del frontend (excepto login y públicas)
  if (!pathname.startsWith('/api')) {
    // Para la página principal, siempre redirigir al login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (!payload?.id) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
