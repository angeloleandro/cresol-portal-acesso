/**
 * Canvas API Thumbnail Generator - Production Version
 * Gera thumbnails automáticos de vídeos usando Canvas API
 */

export interface ThumbnailOptions {
  seekTime?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface ThumbnailResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  timestamp: number;
}

export async function generateVideoThumbnail(
  videoFile: File,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    quality = 0.8
  } = options;

  if (!videoFile || !videoFile.type.startsWith('video/')) {
    throw new Error('Arquivo de vídeo inválido');
  }

  const support = checkThumbnailSupport();
  if (!support.supported) {
    throw new Error(`Navegador não suporta geração de thumbnails: ${support.reasons.join(', ')}`);
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas 2D context não suportado'));
      return;
    }

    let isResolved = false;
    let videoUrl: string;

    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        reject(new Error('Timeout ao gerar thumbnail'));
      }
    }, 15000);

    let loadAttempts = 0;
    const maxLoadAttempts = 3;

    const attemptLoad = () => {
      loadAttempts++;
      video.load();
      
      const attemptTimeout = setTimeout(() => {
        if (loadAttempts < maxLoadAttempts) {
          attemptLoad();
        }
      }, 5000);

      video.onloadedmetadata = () => {
        clearTimeout(attemptTimeout);

        if (video.duration <= 0 || isNaN(video.duration)) {
          if (loadAttempts < maxLoadAttempts) {
            attemptLoad();
            return;
          }
          
          clearTimeout(timeout);
          if (!isResolved) {
            isResolved = true;
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            reject(new Error('Vídeo sem duração válida'));
          }
          return;
        }

        const seekTime = options.seekTime ?? Math.min(3, video.duration * 0.2);
        const finalSeekTime = Math.max(0, Math.min(seekTime, video.duration - 0.1));
        
        video.currentTime = finalSeekTime;
      };
    };

    video.onseeked = () => {
      try {
        let { videoWidth: width, videoHeight: height } = video;
        
        if (width <= 0 || height <= 0) {
          throw new Error('Dimensões do vídeo inválidas');
        }
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(video, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          clearTimeout(timeout);
          if (!isResolved && blob) {
            isResolved = true;
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            
            const url = URL.createObjectURL(blob);
            resolve({
              blob,
              url,
              width,
              height,
              timestamp: video.currentTime
            });
          } else if (!isResolved) {
            isResolved = true;
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            reject(new Error('Falha ao gerar blob da thumbnail'));
          }
        }, 'image/jpeg', quality);

      } catch (error) {
        clearTimeout(timeout);
        if (!isResolved) {
          isResolved = true;
          if (videoUrl) URL.revokeObjectURL(videoUrl);
          reject(error);
        }
      }
    };

    video.onerror = () => {
      if (loadAttempts < maxLoadAttempts) {
        attemptLoad();
      } else {
        clearTimeout(timeout);
        if (!isResolved) {
          isResolved = true;
          if (videoUrl) URL.revokeObjectURL(videoUrl);
          reject(new Error('Falha ao carregar vídeo'));
        }
      }
    };

    video.onabort = () => {
      if (loadAttempts < maxLoadAttempts) {
        attemptLoad();
      }
    };

    video.onstalled = () => {
      if (loadAttempts < maxLoadAttempts) {
        attemptLoad();
      }
    };

    video.onloadstart = () => {};
    video.onloadeddata = () => {};
    video.oncanplay = () => {};
    video.oncanplaythrough = () => {};

    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';

    videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;

    attemptLoad();
  });
}

export async function generateSimpleThumbnail(
  videoFile: File,
  seekTime: number = 3
): Promise<ThumbnailResult> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas não suportado'));
      return;
    }

    let videoUrl: string;
    const timeout = setTimeout(() => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      reject(new Error('Timeout'));
    }, 10000);

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (duration > 0) {
        video.currentTime = Math.min(seekTime, duration * 0.8);
      }
    };

    video.onseeked = () => {
      try {
        const { videoWidth, videoHeight } = video;
        
        if (videoWidth > 0 && videoHeight > 0) {
          canvas.width = Math.min(videoWidth, 1280);
          canvas.height = Math.min(videoHeight, 720);
          
          const scaleX = canvas.width / videoWidth;
          const scaleY = canvas.height / videoHeight;
          const scale = Math.min(scaleX, scaleY);
          
          const scaledWidth = videoWidth * scale;
          const scaledHeight = videoHeight * scale;
          const offsetX = (canvas.width - scaledWidth) / 2;
          const offsetY = (canvas.height - scaledHeight) / 2;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, offsetX, offsetY, scaledWidth, scaledHeight);
          
          canvas.toBlob((blob) => {
            clearTimeout(timeout);
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                blob,
                url,
                width: canvas.width,
                height: canvas.height,
                timestamp: video.currentTime
              });
            } else {
              reject(new Error('Falha ao gerar blob'));
            }
          }, 'image/jpeg', 0.8);
        } else {
          clearTimeout(timeout);
          if (videoUrl) URL.revokeObjectURL(videoUrl);
          reject(new Error('Dimensões inválidas'));
        }
      } catch (error) {
        clearTimeout(timeout);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        reject(error);
      }
    };

    video.onerror = () => {
      clearTimeout(timeout);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      reject(new Error('Erro ao carregar vídeo'));
    };

    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
  });
}

export async function generateThumbnailAt(
  videoFile: File,
  timestamp: number
): Promise<ThumbnailResult | null> {
  try {
    return await generateVideoThumbnail(videoFile, { seekTime: timestamp });
  } catch (error) {
    try {
      return await generateSimpleThumbnail(videoFile, timestamp);
    } catch (simpleError) {
      return null;
    }
  }
}

export function checkThumbnailSupport(): { supported: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let supported = true;

  if (typeof document === 'undefined') {
    supported = false;
    reasons.push('Ambiente servidor');
    return { supported, reasons };
  }

  if (!HTMLCanvasElement) {
    supported = false;
    reasons.push('Canvas não disponível');
  } else {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        supported = false;
        reasons.push('Context 2D não disponível');
      }
    } catch (error) {
      supported = false;
      reasons.push('Erro ao criar canvas');
    }
  }

  if (!HTMLVideoElement) {
    supported = false;
    reasons.push('Video element não disponível');
  } else {
    try {
      const video = document.createElement('video');
      if (!video.canPlayType) {
        supported = false;
        reasons.push('canPlayType não disponível');
      }
    } catch (error) {
      supported = false;
      reasons.push('Erro ao criar video element');
    }
  }

  if (!window.Blob) {
    supported = false;
    reasons.push('Blob API não disponível');
  }

  if (!window.URL || !window.URL.createObjectURL) {
    supported = false;
    reasons.push('URL.createObjectURL não disponível');
  }

  if (!window.isSecureContext) {
    reasons.push('Contexto não seguro');
  }

  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    reasons.push('iOS pode ter limitações');
  }

  return { supported, reasons };
}

export function cleanupObjectURL(url: string): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Erro ao limpar URL de objeto:', error);
    }
  }
}