import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Lotus API funcionando',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}