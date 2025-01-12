import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

export enum ChatType {
  RIDE = 'ride',
  SUPPORT = 'support'
}

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ChatType })
  type: ChatType;

  @Column('uuid')
  rideId: string;

  @Column('uuid', { array: true })
  participantIds: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    lastMessageAt?: Date;
    lastMessagePreview?: string;
    unreadCounts?: Record<string, number>;
  };

  @OneToMany(() => Message, message => message.chat)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 