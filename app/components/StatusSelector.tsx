'use client';

interface StatusSelectorProps {
  value: string;
  onChange: (value: string) => void;
  showLabel?: boolean;
}

export default function StatusSelector({ value, onChange, showLabel = true }: StatusSelectorProps) {
  const statuses = [
    { value: 'want_to_watch', label: 'Want to Watch', icon: '⭐' },
    { value: 'currently_watching', label: 'Currently Watching', icon: '👀' },
    { value: 'watched', label: 'Watched', icon: '✅' },
    { value: 'dropped', label: 'Dropped', icon: '❌' },
    { value: 'completed', label: 'Completed', icon: '🏆' },
  ];

  return (
    <div>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.icon} {status.label}
          </option>
        ))}
      </select>
    </div>
  );
}

