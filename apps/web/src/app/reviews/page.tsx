'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMyReceivedReviews, getMyGivenReviews } from '@/lib/api/reviews';
import { ReviewCard } from '@/components/reviews/review-card';
import type { Review } from '@/lib/api/reviews';

export default function ReviewsPage() {
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [givenReviews, setGivenReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [receivedResponse, givenResponse] = await Promise.all([
          getMyReceivedReviews(),
          getMyGivenReviews()
        ]);
        
        setReceivedReviews(receivedResponse.data);
        setGivenReviews(givenResponse.data);
      } catch (err) {
        setError('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="received">
            Reviews About Me ({receivedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="given">
            Reviews I've Given ({givenReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          <div className="space-y-4">
            {receivedReviews.length === 0 ? (
              <p className="text-gray-500">No reviews received yet</p>
            ) : (
              receivedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showType
                  className="border border-gray-100"
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="given">
          <div className="space-y-4">
            {givenReviews.length === 0 ? (
              <p className="text-gray-500">You haven't given any reviews yet</p>
            ) : (
              givenReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showType
                  className="border border-gray-100"
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 