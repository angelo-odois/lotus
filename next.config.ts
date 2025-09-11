import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Desabilitar devtools em produção
  productionBrowserSourceMaps: false,
  // swcMinify removido - deprecated no Next.js 15
  // Configurações de ambiente
  env: {
    REACT_EDITOR: '',
  },
  // Configuração do webpack para produção
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Desabilitar React DevTools em produção
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-dom$': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling'
      };
      
      // Remover console.log e devtools em produção
      config.optimization.minimize = true;
    }
    
    // Configuração para Puppeteer no Docker
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('puppeteer');
    }
    
    // Suprimir warnings do TypeORM sobre drivers não utilizados
    config.ignoreWarnings = [
      {
        module: /node_modules\/typeorm/,
        message: /Critical dependency:/,
      },
      {
        module: /node_modules\/typeorm/,
        message: /Module not found:/,
      },
    ];
    
    return config;
  },
  // Configuração experimental para melhorar build
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Configurações para startup mais rápido
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;
