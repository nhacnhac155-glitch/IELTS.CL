import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Headphones, AlertCircle } from 'lucide-react';
import { formatSecondsToTime } from '../utils/formatters';

interface AudioPlayerProps {
  src?: string;
  title?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title = 'Listening Track',
  autoPlay = false,
  onEnded,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback prevented or failed:', e);
        setHasError(true);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setHasError(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onEnded) onEnded();
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.1, 1.25, 0.9];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  return (
    <div className={`p-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl shadow-lg border border-purple-700/50 ${className}`}>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          autoPlay={autoPlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={() => setHasError(true)}
          className="hidden"
        />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-400/20">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
              {title}
            </h4>
            <p className="text-[10px] text-purple-300 truncate">
              IELTS Listening Track Audio Player
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={cycleSpeed}
            className="px-2 py-0.5 rounded-lg bg-purple-800/80 hover:bg-purple-700 text-[10px] font-bold text-purple-200 border border-purple-600/40 transition-colors cursor-pointer"
            title="Tốc độ phát audio"
          >
            {playbackRate}x
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-purple-800/80 hover:bg-purple-700 text-purple-200 transition-colors cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {hasError ? (
        <div className="p-3 bg-purple-950/80 border border-purple-500/40 rounded-xl text-xs text-purple-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Chưa tải được nguồn audio thực tế hoặc định dạng không hỗ trợ. Vui lòng kiểm tra lại file tải lên.</span>
        </div>
      ) : (
        <>
          {/* Progress Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={!src}
              className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-purple-300">
              <span>{formatSecondsToTime(Math.floor(currentTime))}</span>
              <span>{duration > 0 ? formatSecondsToTime(Math.floor(duration)) : '00:00'}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleRestart}
              disabled={!src}
              className="p-2 rounded-full bg-purple-800/60 hover:bg-purple-700 text-purple-200 disabled:opacity-40 transition-colors cursor-pointer"
              title="Phát lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              disabled={!src}
              className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-950/40 transition-all cursor-pointer disabled:opacity-40"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-slate-950" />
                  <span>Tạm Dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Phát Audio</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
