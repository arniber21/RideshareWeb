'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ride } from '@/lib/types/ride';
import { joinRide, confirmPassenger, rejectPassenger, cancelRide } from '@/lib/api/rides';
import { toast } from 'react-hot-toast';

interface RideCardProps {
  ride: Ride;
  type?: 'search' | 'manage' | 'passenger';
  currentUserId?: string;
  onUpdate?: (ride: Ride) => void;
}

export function RideCard({ ride, type = 'search', currentUserId, onUpdate }: RideCardProps) {
  const [loading, setLoading] = useState(false);

  const handleJoinRide = async () => {
    try {
      setLoading(true);
      const updatedRide = await joinRide({ rideId: ride.id });
      toast.success('Request sent successfully');
      onUpdate?.(updatedRide);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join ride');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPassenger = async (passengerId: string) => {
    try {
      setLoading(true);
      const updatedRide = await confirmPassenger(ride.id, passengerId);
      toast.success('Passenger confirmed');
      onUpdate?.(updatedRide);
    } catch (error) {
      toast.error('Failed to confirm passenger');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPassenger = async (passengerId: string) => {
    try {
      setLoading(true);
      const updatedRide = await rejectPassenger(ride.id, passengerId);
      toast.success('Passenger rejected');
      onUpdate?.(updatedRide);
    } catch (error) {
      toast.error('Failed to reject passenger');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    try {
      setLoading(true);
      const updatedRide = await cancelRide(ride.id);
      toast.success('Ride cancelled');
      onUpdate?.(updatedRide);
    } catch (error) {
      toast.error('Failed to cancel ride');
    } finally {
      setLoading(false);
    }
  };

  const isDriver = currentUserId === ride.driverId;
  const isPassenger = ride.passengers.some(p => p.id === currentUserId);
  const canJoin = !isDriver && !isPassenger && ride.status === 'pending' && ride.availableSeats > 0;
  const showPassengers = type === 'manage' && isDriver;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {ride.from} → {ride.to}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(ride.date).toLocaleDateString()} at {ride.departureTime}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">${ride.price}</p>
          <p className="text-sm text-gray-500">
            {ride.availableSeats} {ride.availableSeats === 1 ? 'seat' : 'seats'} available
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Driver:</span>
          <Link
            href={`/profile/${ride.driverId}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {ride.driver.email}
          </Link>
          {ride.driver.rating && (
            <span className="text-sm text-yellow-500">★ {ride.driver.rating.toFixed(1)}</span>
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
          {isDriver && ride.status === 'pending' && (
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
              href={`/rides/${ride.id}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              View Details
            </Link>
          )}
        </div>
      </div>

      {showPassengers && ride.passengers.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Passengers</h4>
          <div className="space-y-2">
            {ride.passengers.map((passenger) => (
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