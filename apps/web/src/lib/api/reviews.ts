import { reviewsApi } from '../api';

export type ReviewType = 'DRIVER' | 'RIDER';

interface CreateReviewData {
  rideId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  type: ReviewType;
}

interface Review {
  id: string;
  rideId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  type: ReviewType;
  createdAt: string;
  updatedAt: string;
}

// Create a new review
export const createReview = (data: CreateReviewData) => {
  return reviewsApi.post<Review>('/api/reviews', data);
};

// Get reviews for a user (as reviewee)
export const getUserReviews = (userId: string, type?: ReviewType) => {
  return reviewsApi.get<Review[]>('/api/reviews/user/' + userId, {
    params: { type }
  });
};

// Get reviews for a specific ride
export const getRideReviews = (rideId: string) => {
  return reviewsApi.get<Review[]>('/api/reviews/ride/' + rideId);
};

// Get my reviews (as reviewer)
export const getMyGivenReviews = () => {
  return reviewsApi.get<Review[]>('/api/reviews/reviewer/me');
};

// Get reviews about me (as reviewee)
export const getMyReceivedReviews = (type?: ReviewType) => {
  return reviewsApi.get<Review[]>('/api/reviews/reviewee/me', {
    params: { type }
  });
};

// Get aggregate rating for a user
export const getUserRating = (userId: string, type?: ReviewType) => {
  return reviewsApi.get<{ rating: number, count: number }>('/api/reviews/rating/' + userId, {
    params: { type }
  });
}; 