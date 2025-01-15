'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ride } from '@/lib/types/ride';
import { joinRide, updateParticipantStatus } from '@/lib/api/rides';
import { getUserRating } from '@/lib/api/reviews';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';

interface RideCardProps {
  ride: Ride;
  type?: 'search' | 'manage' | 'passenger';
  currentUserId?: string;
  onUpdate?: (ride: Ride) => void;
}

interface Driver {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
}

interface Passenger {
  id: string;
  email: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

interface RideWithDetails extends Ride {
  driver: Driver;
  passengers: Passenger[];
  from: string;
  to: string;
  date: string;
  departureTime: string;
  price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

function DriverRating({ driverId }: { driverId: string }) {
  const [rating, setRating] = useState<{ rating: number; count: number } | null>(null);

  useEffect(() => {
    const loadRating = async () => {
      try {
        const response = await getUserRating(driverId, 'DRIVER');
        setRating(response.data);
      } catch (error) {
        console.error('Failed to load driver rating:', error);
      }
    };

    loadRating();
  }, [driverId]);

  if (!rating) return null;

  return (
    <div className="flex items-center space-x-1">
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      <span className="text-sm text-gray-600">
        {rating.rating.toFixed(1)} ({rating.count})
      </span>
    </div>
  );
}

export function RideCard({ ride, type = 'search', currentUserId, onUpdate }: RideCardProps) {
  const [loading, setLoading] = useState(false);
  const typedRide = ride as RideWithDetails;

  const handleJoinRide = async () => {
    try {
      setLoading(true);
      const response = await joinRide(typedRide.id, {
        userId: currentUserId!,
        numberOfSeats: 1,
      });
      toast.success('Request sent successfully');
      onUpdate?.(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join ride');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPassenger = async (passengerId: string) => {
    try {
      setLoading(true);
      const response = await updateParticipantStatus(typedRide.id, passengerId, 'confirmed');
      toast.success('Passenger confirmed');
      onUpdate?.(response.data);
    } catch (error: any) {
      toast.error('Failed to confirm passenger');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPassenger = async (passengerId: string) => {
    try {
      setLoading(true);
      const response = await updateParticipantStatus(typedRide.id, passengerId, 'rejected');
      toast.success('Passenger rejected');
      onUpdate?.(response.data);
    } catch (error: any) {
      toast.error('Failed to reject passenger');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    try {
      setLoading(true);
      const response = await updateParticipantStatus(typedRide.id, currentUserId!, 'cancelled');
      toast.success('Ride cancelled');
      onUpdate?.(response.data);
    } catch (error: any) {
      toast.error('Failed to cancel ride');
    } finally {
      setLoading(false);
    }
  };

  const isDriver = currentUserId === typedRide.driverId;
  const isPassenger = typedRide.passengers.some(p => p.id === currentUserId);
  const canJoin = !isDriver && !isPassenger && typedRide.status === 'pending' && typedRide.availableSeats > 0;
  const showPassengers = type === 'manage' && isDriver;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {typedRide.from} → {typedRide.to}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(typedRide.date).toLocaleDateString()} at {typedRide.departureTime}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">${typedRide.price}</p>
          <p className="text-sm text-gray-500">
            {typedRide.availableSeats} {typedRide.availableSeats === 1 ? 'seat' : 'seats'} available
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={`/profile/${typedRide.driverId}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {typedRide.driver.name || typedRide.driver.email}
          </Link>
          <DriverRating driverId={typedRide.driverId} />
          {type !== 'search' && (
            <Link
              href={`/rides/${typedRide.id}/reviews`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Reviews
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {canJoin && (
            <button
              onClick={handleJoinRide}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Join Ride'}
            </button>
          )}
          {isDriver && typedRide.status === 'pending' && (
            <button
              onClick={handleCancelRide}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Cancel Ride'}
            </button>
          )}
          {type !== 'search' && (
            <Link
              href={`/rides/${typedRide.id}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              View Details
            </Link>
          )}
        </div>
      </div>

      {showPassengers && typedRide.passengers.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Passengers</h4>
          <div className="space-y-2">
            {typedRide.passengers.map((passenger) => (
              <div key={passenger.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/profile/${passenger.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {passenger.email}
                  </Link>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      passenger.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : passenger.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {passenger.status}
                  </span>
                </div>
                {passenger.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleConfirmPassenger(passenger.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleRejectPassenger(passenger.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 