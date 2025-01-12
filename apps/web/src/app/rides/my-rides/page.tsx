'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { getMyBookedRides, updateParticipantStatus } from '@/lib/api/rides';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2 } from 'lucide-react';

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  status: string;
  notes?: string;
  participantStatus: string;
  numberOfSeats: number;
  participantId: string;
  driver: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

function MyRidesContent() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      const response = await getMyBookedRides();
      setRides(response.data);
    } catch (error) {
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (ride: Ride) => {
    try {
      setCompleting(ride.id);
      await updateParticipantStatus(ride.id, ride.participantId, 'COMPLETED');
      toast.success('Ride marked as completed');
      loadRides(); // Reload the rides to get updated status
    } catch (error) {
      toast.error('Failed to mark ride as completed');
    } finally {
      setCompleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canMarkCompleted = (ride: Ride) => {
    return ride.participantStatus === 'CONFIRMED' && 
           ride.status === 'ACTIVE' && 
           new Date(ride.departureTime) <= new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">My Booked Rides</h1>
            <Button
              onClick={() => router.push('/rides/search')}
              className="bg-slate-800 hover:bg-slate-700"
            >
              Find New Rides
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : rides.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-600">You haven't booked any rides yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <Card key={ride.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
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
                          ${ride.pricePerSeat} per seat · {ride.numberOfSeats} seats booked
                        </p>
                        {ride.notes && (
                          <p className="text-sm text-gray-600">Notes: {ride.notes}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(ride.participantStatus)}`}
                          >
                            {ride.participantStatus}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(ride.status)}`}
                          >
                            Ride {ride.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Button
                          onClick={() => router.push(`/rides/${ride.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                        {canMarkCompleted(ride) && (
                          <Button
                            onClick={() => handleMarkCompleted(ride)}
                            disabled={completing === ride.id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {completing === ride.id ? 'Marking...' : 'Mark as Completed'}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={ride.driver?.avatar} alt={ride.driver?.name} />
                          <AvatarFallback>
                            {ride.driver?.name?.charAt(0)?.toUpperCase() || 
                             ride.driver?.email?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Driver: {ride.driver?.name}
                          </p>
                          <p className="text-sm text-gray-600">{ride.driver?.email}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MyRidesPage() {
  return (
    <ProtectedRoute requireAuth>
      <MyRidesContent />
    </ProtectedRoute>
  );
} 