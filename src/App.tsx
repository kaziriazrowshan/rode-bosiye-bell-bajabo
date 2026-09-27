import React, { useState, useEffect } from 'react';
import {
  Music,
  Bell,
  Sparkles,
  Volume2,
  Share2,
  Heart,
  Flame,
  Bike
} from 'lucide-react';
import { BackgroundMusic } from './components/BackgroundMusic';
import { PhotoCard } from './components/PhotoCard';
import { bellAudio } from './utils/audio';

const YOUTUBE_VIDEO_ID = 'LOCA2A2gN-k';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [requiresInteraction, setRequiresInteraction] = useState(true);
  const [likes, setLikes] = useState(108);
  const [hasLiked, setHasLiked] = useState(false);
  const [bellCount, setBellCount] = useState(0);

  // When user clicks anywhere, dismiss the interaction requirement
  const handleInteractionDismiss = () => {
    setRequiresInteraction(false);
  };

  const handleRingBell = () => {
    bellAudio.playRing();
    setBellCount((prev) => prev + 1);
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((l) => l + 1);
      setHasLiked(true);
    } else {
      setLikes((l) => l - 1);
      setHasLiked(false);
    }
  };

  return (
    <div
      onClick={handleInteractionDismiss}
      className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white relative selection:bg-rose-500 selection:text-white flex flex-col justify-between overflow-x-hidden"
    >
      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full bg-rose-600/15 blur-[120px] transition-all duration-1000 ${
            isPlaying ? 'scale-125 opacity-70' : 'scale-100 opacity-30'
          }`}
        />
        <div
          className={`absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-amber-500/15 blur-[120px] transition-all duration-1000 ${
            isPlaying ? 'scale-125 opacity-70' : 'scale-100 opacity-30'
          }`}
        />
        <div
          className={`absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-red-600/15 blur-[120px] transition-all duration-1000 ${
            isPlaying ? 'scale-125 opacity-70' : 'scale-100 opacity-30'
          }`}
        />

        {/* Floating notes and bicycle emojis when music is playing */}
        {isPlaying && (
          <>
            <div className="absolute top-[20%] left-[10%] floating-note text-2xl">🎵</div>
            <div className="absolute top-[40%] right-[15%] floating-note text-3xl [animation-delay:1s]">🚲</div>
            <div className="absolute top-[65%] left-[18%] floating-note text-2xl [animation-delay:2s]">🔔</div>
            <div className="absolute top-[30%] left-[80%] floating-note text-3xl [animation-delay:1.5s]">🎶</div>
          </>
        )}
      </div>

      {/* Top Banner & Autoplay Prompter */}
      <header className="relative z-10 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white px-2.5 py-1 rounded shadow-md border border-zinc-200">
              <span className="w-4 h-4 rounded-full bg-red-600 inline-block mr-2 animate-pulse" />
              <span className="text-xs sm:text-sm font-black tracking-tight text-black uppercase font-mono">
                SHIVA MUSIC
              </span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                তোকে রডে বসিয়ে বেল বাজাবো
              </h1>
              <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                Auto-Playing Background Song Portal
              </p>
            </div>
          </div>

          {/* Quick status & Bell ring trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRingBell}
              className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
              title="Ring Bicycle Bell"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Bell: {bellCount}</span>
            </button>

            <button
              onClick={handleLike}
              className={`p-2 rounded-full border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                hasLiked
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
              }`}
              title="Like this meme"
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white text-white' : ''}`} />
              <span className="text-[11px]">{likes}</span>
            </button>
          </div>
        </div>

        {/* Autoplay prompt toast if browser blocked immediate sound */}
        {requiresInteraction && !isPlaying && (
          <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white py-2 px-4 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-inner animate-pulse cursor-pointer">
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>Click or tap anywhere on the screen to blast background song! 🎵</span>
          </div>
        )}
      </header>

      {/* Main Content Showcase */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center gap-6 w-full">
        {/* Photo Card with the exact photo */}
        <PhotoCard isPlaying={isPlaying} />

        {/* Background Song Controller */}
        <BackgroundMusic
          onPlayingChange={setIsPlaying}
          requiresInteraction={requiresInteraction}
          onInteractionDismiss={handleInteractionDismiss}
        />

        {/* Fun Meme Soundboard & Lyrics section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bengali Song Lyrics Card */}
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-300 font-mono">
                Iconic Song Lyrics
              </h3>
            </div>
            <div className="space-y-2 text-zinc-300">
              <p className="font-bengali text-base sm:text-lg font-bold text-amber-200">
                তোকে রডে বসিয়ে বেল বাজাবো,<br />
                তুই হেলান দিবি আমার কোলে।<br />
                আয় সজনি চড়বি আমার হিরো সাইকেলে! 🚲
              </p>
              <p className="text-xs sm:text-sm text-zinc-400 italic pt-1 border-t border-zinc-800">
                "Toke rode bosiye bell bajabo, tui helan dibi amar kole. Aay sajani chorbi amar hero cykele!"
              </p>
            </div>
          </div>

          {/* Song & Meme Information */}
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-300 font-mono">
                  Track Details
                </h3>
              </div>
              <ul className="text-xs sm:text-sm text-zinc-400 space-y-1.5">
                <li>
                  <span className="text-zinc-500 font-medium">Song:</span>{' '}
                  <span className="text-white font-semibold">Toke Rode Bosiye Bell Bajabo</span>
                </li>
                <li>
                  <span className="text-zinc-500 font-medium">Singer:</span>{' '}
                  <span className="text-zinc-200">Narugopal Chakraborty</span>
                </li>
                <li>
                  <span className="text-zinc-500 font-medium">Label:</span>{' '}
                  <span className="text-rose-400 font-semibold">Shiva Music Amar Bangla</span>
                </li>
                <li>
                  <span className="text-zinc-500 font-medium">YouTube:</span>{' '}
                  <a
                    href="https://youtu.be/LOCA2A2gN-k"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline inline-flex items-center gap-1 font-mono text-xs"
                  >
                    youtu.be/LOCA2A2gN-k
                  </a>
                </li>
              </ul>
            </div>

            <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Flame className="w-3.5 h-3.5" /> Viral Bengali Meme
              </span>
              <button
                onClick={handleRingBell}
                className="hover:text-amber-300 transition flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Bike className="w-3.5 h-3.5" /> Ring Bell (ট্রিং ট্রিং)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-zinc-800/80 bg-zinc-950/80 py-4 text-center text-xs text-zinc-500">
        <p>
          Shiva Music Meme Portal • Auto-plays{' '}
          <a
            href="https://youtu.be/LOCA2A2gN-k"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-400 hover:underline font-medium"
          >
            Toke Rode Bosiye Bell Bajabo
          </a>{' '}
          on load
        </p>
      </footer>
    </div>
  );
}
