import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaClock, FaGripVertical } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { QueueSong } from '@/store/queueStore';
import { getImageUrl, cn } from '@/utils';

interface QueueItemProps {
  song: QueueSong;
  index: number;
  onPlay: (song: QueueSong) => void;
  onRemove: (queueId: string) => void;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  song,
  index,
  onPlay,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.queueId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const displayTitle = song.original_title || song.name || song.title || 'Unknown Track';

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300',
        'hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-600/5',
        'hover:border hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10',
        isDragging && 'opacity-50 z-10'
      )}
      onClick={() => onPlay(song)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay(song);
        }
      }}
    >
      <button
        className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <FaGripVertical className="w-3 h-3" />
      </button>

      <span className="shrink-0 text-xs text-gray-400 w-4 text-center">{index + 1}</span>

      <img
        src={getImageUrl(song.poster_path)}
        alt={displayTitle}
        className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0"
      />

      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 dark:text-text-primary truncate text-sm">
          {displayTitle}
        </p>
        <p className="text-xs text-gray-500 dark:text-text-secondary truncate">
          {song.artist || 'Unknown Artist'}
        </p>
      </div>

      {song.duration && (
        <div className="hidden sm:flex items-center text-xs text-gray-400 shrink-0">
          <FaClock className="w-3 h-3 mr-1 opacity-60" />
          {formatDuration(song.duration)}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(song.queueId);
        }}
        className={cn(
          'shrink-0 p-1 rounded-full text-gray-400',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
        )}
        aria-label="Remove from queue"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};
