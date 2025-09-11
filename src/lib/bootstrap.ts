import 'reflect-metadata';
import { User } from '@/entities/User';
import { Proposal } from '@/entities/Proposal';

// Force load entities for metadata
export const entities = [User, Proposal];

// Bootstrap function to ensure metadata is loaded
export function bootstrap() {
  // This ensures entities are imported and metadata is available
  console.log('🔧 TypeORM entities loaded:', entities.map(e => e.name));
}