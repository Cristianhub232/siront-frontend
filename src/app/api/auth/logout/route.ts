import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    message: 'Sesión cerrada correctamente',
  });

  response.cookies.delete('auth_token'); // ✅ forma correcta en App Router (Next 15+)

  return response;
}
