/**
 * Video Player Component
 * Enterprise-grade video player with accessibility and performance
 */

"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Icon from '../icons/Icon';
import { DashboardVideo } from './VideoGallery.types';
import { loadingAnimations, errorAnimations } from './VideoGallery.animations';

interface VideoPlayerProps {
  video: DashboardVideo;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Universal Video Player Component
 */
export function VideoPlayer({
  video,
  autoplay = false,
  controls = true,
  muted = false,
  loop = false,
  onPlay,
  onPause,
  onEnded,
  onError,
  className
}: VideoPlayerProps) {
  const [playerState, setPlayerState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePlayerReady = useCallback(() => {
    setPlayerState('ready');
  }, []);

  const handlePlayerError = useCallback((error: string) => {
    setPlayerState('error');
    setErrorMessage(error);
    onError?.(error);
  }, [onError]);

  // Determine player type
  const getPlayerComponent = () => {
    if (video.upload_type === 'youtube') {
      return (
        <YouTubePlayer
          video={video}
          autoplay={autoplay}
          muted={muted}
          loop={loop}
          onReady={handlePlayerReady}
          onError={handlePlayerError}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
        />
      );
    }

    if (video.upload_type === 'direct') {
      return (
        <DirectVideoPlayer
          video={video}
          autoplay={autoplay}
          controls={controls}
          muted={muted}
          loop={loop}
          onReady={handlePlayerReady}
          onError={handlePlayerError}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
        />
      );
    }

    return null;
  };

  return (
    <div className={clsx('relative w-full h-full bg-black', className)}>
      <AnimatePresence mode="wait">
        {playerState === 'loading' && (
          <PlayerLoadingState key="loading" />
        )}
        
        {playerState === 'error' && (
          <PlayerErrorState 
            key="error" 
            message={errorMessage}
            onRetry={() => {
              setPlayerState('loading');
              setErrorMessage('');
            }}
          />
        )}
        
        {playerState === 'ready' && (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {getPlayerComponent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * YouTube Player Component
 */
interface YouTubePlayerProps {
  video: DashboardVideo;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  onReady: () => void;
  onError: (error: string) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

function YouTubePlayer({
  video,
  autoplay,
  muted,
  loop,
  onReady,
  onError,
  onPlay,
  onPause,
  onEnded
}: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      onReady();
    };

    const handleError = () => {
      onError('Erro ao carregar vídeo do YouTube');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [onReady, onError]);

  // Build YouTube embed URL
  const getEmbedUrl = () => {
    try {
      const url = new URL(video.video_url);
      let videoId = '';

      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      } else if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v') || '';
      }

      if (!videoId) {
        throw new Error('ID do vídeo não encontrado');
      }

      const params = new URLSearchParams({
        ...(autoplay && { autoplay: '1' }),
        ...(muted && { mute: '1' }),
        ...(loop && { loop: '1', playlist: videoId }),
        rel: '0', // Don't show related videos
        modestbranding: '1', // Modest YouTube logo
        fs: '1', // Enable fullscreen
        cc_load_policy: '1', // Show captions if available
        iv_load_policy: '3' // Hide annotations
      });

      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    } catch (error) {
      onError('URL do YouTube inválida');
      return '';
    }
  };

  const embedUrl = getEmbedUrl();
  
  if (!embedUrl) {
    return null;
  }

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      title={video.title}
      className="w-full h-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
      aria-label={`Player de vídeo: ${video.title}`}
    />
  );
}

/**
 * Direct Video Player Component
 */
interface DirectVideoPlayerProps {
  video: DashboardVideo;
  autoplay: boolean;
  controls: boolean;
  muted: boolean;
  loop: boolean;
  onReady: () => void;
  onError: (error: string) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

function DirectVideoPlayer({
  video,
  autoplay,
  controls,
  muted,
  loop,
  onReady,
  onError,
  onPlay,
  onPause,
  onEnded
}: DirectVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showCustomControls, setShowCustomControls] = useState(!controls);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      onReady();
    };

    const handleError = () => {
      const error = video.error;
      let message = 'Erro ao carregar vídeo';
      
      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            message = 'Reprodução cancelada pelo usuário';
            break;
          case error.MEDIA_ERR_NETWORK:
            message = 'Erro de conexão durante o download';
            break;
          case error.MEDIA_ERR_DECODE:
            message = 'Erro ao decodificar o vídeo';
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = 'Formato de vídeo não suportado';
            break;
        }
      }
      
      onError(message);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [onReady, onError, onPlay, onPause, onEnded]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative w-full h-full group"
      onMouseEnter={() => setShowCustomControls(true)}
      onMouseLeave={() => setShowCustomControls(!controls)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        controls={controls}
        poster={video.thumbnail_url || undefined}
        preload="metadata"
        playsInline
        aria-label={`Player de vídeo: ${video.title}`}
      >
        <source src={video.video_url} type={video.mime_type || 'video/mp4'} />
        
        {/* Fallback content */}
        <div className="flex items-center justify-center h-full text-white p-8">
          <div className="text-center space-y-4">
            <Icon name="video-off" className="w-8 h-8 mx-auto text-neutral-400" />
            <div>
              <p className="mb-4">Seu navegador não suporta reprodução de vídeo.</p>
              <a
                href={video.video_url}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                download
              >
                <Icon name="download" className="w-4 h-4" />
                Baixar vídeo
              </a>
            </div>
          </div>
        </div>
      </video>

      {/* Custom Controls */}
      {showCustomControls && !controls && (
        <CustomVideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onTogglePlay={togglePlay}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
        />
      )}
    </div>
  );
}

/**
 * Custom Video Controls
 */
interface CustomVideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

function CustomVideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onSeek,
  onVolumeChange
}: CustomVideoControlsProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
    >
      <div className="space-y-2">
        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Barra de progresso do vídeo"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
              aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
            >
              <Icon name={isPlaying ? 'pause' : 'play'} className="w-4 h-4" />
            </button>

            {/* Time Display */}
            <div className="text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Icon 
              name={volume > 0.5 ? 'volume-2' : volume > 0 ? 'volume-1' : 'volume-x'} 
              className="w-4 h-4" 
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
              aria-label="Controle de volume"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Player Loading State
 */
function PlayerLoadingState() {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [0.98, 1, 0.98],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }}
      className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-white"
    >
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-b-2 border-primary rounded-full mx-auto"
        />
        <p className="text-lg font-medium">Carregando player...</p>
      </div>
    </motion.div>
  );
}

/**
 * Player Error State
 */
interface PlayerErrorStateProps {
  message: string;
  onRetry: () => void;
}

function PlayerErrorState({ message, onRetry }: PlayerErrorStateProps) {
  return (
    <motion.div
      variants={errorAnimations}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-white"
    >
      <div className="text-center space-y-4 p-8">
        <Icon name="alert-circle" className="w-8 h-8 mx-auto text-red-400" />
        <div>
          <h3 className="text-lg font-semibold mb-2">Erro no player</h3>
          <p className="text-neutral-300 mb-4">{message}</p>
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </motion.div>
  );
}

export default VideoPlayer;