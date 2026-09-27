import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, ExternalLink, Music2, Radio } from 'lucide-react';

interface YouTubeBackgroundMusicProps {
  videoId: string;
  onPlayingChange?: (isPlaying: boolean) => void;
  requiresInteraction: boolean;
  onInteractionDismiss: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export const YouTubeBackgroundMusic: React.FC<YouTubeBackgroundMusicProps> = ({
  videoId,
  onPlayingChange,
  requiresInteraction,
  onInteractionDismiss,
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isReady, setIsReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Initialize YouTube Iframe Player
  useEffect(() => {
    let isCancelled = false;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !containerRef.current) return;

      try {
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '240',
          width: '320',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            loop: 1,
            playlist: videoId,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              if (isCancelled) return;
              setIsReady(true);
              try {
                event.target.setVolume(100);
                event.target.playVideo();
                // Check if playback actually started
                setTimeout(() => {
                  if (playerRef.current) {
                    const state = playerRef.current.getPlayerState();
                    if (state === 1) { // 1 = playing
                      setIsPlaying(true);
                      onPlayingChange?.(true);
                      onInteractionDismiss();
                    }
                  }
                }, 500);
              } catch (err) {
                console.warn('Autoplay prevented by browser:', err);
              }
            },
            onStateChange: (event: any) => {
              if (isCancelled) return;
              // 1 = playing, 2 = paused, 0 = ended
              const playing = event.data === 1;
              setIsPlaying(playing);
              onPlayingChange?.(playing);
              if (playing) {
                onInteractionDismiss();
              }
            },
          },
        });
      } catch (err) {
        console.error('Error creating YouTube player:', err);
      }
    };

    // Load YouTube API script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      isCancelled = true;
    };
  }, [videoId, onPlayingChange, onInteractionDismiss]);

  // Global listener for first user interaction to start audio if blocked
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
          playerRef.current.playVideo();
          setIsPlaying(true);
          onPlayingChange?.(true);
          onInteractionDismiss();
        } catch (e) {
          console.warn('Playback on user click failed', e);
        }
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
  }, [requiresInteraction, volume, onPlayingChange, onInteractionDismiss]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        onPlayingChange?.(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
        onPlayingChange?.(true);
        onInteractionDismiss();
      }
    } catch (e) {
      console.error('Failed to toggle play', e);
    }
  }, [isPlaying, onPlayingChange, onInteractionDismiss]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {
      console.error('Failed to toggle mute', e);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    if (!playerRef.current) return;
    try {
      playerRef.current.setVolume(newVol);
      if (newVol === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    } catch (e) {
      console.error('Failed to set volume', e);
    }
  }, [isMuted]);

  const replaySong = useCallback(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
      setIsPlaying(true);
      onPlayingChange?.(true);
    } catch (e) {
      console.error('Failed to replay', e);
    }
  }, [onPlayingChange]);

  return (
    <div className="w-full">
      {/* Hidden YouTube Iframe Container (or shown when user wants to see the video) */}
      <div className={`overflow-hidden transition-all duration-300 ${showVideo ? 'h-64 my-4 rounded-xl border border-zinc-700 shadow-2xl' : 'h-0 opacity-0 pointer-events-none'}`}>
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Modern Music Player Bar */}
      <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
            isPlaying ? 'bg-gradient-to-tr from-rose-600 to-amber-500 shadow-lg shadow-rose-500/25 ring-2 ring-rose-400' : 'bg-zinc-800'
          }`}>
            {isPlaying ? (
              <div className="flex items-end gap-1 h-5">
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0ms] h-full" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:150ms] h-3/4" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:300ms] h-full" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:450ms] h-1/2" />
              </div>
            ) : (
              <Music2 className="w-6 h-6 text-zinc-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Radio className="w-3 h-3 mr-1 animate-pulse" />
                Background Track
              </span>
              <span className="text-xs text-zinc-400 font-medium">Shiva Music</span>
            </div>
            <h4 className="text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Toke Rode Bosiye Bell Bajabo
              <span className="text-xs font-normal text-zinc-400 font-bengali">
                (তোকে রডে বসিয়ে বেল বাজাবো)
              </span>
            </h4>
            <p className="text-xs text-zinc-400">Singer: Narugopal Chakraborty</p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-3 ml-auto">
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
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-16 md:w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              title={`Volume: ${isMuted ? 0 : volume}%`}
            />
          </div>

          {/* Toggle Video Preview Button */}
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="px-3 py-2 text-xs rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer"
          >
            {showVideo ? 'Hide Video' : 'Show Video'}
          </button>

          {/* Original YouTube Link */}
          <a
            href={`https://youtu.be/${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open song on YouTube"
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
