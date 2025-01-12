import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Check } from 'typeorm';

export enum ReviewType {
  DRIVER = 'driver',
  PASSENGER = 'passenger'
}

@Entity()
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  rideId: string;

  @Column('uuid')
  reviewerId: string;

  @Column('uuid')
  targetUserId: string;

  @Column({ type: 'enum', enum: ReviewType })
  type: ReviewType;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'jsonb', nullable: true })
  attributes?: {
    punctuality?: number;
    cleanliness?: number;
    communication?: number;
    safety?: number;
  };

  @Column({ default: false })
  isReported: boolean;

  @Column({ type: 'text', nullable: true })
  reportReason?: string;

  @Column({ default: true })
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 