'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { RideSearchForm } from '@/components/rides/ride-search-form';
import { Card, CardContent } from '@/components/ui/card';

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

export default function HomePage() {
  const [rides, setRides] = useState<Ride[]>([]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Find Your Perfect Ride</h1>
            <p className="text-lg text-slate-600">
              Connect with drivers and riders in your area
            </p>
          </div>

          {/* Search Form */}
          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              <RideSearchForm
                showResults={true}
                onSearch={setRides}
              />
            </CardContent>
          </Card>

          {/* Search Results */}
          {rides.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Available Rides</h2>
              <div className="grid gap-4">
                {rides.map((ride) => (
                  <Card key={ride.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-slate-900">
                            {ride.origin} → {ride.destination}
                          </h3>
                          <p className="text-slate-600">
                            {new Date(ride.departureTime).toLocaleDateString()} at{' '}
                            {new Date(ride.departureTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-slate-600">
                            ${ride.pricePerSeat} per seat · {ride.availableSeats} seats available
                          </p>
                          <p className="text-slate-600">
                            Driver: {ride.driver?.name || ride.driver?.email}
                          </p>
                        </div>
                        <button
                          onClick={() => window.location.href = `/rides/${ride.id}`}
                          className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">Save Money</h3>
              <p className="text-slate-600">Share travel costs with others heading the same way</p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">Travel Together</h3>
              <p className="text-slate-600">Meet new people and make your journey more enjoyable</p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">Help the Planet</h3>
              <p className="text-slate-600">Reduce your carbon footprint by sharing rides</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
