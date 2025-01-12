'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { getRide, joinRide } from '@/lib/api/rides';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  status: string;
  notes?: string;
  driver: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  participants: Array<{
    id: string;
    userId: string;
    numberOfSeats: number;
    status: string;
    user: {
      name: string;
      email: string;
      avatar?: string;
    };
  }>;
}

function RideDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const loadRide = async () => {
      try {
        const response = await getRide(params.id as string);
        setRide(response.data);
      } catch (error) {
        toast.error('Failed to load ride details');
      } finally {
        setLoading(false);
      }
    };

    loadRide();
  }, [params.id]);

  const handleBook = async () => {
    if (!ride || !user) return;

    try {
      setBookingLoading(true);
      await joinRide(ride.id, {
        userId: user.id,
        numberOfSeats,
      });
      toast.success('Ride booked successfully');
      setBookingDialog(false);
      // Refresh ride details
      const response = await getRide(params.id as string);
      setRide(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book ride');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto py-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto py-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-600">Ride not found.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Ride Details</CardTitle>
              <CardDescription>
                View details and book your ride.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {ride.origin} → {ride.destination}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(ride.departureTime).toLocaleDateString()} at{' '}
                    {new Date(ride.departureTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${ride.pricePerSeat} per seat · {ride.availableSeats} seats available
                  </p>
                  {ride.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      Notes: {ride.notes}
                    </p>
                  )}
                </div>
                {user?.id !== ride.driver.id && ride.availableSeats > 0 && (
                  <Button
                    onClick={() => setBookingDialog(true)}
                    className="bg-slate-800 hover:bg-slate-700"
                  >
                    Book Now
                  </Button>
                )}
              </div>

              <div className="border-t pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Driver</h4>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={ride.driver.avatar} alt={ride.driver.name} />
                    <AvatarFallback>
                      {ride.driver.name?.charAt(0)?.toUpperCase() || ride.driver.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ride.driver.name}</p>
                    <p className="text-sm text-gray-600">{ride.driver.email}</p>
                  </div>
                </div>
              </div>

              {ride.participants.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="text-base font-medium text-gray-900 mb-4">Passengers</h4>
                  <div className="space-y-4">
                    {ride.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage 
                              src={participant.user?.avatar} 
                              alt={participant.user?.name || 'User'} 
                            />
                            <AvatarFallback>
                              {participant.user?.name?.charAt(0)?.toUpperCase() || 
                               participant.user?.email?.charAt(0)?.toUpperCase() || 
                               'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{participant.user?.name || 'Anonymous User'}</p>
                            <p className="text-sm text-gray-600">{participant.numberOfSeats} seats</p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            participant.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : participant.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {participant.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Ride</DialogTitle>
            <DialogDescription>
              <div className="text-sm text-gray-600 mt-2">
                <div>From {ride.origin} to {ride.destination}</div>
                <div>
                  {new Date(ride.departureTime).toLocaleDateString()} at{' '}
                  {new Date(ride.departureTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="mt-2">Price per seat: ${ride.pricePerSeat}</div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="seats" className="text-sm font-medium text-gray-700">
                Number of Seats
              </label>
              <Input
                id="seats"
                type="number"
                min={1}
                max={ride.availableSeats}
                value={numberOfSeats}
                onChange={(e) => setNumberOfSeats(parseInt(e.target.value))}
                className="col-span-3"
              />
              <p className="text-sm text-gray-600">
                Total price: ${(ride.pricePerSeat * numberOfSeats).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setBookingDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBook}
              disabled={bookingLoading}
              className="bg-slate-800 hover:bg-slate-700"
            >
              {bookingLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RideDetailsPage() {
  return (
    <ProtectedRoute requireAuth>
      <RideDetailsContent />
    </ProtectedRoute>
  );
} 