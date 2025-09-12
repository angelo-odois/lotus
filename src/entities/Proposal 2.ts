import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type ProposalStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', name: 'client_name' })
  @Index()
  clientName!: string;

  @Column({ type: 'integer', name: 'attachment_count', default: 0 })
  attachmentCount!: number;

  @Column({ 
    type: 'text', 
    default: 'draft',
    enum: ['draft', 'sent', 'approved', 'rejected', 'expired']
  })
  status!: ProposalStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}