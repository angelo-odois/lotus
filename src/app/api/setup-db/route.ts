import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/postgres';

// Endpoint para criar database e tabelas do Lotus
export async function POST() {
  try {
    console.log('🚀 Configurando database Lotus...');
    
    // 1. Criar database lotus
    try {
      await executeQuery('CREATE DATABASE lotus');
      console.log('✅ Database "lotus" criado');
    } catch (error: any) {
      if (error.code === '42P04') { // Database já existe
        console.log('ℹ️ Database "lotus" já existe');
      } else {
        throw error;
      }
    }
    
    // 2. Verificar se existe
    const dbResult = await executeQuery(`
      SELECT datname FROM pg_database WHERE datname = 'lotus'
    `);
    
    if (dbResult.length === 0) {
      throw new Error('Database "lotus" não foi criado');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database "lotus" configurado com sucesso!',
      database: 'lotus',
      tables: 'Será criado automaticamente na primeira conexão',
      nextStep: 'Atualize DATABASE_URL para apontar para o database "lotus"',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao configurar database:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}