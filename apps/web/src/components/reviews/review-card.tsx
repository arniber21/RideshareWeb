'use client';

import { Star, StarHalf } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Review, ReviewType } from '@/lib/api/reviews';

interface ReviewCardProps {
  review: Review;
  showType?: boolean;
  className?: string;
}

export function ReviewCard({ review, showType = false, className = '' }: ReviewCardProps) {
  const { rating, comment, createdAt, type } = review;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {renderStars(rating)}
        </div>
        {showType && (
          <span className="text-sm font-medium text-gray-500">
            {type === 'DRIVER' ? 'Driver Review' : 'Rider Review'}
          </span>
        )}
      </div>
      
      {comment && (
        <p className="mt-2 text-gray-600">{comment}</p>
      )}
      
      <div className="mt-2 text-sm text-gray-500">
        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </div>
    </div>
  );
} 