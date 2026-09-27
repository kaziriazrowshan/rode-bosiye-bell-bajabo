import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Clipboard,
  Maximize2,
  Minimize2,
  Download,
  RotateCcw,
  Sparkles,
  Check,
  Bell,
  ZoomIn,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { bellAudio } from '../utils/audio';

interface PhotoCardProps {
  isPlaying: boolean;
}

const LOCAL_STORAGE_KEY = 'toke_rode_custom_photo_data';
const DEFAULT_IMAGE_PATH = '/photo_2026-09-27_18-25-07.jpg?v=2';

export const PhotoCard: React.FC<PhotoCardProps> = ({ isPlaying }) => {
  const [photoSrc, setPhotoSrc] = useState<string>(DEFAULT_IMAGE_PATH);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [isBellRinging, setIsBellRinging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load custom photo from localStorage if saved
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setPhotoSrc(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  const triggerNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleSavePhoto = useCallback((dataUrl: string, msg: string) => {
    setPhotoSrc(dataUrl);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, dataUrl);
    } catch (e) {
      console.warn('Storage limit reached, keeping in memory', e);
    }
    triggerNotification(msg);
  }, []);

  // Global Clipboard Paste Listener (Ctrl+V anywhere on page)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                handleSavePhoto(event.target.result as string, 'Exact photo pasted from clipboard! 🎉');
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleSavePhoto]);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleSavePhoto(event.target.result as string, 'Photo uploaded successfully! 🎉');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleSavePhoto(event.target.result as string, 'Photo dropped and loaded! 🎉');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDefault = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
    setPhotoSrc(DEFAULT_IMAGE_PATH);
    triggerNotification('Restored initial photo');
  };

  const handleRingBell = () => {
    setIsBellRinging(true);
    bellAudio.playRing();
    setTimeout(() => setIsBellRinging(false), 800);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photoSrc;
    a.download = 'photo_2026-09-27_18-25-07.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerNotification('Downloaded photo file');
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-6 z-50 px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-full shadow-2xl flex items-center gap-2 animate-bounce text-sm">
          <Check className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Main Showcase Container */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl transition-all duration-500 ${
          isPlaying
            ? 'p-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 shadow-[0_0_50px_rgba(244,63,94,0.45)]'
            : 'p-1 bg-zinc-800/80 shadow-2xl'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="bg-zinc-950 rounded-[22px] overflow-hidden relative">
          {/* Header Bar of Card */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              {/* Shiva Music Logo Badge */}
              <div className="flex items-center bg-white px-2 py-0.5 rounded shadow-sm border border-zinc-200">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 inline-block mr-1.5" />
                <span className="text-[11px] font-black tracking-tight text-black uppercase font-mono">
                  SHIVA MUSIC
                </span>
              </div>
              <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                photo_2026-09-27_18-25-07.jpg
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              {/* Bell Ring Button */}
              <button
                onClick={handleRingBell}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isBellRinging
                    ? 'bg-amber-400 text-zinc-950 scale-105 shadow-lg shadow-amber-400/50'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-amber-200'
                }`}
                title="Ring Bicycle Bell (Tring Tring!)"
              >
                <Bell className={`w-3.5 h-3.5 ${isBellRinging ? 'animate-spin' : ''}`} />
                <span>বেল বাজাবো (Ring)</span>
              </button>

              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                title="Full View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Photo Display Area */}
          <div
            className={`relative flex items-center justify-center p-3 sm:p-5 bg-gradient-to-b from-zinc-900 to-black select-none transition-all duration-300 ${
              isZoomed ? 'scale-110' : 'scale-100'
            }`}
          >
            {/* Ambient Beat Glow */}
            {isPlaying && (
              <div className="absolute inset-0 bg-rose-500/10 mix-blend-screen pointer-events-none animate-pulse" />
            )}

            {/* Drag & Drop Overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-rose-600/90 z-20 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <Upload className="w-12 h-12 mb-2 animate-bounce" />
                <p className="font-bold text-lg">Drop your exact photo here!</p>
              </div>
            )}

            {/* The Photo itself */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-800/80 group">
              <img
                src={photoSrc}
                alt="Shiva Music meme photo"
                className="w-full h-auto max-h-[520px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                referrerPolicy="no-referrer"
                onError={() => {
                  if (photoSrc !== DEFAULT_IMAGE_PATH) {
                    setPhotoSrc(DEFAULT_IMAGE_PATH);
                  }
                }}
              />

              {/* Watermark / Shiva Music aesthetic tag */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Classic Meme</span>
              </div>
            </div>
          </div>

          {/* Bengali Meme Lyrics Bar */}
          <div className="px-5 py-4 bg-zinc-900/90 border-t border-zinc-800 text-center">
            <p className="font-bengali text-lg sm:text-xl font-bold text-amber-300 tracking-wide">
              "তোকে রডে বসিয়ে বেল বাজাবো, তুই হেলান দিবি আমার কোলে"
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 italic font-light">
              Toke rode bosiye bell bajabo, tui helan dibi amar kole... Aay sajani chorbi amar hero cykele! 🚲🔔
            </p>
          </div>

          {/* Controls Bar for Photo */}
          <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Camera className="w-4 h-4 text-rose-400" />
              <span>Exact Shiva Music meme photo</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Paste helper button */}
              <button
                onClick={async () => {
                  try {
                    const clipboardItems = await navigator.clipboard.read();
                    let found = false;
                    for (const item of clipboardItems) {
                      const imageType = item.types.find(t => t.startsWith('image/'));
                      if (imageType) {
                        const blob = await item.getType(imageType);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          if (e.target?.result) {
                            handleSavePhoto(e.target.result as string, 'Exact photo pasted from clipboard! 🎉');
                          }
                        };
                        reader.readAsDataURL(blob);
                        found = true;
                        break;
                      }
                    }
                    if (!found) {
                      triggerNotification('No image in clipboard. Press Ctrl+V directly to paste!');
                    }
                  } catch (e) {
                    triggerNotification('Press Ctrl+V anywhere on the screen to paste your image!');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white flex items-center gap-1.5 transition cursor-pointer border border-zinc-700/60 font-semibold"
                title="Paste image directly from clipboard (Ctrl+V)"
              >
                <Clipboard className="w-3.5 h-3.5 text-amber-400" />
                <span>Paste (Ctrl+V)</span>
              </button>

              {/* Upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer border border-rose-500/30 font-semibold"
                title="Select photo from your computer/device"
              >
                <Upload className="w-3.5 h-3.5 text-rose-400" />
                <span>Replace / Choose File</span>
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                title="Download photo"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Reset to Default */}
              <button
                onClick={handleResetDefault}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                title="Reset to default meme photo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition cursor-pointer"
            title="Close"
          >
            <Minimize2 className="w-6 h-6" />
          </button>

          <img
            src={photoSrc}
            alt="Fullscreen photo"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-2 border-zinc-800"
            onClick={(e) => e.stopPropagation()}
            referrerPolicy="no-referrer"
          />

          <div
            className="mt-4 flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800 text-sm text-zinc-300"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Shiva Music Meme</span>
            <span>•</span>
            <button
              onClick={handleRingBell}
              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Ring Bell</span>
            </button>
            <span>•</span>
            <button
              onClick={handleDownload}
              className="text-rose-400 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Photo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
