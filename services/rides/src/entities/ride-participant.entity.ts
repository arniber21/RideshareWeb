import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ride } from './ride.entity';

export enum ParticipantStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

@Entity()
export class RideParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  rideId: string;

  @ManyToOne(() => Ride, ride => ride.participants)
  @JoinColumn({ name: 'rideId' })
  ride: Ride;

  @Column({ type: 'int' })
  numberOfSeats: number;

  @Column({ type: 'enum', enum: ParticipantStatus, default: ParticipantStatus.PENDING })
  status: ParticipantStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'boolean', default: false })
  hasPaid: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 