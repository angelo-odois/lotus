import { getDatabase } from './database';

export interface UserData {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalData {
  id: string;
  clientName: string;
  attachmentCount: number;
  status: string;
  formData?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function findUserByEmail(email: string): Promise<UserData | null> {
  const db = await getDatabase();
  
  const result = await db.query(
    `SELECT id, email, password_hash as passwordHash, is_active as isActive, 
            created_at as createdAt, updated_at as updatedAt 
     FROM users 
     WHERE email = ? AND is_active = 1`,
    [email]
  );
  
  return result.length > 0 ? result[0] as UserData : null;
}

export async function findProposals(
  search?: string, 
  limit: number = 20, 
  offset: number = 0
): Promise<{ proposals: ProposalData[]; total: number }> {
  const db = await getDatabase();
  
  let whereClause = '';
  let params: any[] = [];
  
  if (search) {
    whereClause = 'WHERE client_name LIKE ?';
    params.push(`%${search}%`);
  }
  
  const countResult = await db.query(
    `SELECT COUNT(*) as total FROM proposals ${whereClause}`,
    params
  );
  
  const proposals = await db.query(
    `SELECT id, client_name as clientName, attachment_count as attachmentCount,
            status, created_at as createdAt, updated_at as updatedAt
     FROM proposals 
     ${whereClause}
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  
  return {
    proposals: proposals as ProposalData[],
    total: countResult[0].total as number
  };
}

export async function findProposalById(id: string): Promise<ProposalData | null> {
  const db = await getDatabase();
  
  const result = await db.query(
    `SELECT id, client_name as clientName, attachment_count as attachmentCount,
            status, form_data as formData, created_at as createdAt, updated_at as updatedAt
     FROM proposals 
     WHERE id = ?`,
    [id]
  );
  
  return result.length > 0 ? result[0] as ProposalData : null;
}

export async function createProposal(data: {
  id: string;
  clientName: string;
  attachmentCount: number;
  status: string;
  formData: string;
}): Promise<void> {
  const db = await getDatabase();
  
  await db.query(
    `INSERT INTO proposals (id, client_name, attachment_count, status, form_data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [data.id, data.clientName, data.attachmentCount, data.status, data.formData]
  );
}

export async function updateProposalStatus(id: string, status: string): Promise<void> {
  const db = await getDatabase();
  
  await db.query(
    `UPDATE proposals 
     SET status = ?, updated_at = datetime('now') 
     WHERE id = ?`,
    [status, id]
  );
}