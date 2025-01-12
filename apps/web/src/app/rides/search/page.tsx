'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { RideSearchForm } from '@/components/rides/ride-search-form';
import { searchRides } from '@/lib/api/rides';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/protected-route';

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  driver: {
    id: string;
    name: string;
    email: string;
  };
}

function SearchRidesContent() {
  const searchParams = useSearchParams();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRides = async () => {
      try {
        const origin = searchParams.get('origin');
        const destination = searchParams.get('destination');
        const date = searchParams.get('date');

        if (origin && destination && date) {
          const response = await searchRides({ origin, destination, date });
          setRides(response.data);
        }
      } catch (error) {
        console.error('Error loading rides:', error);
        toast.error('Failed to load rides');
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, [searchParams]);

  const initialValues = {
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') ? new Date(searchParams.get('date')!) : undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Search Rides</h1>
          
          <RideSearchForm
            showResults={true}
            onSearch={setRides}
            initialValues={initialValues}
          />

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No rides found matching your search criteria.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">
                        {ride.origin} → {ride.destination}
                      </h3>
                      <p className="text-gray-600">
                        {new Date(ride.departureTime).toLocaleDateString()} at{' '}
                        {new Date(ride.departureTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-gray-600">
                        ${ride.pricePerSeat} per seat · {ride.availableSeats} seats available
                      </p>
                      <p className="text-gray-600">
                        Driver: {ride.driver?.name || ride.driver?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.href = `/rides/${ride.id}`}
                      className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchRidesPage() {
  return (
    <ProtectedRoute requireAuth>
      <SearchRidesContent />
    </ProtectedRoute>
  );
} 