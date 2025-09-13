import { NextResponse } from 'next/server';

// Health check super simples para Coolify
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    }
  });
}