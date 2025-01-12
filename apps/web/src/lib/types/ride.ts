export interface Ride {
  id: string;
  driverId: string;
  driver: {
    id: string;
    email: string;
    rating?: number;
  };
  from: string;
  to: string;
  date: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  passengers: {
    id: string;
    email: string;
    status: 'pending' | 'confirmed' | 'rejected';
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRideData {
  from: string;
  to: string;
  date: string;
  departureTime: string;
  price: number;
  availableSeats: number;
}

export interface JoinRideData {
  rideId: string;
  message?: string;
}

export interface SearchRideParams {
  from: string;
  to: string;
  date: string;
} 