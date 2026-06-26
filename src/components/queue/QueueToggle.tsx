import React, { useEffect } from 'react';
import { FiMusic, FiX } from 'react-icons/fi';
import { Button } from 'react-aria-components';
import { useQueueStore } from '@/store/queueStore';
import { cn } from '@/utils';

interface QueueToggleProps {
  className?: string;
  isNotFoundPage?: boolean;
  showBg?: boolean;
  compact?: boolean;
}

export const QueueToggle: React.FC<QueueToggleProps> = ({
  className,
  isNotFoundPage = false,
  showBg = false,
  compact = false,
}) => {
  const { isSidebarOpen, toggleSidebar, songs } = useQueueStore();
  const songCount = songs.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <Button
      onPress={toggleSidebar}
      className={cn(
        'relative flex items-center justify-center px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105',
        isNotFoundPage || showBg
          ? 'border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
          : 'border-2 border-accent-orange/80 bg-black/40 backdrop-blur-sm text-white hover:bg-black/55 hover:border-accent-orange',
        className
      )}
      aria-label={isSidebarOpen ? 'Close queue' : 'Open queue'}
    >
      {isSidebarOpen ? (
        <>
          <FiX className={cn('w-4 h-4', !compact && 'mr-2')} />
          {!compact && <span className="text-sm font-medium">Close Queue</span>}
        </>
      ) : (
        <>
          <FiMusic className={cn('w-4 h-4', !compact && 'mr-2')} />
          {!compact && <span className="text-sm font-medium">Queue</span>}
        </>
      )}

      {songCount > 0 && (
        <span
          className={cn(
            'absolute -top-1.5 -right-1.5 flex items-center justify-center',
            'min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white',
            isSidebarOpen ? 'bg-white/20' : 'bg-accent-orange'
          )}
        >
          {songCount > 99 ? '99+' : songCount}
        </span>
      )}

      {!isSidebarOpen && !compact && (
        <kbd
          className={cn(
            'ml-2 px-1.5 py-0.5 text-xs font-mono rounded border text-[10px] hidden lg:inline',
            isNotFoundPage || showBg
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              : 'bg-white/10 border-white/20 text-gray-300'
          )}
        >
          ⌘Q
        </kbd>
      )}
    </Button>
  );
};
