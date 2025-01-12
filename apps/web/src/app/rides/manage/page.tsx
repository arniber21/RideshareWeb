'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { getMyRides } from '@/lib/api/rides';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash, Check } from 'lucide-react';

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  status: string;
  notes?: string;
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

function ManageRidesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRides = async () => {
      try {
        const response = await getMyRides();
        setRides(response.data);
      } catch (error) {
        toast.error('Failed to load rides');
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, []);

  const handleEdit = (rideId: string) => {
    router.push(`/rides/${rideId}/edit`);
  };

  const handleDelete = async (rideId: string) => {
    // TODO: Implement delete ride
    toast.error('Delete functionality not implemented yet');
  };

  const handleComplete = async (rideId: string) => {
    // TODO: Implement complete ride
    toast.error('Complete functionality not implemented yet');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">My Rides</h1>
            <Button
              onClick={() => router.push('/rides/post')}
              className="bg-slate-800 hover:bg-slate-700"
            >
              Post New Ride
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : rides.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-600">You haven't posted any rides yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <Card key={ride.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
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
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              ride.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : ride.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {ride.status}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(ride.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleComplete(ride.id)}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(ride.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {ride.participants.length > 0 && (
                      <div className="mt-6 border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Passengers</h4>
                        <div className="space-y-3">
                          {ride.participants.map((participant) => (
                            <div key={participant.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={participant.user.avatar} alt={participant.user.name} />
                                  <AvatarFallback>
                                    {participant.user.name?.charAt(0)?.toUpperCase() || participant.user.email?.charAt(0)?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{participant.user.name}</p>
                                  <p className="text-xs text-gray-600">{participant.numberOfSeats} seats</p>
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ManageRidesPage() {
  return (
    <ProtectedRoute requireAuth requireDriver>
      <ManageRidesContent />
    </ProtectedRoute>
  );
} 