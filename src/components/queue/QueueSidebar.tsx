import React, { useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FiMusic, FiX } from 'react-icons/fi';
import { useQueueStore, QueueSong } from '@/store/queueStore';
import { useAudioPlayerContext } from '@/context/audioPlayerContext';
import { NowPlaying } from './NowPlaying';
import { QueueItem } from './QueueItem';
import { QueueControls } from './QueueControls';
import { cn } from '@/utils';

export const QueueSidebar: React.FC = () => {
  const {
    songs,
    currentIndex,
    isSidebarOpen,
    setSidebarOpen,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    removeDuplicates,
    setCurrentIndex,
  } = useQueueStore();

  const { isPlaying, playTrack, togglePlay, currentTrack } = useAudioPlayerContext();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const currentSong = currentIndex >= 0 ? songs[currentIndex] : null;
  const upcomingSongs = songs.filter((_, i) => i > currentIndex);

  const handlePlay = useCallback(
    (song: QueueSong) => {
      const idx = songs.findIndex((s) => s.queueId === song.queueId);
      if (idx >= 0) {
        setCurrentIndex(idx);
        if (currentTrack?.id === song.id && isPlaying) {
          togglePlay();
        } else {
          playTrack(song);
        }
      }
    },
    [songs, setCurrentIndex, currentTrack?.id, isPlaying, togglePlay, playTrack]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdx = songs.findIndex((s) => s.queueId === active.id);
    const overIdx = songs.findIndex((s) => s.queueId === over.id);

    if (activeIdx !== -1 && overIdx !== -1) {
      reorderQueue(activeIdx, overIdx);
    }
  };

  const isCurrentPlaying =
    currentSong && currentTrack?.id === currentSong.id && isPlaying;

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Mobile backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          <m.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed top-0 right-0 h-full w-full sm:w-80 z-50',
              'flex flex-col',
              'bg-white dark:bg-deep-dark',
              'border-l border-gray-200 dark:border-gray-700',
              'shadow-2xl'
            )}
            role="complementary"
            aria-label="Playback queue"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary">
                Queue
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                aria-label="Close queue"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {songs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <FiMusic className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-text-primary mb-2">
                  Your queue is empty
                </h3>
                <p className="text-sm text-gray-500 dark:text-text-secondary max-w-[200px]">
                  Add songs to your queue using the + button on any track card
                </p>
              </div>
            ) : (
              <>
                {currentSong && (
                  <NowPlaying
                    song={currentSong}
                    isPlaying={!!isCurrentPlaying}
                    onPlay={() => handlePlay(currentSong)}
                    onPause={togglePlay}
                  />
                )}

                {upcomingSongs.length > 0 && (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <p className="px-4 pt-3 pb-1 text-sm font-medium text-gray-500 dark:text-text-secondary">
                      Up Next
                    </p>
                    <div className="flex-1 overflow-y-auto px-2 pb-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={upcomingSongs.map((s) => s.queueId)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-1">
                            {upcomingSongs.map((song, i) => (
                              <QueueItem
                                key={song.queueId}
                                song={song}
                                index={i}
                                onPlay={handlePlay}
                                onRemove={removeFromQueue}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                )}

                {upcomingSongs.length === 0 && currentSong && (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <p className="text-sm text-gray-500 dark:text-text-secondary">
                      No upcoming songs
                    </p>
                  </div>
                )}

                <QueueControls
                  songCount={songs.length}
                  upcomingCount={upcomingSongs.length}
                  onClearQueue={clearQueue}
                  onRemoveDuplicates={removeDuplicates}
                />
              </>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
};
