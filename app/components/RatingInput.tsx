'use client';

import { useState } from 'react';

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  showLabel?: boolean;
}

export default function RatingInput({ value, onChange, showLabel = true }: RatingInputProps) {
  const [hover, setHover] = useState(0);

  return (
    <div>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating
        </label>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`text-2xl transition-transform hover:scale-110 ${
              star <= (hover || value)
                ? 'text-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          >
            ★
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}

