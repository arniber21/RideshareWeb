'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRide } from '@/lib/api/rides';
import { getRideReviews } from '@/lib/api/reviews';
import { ReviewCard } from '@/components/reviews/review-card';
import { ReviewForm } from '@/components/reviews/review-form';
import { Navbar } from '@/components/layout/navbar';
import type { Review } from '@/lib/api/reviews';
import { toast } from 'sonner';

interface Ride {
  id: string;
  origin: string;
  destination: string;
  driverId: string;
  driver: {
    id: string;
    name: string;
    email: string;
  };
}

export default function RideReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ride, setRide] = useState<Ride | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      
      try {
        const [rideResponse, reviewsResponse] = await Promise.all([
          getRide(params.id as string),
          getRideReviews(params.id as string)
        ]);
        
        if (!rideResponse.data) {
          throw new Error('Ride not found');
        }

        setRide(rideResponse.data);
        setReviews(reviewsResponse.data);
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to load ride details and reviews';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleReviewSuccess = () => {
    // Refresh reviews
    getRideReviews(params.id as string)
      .then(response => {
        setReviews(response.data);
        toast.success('Review submitted successfully');
      })
      .catch(() => {
        const message = 'Failed to refresh reviews';
        setError(message);
        toast.error(message);
      });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (error || !ride) {
      return (
        <div className="p-4">
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error || 'Ride not found'}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold">Reviews for Ride</h1>
          <p className="text-gray-600">
            {ride.origin} → {ride.destination}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Driver: {ride.driver.name || ride.driver.email}
          </p>
        </div>

        {/* Add review section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Add Your Review</h2>
          <ReviewForm
            rideId={params.id as string}
            revieweeId={ride.driverId}
            type="DRIVER"
            onSuccess={handleReviewSuccess}
            onError={(err) => toast.error(err.message)}
          />
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet</p>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showType
                className="border border-gray-100"
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto px-4">
          {renderContent()}
        </div>
      </main>
    </div>
  );
} 