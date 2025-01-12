import { ridesApi } from '../api';

interface SearchRidesParams {
  origin?: string;
  destination?: string;
  date?: string;
}

interface CreateRideData {
  driverId: string;
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  notes?: string;
  route?: Record<string, any>;
}

interface JoinRideData {
  userId: string;
  numberOfSeats: number;
  notes?: string;
}

export const searchRides = (params: SearchRidesParams) => {
  return ridesApi.get('/api/rides/search', { params });
};

export const createRide = (data: CreateRideData) => {
  return ridesApi.post('/api/rides', data);
};

export const getRide = (id: string) => {
  return ridesApi.get(`/api/rides/${id}`);
};

export const getMyRides = () => {
  return ridesApi.get('/api/rides/driver/me');
};

export const getMyBookedRides = () => {
  return ridesApi.get('/api/rides/rider/me');
};

export const joinRide = (rideId: string, data: JoinRideData) => {
  return ridesApi.post(`/api/rides/${rideId}/join`, data);
};

export const updateRide = (id: string, data: {
  origin: string;
  destination: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  notes?: string;
}) => ridesApi.put(`/api/rides/${id}`, data);

export const updateParticipantStatus = (rideId: string, participantId: string, status: string) => {
  return ridesApi.put(`/api/rides/${rideId}/participants/${participantId}`, { status });
}; 