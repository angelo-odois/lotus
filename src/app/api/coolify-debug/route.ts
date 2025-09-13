import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    domain: process.env.COOLIFY_DOMAIN,
    port: process.env.PORT || '3000',
    hostname: process.env.HOSTNAME || 'localhost',
    service_vars_removed: {
      SERVICE_FQDN: process.env.SERVICE_FQDN ? 'present' : 'not_set',
      SERVICE_URL: process.env.SERVICE_URL ? 'present' : 'not_set'
    }
  });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}