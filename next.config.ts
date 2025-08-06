// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["pg", "sequelize"],
  async headers() {
    const allowedOrigin = process.env.URL_BASE || 'http://172.16.56.79:3000';
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigin,
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

export const config = {
  matcher: ['/((?!login|api|_next|favicon.ico).*)'], // 👈 Excluye rutas de login, api, _next y favicon.ico
  runtime: 'edge', // 👈 fuerza ejecución en runtime tradicional, si hay problemas de ejecucion cambiarlo nativo con node
};
