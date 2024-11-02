// components/ReviewComponent.tsx
import React, { useEffect, useState } from "react";

interface Review {
  id: number;
  name: string;
  review: string;
  rating: number;
}

const ReviewComponent: React.FC<{ endpoint: string }> = ({ endpoint }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setReviews(data); // Assuming data is an array of reviews
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [endpoint]);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>Error: {error}</p>;
  if (reviews.length === 0) return <p>No reviews available.</p>;

  return (
    <div>
      <h2>Reviews</h2>
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <strong>{review.name}</strong> ({review.rating} stars)
            <p>{review.review}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewComponent;
