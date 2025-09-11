import 'reflect-metadata';
import { initializeDatabase } from '../src/lib/database';
import { User } from '../src/entities/User';
import { Proposal } from '../src/entities/Proposal';
import { hashPassword } from '../src/lib/auth';

const sampleClients = [
  'João Silva',
  'Maria Santos',
  'Pedro Oliveira',
  'Ana Costa',
  'Carlos Ferreira',
  'Lucia Mendes',
  'Roberto Lima',
  'Fernanda Rocha',
  'Marcos Almeida',
  'Juliana Barbosa',
  'Antonio Cardoso',
  'Beatriz Souza',
  'Ricardo Pereira',
  'Camila Rodrigues',
  'Eduardo Martins'
];

const statuses = ['draft', 'sent', 'approved', 'rejected'] as const;

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');
  
  try {
    const db = await initializeDatabase();
    
    // Clear existing data if tables exist
    console.log('🗑️  Limpando dados existentes...');
    try {
      await db.getRepository(Proposal).clear();
    } catch (error) {
      console.log('   Tabela proposals não existe ainda - será criada');
    }
    try {
      await db.getRepository(User).clear();
    } catch (error) {
      console.log('   Tabela users não existe ainda - será criada');
    }
    
    // Create admin users
    console.log('👥 Criando usuários admin...');
    const userRepo = db.getRepository(User);
    
    const admin1 = userRepo.create({
      email: 'admin@lotuscidade.com',
      passwordHash: await hashPassword('R03ert@'),
      isActive: true,
    });
    
    const admin2 = userRepo.create({
      email: 'admin@odois.dev',
      passwordHash: await hashPassword('@n63L02025'),
      isActive: true,
    });
    
    await userRepo.save([admin1, admin2]);
    console.log('✅ Usuários criados com sucesso');
    
    // Create sample proposals
    console.log('📄 Criando propostas de exemplo...');
    const proposalRepo = db.getRepository(Proposal);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const now = new Date();
    
    const proposals = sampleClients.map(clientName => {
      const createdAt = randomDate(thirtyDaysAgo, now);
      const updatedAt = new Date(createdAt.getTime() + randomInt(0, 24 * 60 * 60 * 1000)); // Up to 24h later
      
      return proposalRepo.create({
        clientName,
        attachmentCount: randomInt(0, 5),
        status: randomChoice(statuses),
        createdAt,
        updatedAt,
      });
    });
    
    await proposalRepo.save(proposals);
    console.log(`✅ ${proposals.length} propostas criadas com sucesso`);
    
    // Summary
    console.log('\n📊 Resumo do seed:');
    console.log(`👥 Usuários: ${await userRepo.count()}`);
    console.log(`📄 Propostas: ${await proposalRepo.count()}`);
    
    const statusCounts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await proposalRepo.count({ where: { status } })
      }))
    );
    
    console.log('\n📈 Propostas por status:');
    statusCounts.forEach(({ status, count }) => {
      console.log(`  ${status}: ${count}`);
    });
    
    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n🔑 Credenciais de acesso:');
    console.log('  admin@lotuscidade.com / R03ert@');
    console.log('  admin@odois.dev / @n63L02025');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
}

seed();