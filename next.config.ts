import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
    ],
  },
  output: 'standalone', // Necessário para Docker
  async rewrites() {
    // Proxia chamadas do browser para o backend interno via Docker network.
    // Assim o browser chama /api-backend/... (mesma origem) e o servidor
    // Next.js repassa para http://backend:3001/... internamente.
    return [
      {
        source: '/api-backend/:path*',
        destination: `${process.env.BACKEND_INTERNAL_URL || 'http://backend:3001'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
