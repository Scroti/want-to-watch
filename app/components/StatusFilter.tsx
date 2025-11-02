'use client';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'want_to_watch', label: 'Want to Watch' },
    { value: 'watched', label: 'Watched' },
    { value: 'currently_watching', label: 'Currently Watching' },
    { value: 'dropped', label: 'Dropped' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map((status) => (
        <button
          key={status.value}
          onClick={() => onChange(status.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            value === status.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}

