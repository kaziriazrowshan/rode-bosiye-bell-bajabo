import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, ExternalLink, Music2, Radio } from 'lucide-react';

interface BackgroundMusicProps {
  onPlayingChange?: (isPlaying: boolean) => void;
  requiresInteraction: boolean;
  onInteractionDismiss: () => void;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  onPlayingChange,
  requiresInteraction,
  onInteractionDismiss,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(303); // ~5:03

  // Initialize and attempt autoplay on mount
  useEffect(() => {
    const audio = new Audio('/toke_rode_bosiye.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlayingChange?.(true);
      onInteractionDismiss();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPlayingChange?.(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onPlayingChange?.(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    // Attempt direct autoplay
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          onPlayingChange?.(true);
          onInteractionDismiss();
        })
        .catch((err) => {
          console.log('Autoplay was prevented by browser security policy. Waiting for user click/tap anywhere:', err);
        });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, []);

  // Global one-time interaction listener to start music immediately if browser blocked direct autoplay
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            onPlayingChange?.(true);
            onInteractionDismiss();
          })
          .catch((e) => console.warn('Play on first interaction failed', e));
      }
    };

    if (requiresInteraction) {
      window.addEventListener('click', handleFirstUserInteraction, { once: true });
      window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });
      window.addEventListener('keydown', handleFirstUserInteraction, { once: true });
    }

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, [requiresInteraction, onPlayingChange, onInteractionDismiss]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          onPlayingChange?.(true);
          onInteractionDismiss();
        })
        .catch(console.error);
    } else {
      audio.pause();
      setIsPlaying(false);
      onPlayingChange?.(false);
    }
  }, [onPlayingChange, onInteractionDismiss]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = newVol;
    if (newVol === 0) {
      audio.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const targetTime = Number(e.target.value);
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const replaySong = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play()
      .then(() => {
        setIsPlaying(true);
        onPlayingChange?.(true);
      })
      .catch(console.error);
  }, [onPlayingChange]);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full">
      {/* Modern High Fidelity Audio Player Bar */}
      <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3.5">
            <div
              onClick={togglePlay}
              className={`w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-300 cursor-pointer ${
                isPlaying
                  ? 'bg-gradient-to-tr from-rose-600 to-amber-500 shadow-lg shadow-rose-500/25 ring-2 ring-rose-400'
                  : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
              title={isPlaying ? 'Click to pause' : 'Click to play'}
            >
              {isPlaying ? (
                <div className="flex items-end gap-1 h-5">
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0ms] h-full" />
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:150ms] h-3/4" />
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:300ms] h-full" />
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:450ms] h-1/2" />
                </div>
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Radio className="w-3 h-3 mr-1 animate-pulse" />
                  Background Song
                </span>
                <span className="text-xs text-zinc-400 font-medium">Shiva Music</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                Toke Rode Bosiye Bell Bajabo
                <span className="text-xs font-normal text-amber-300 font-bengali">
                  (তোকে রডে বসিয়ে বেল বাজাবো)
                </span>
              </h4>
              <p className="text-xs text-zinc-400">Singer: Narugopal Chakraborty</p>
            </div>
          </div>

          {/* Player Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
            {/* Replay */}
            <button
              onClick={replaySong}
              title="Replay from start"
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause Main Button */}
            <button
              onClick={togglePlay}
              title={isPlaying ? 'Pause Background Song' : 'Play Background Song'}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                  <span>Play Song</span>
                </>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-700/50">
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="text-zinc-400 hover:text-white transition cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16 sm:w-20 md:w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>

            {/* Original YouTube Link */}
            <a
              href="https://youtu.be/LOCA2A2gN-k"
              target="_blank"
              rel="noopener noreferrer"
              title="Open song on YouTube"
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Progress Bar / Track Scrub */}
        <div className="flex items-center gap-3 pt-1 text-xs text-zinc-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 303}
            step="1"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
