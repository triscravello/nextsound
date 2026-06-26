import { FC } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import { TrackCard } from "@/components/ui/TrackCard";
import { useQueuePlayback } from "@/hooks/useQueuePlayback";
import { useAudioPlayerContext } from "@/context/audioPlayerContext";
import { ITrack } from "@/types";

interface MusicSlidesProps {
  tracks: ITrack[];
  category: string;
  useModernCards?: boolean;
}

const MusicSlides: FC<MusicSlidesProps> = ({ tracks, category, useModernCards: _useModernCards = true }) => {
  const { playWithQueue } = useQueuePlayback();
  const { currentTrack, isPlaying } = useAudioPlayerContext();

  const handlePlay = (track: ITrack) => {
    playWithQueue(track);
  };

  return (
    <Swiper slidesPerView="auto" spaceBetween={15} className="mySwiper">
      {tracks.map((track) => {
        return (
          <SwiperSlide
            key={track.id}
            className="flex mt-1 flex-col xs:gap-[14px] gap-2 max-w-[170px] rounded-lg"
          >
            <TrackCard
              track={track}
              category={category}
              isPlaying={currentTrack?.id === track.id && isPlaying}
              onPlay={handlePlay}
              variant="detailed"
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default MusicSlides;
