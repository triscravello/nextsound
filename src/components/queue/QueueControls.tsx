import React from 'react';
import { FiTrash2, FiCopy } from 'react-icons/fi';
import { cn } from '@/utils';

interface QueueControlsProps {
  songCount: number;
  upcomingCount: number;
  onClearQueue: () => void;
  onRemoveDuplicates: () => void;
}

export const QueueControls: React.FC<QueueControlsProps> = ({
  songCount,
  upcomingCount,
  onClearQueue,
  onRemoveDuplicates,
}) => {
  if (songCount === 0) return null;

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-text-secondary">
        <span>{songCount} {songCount === 1 ? 'song' : 'songs'} in queue</span>
        {upcomingCount > 0 && (
          <span>{upcomingCount} upcoming</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRemoveDuplicates}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm',
            'text-gray-600 dark:text-text-secondary',
            'border border-gray-200 dark:border-gray-700',
            'hover:bg-gray-50 dark:hover:bg-hover-gray transition-colors duration-200'
          )}
        >
          <FiCopy className="w-4 h-4" />
          Remove Duplicates
        </button>

        <button
          onClick={onClearQueue}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm',
            'text-red-600 dark:text-red-400',
            'border border-red-200 dark:border-red-900/50',
            'hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200'
          )}
        >
          <FiTrash2 className="w-4 h-4" />
          Clear Queue
        </button>
      </div>
    </div>
  );
};
