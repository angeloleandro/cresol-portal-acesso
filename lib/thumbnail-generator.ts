/**
 * Canvas API Thumbnail Generator
 * Gera thumbnails automáticos de vídeos usando Canvas API
 */

export interface ThumbnailOptions {
  seekTime?: number; // Tempo em segundos para capturar (default: auto)
  timestamp?: number; // Alias para seekTime para compatibilidade
  maxWidth?: number;  // Largura máxima (default: 1280)
  maxHeight?: number; // Altura máxima (default: 720)
  width?: number;     // Largura específica
  height?: number;    // Altura específica
  quality?: number;   // Qualidade JPEG (default: 0.8)
}

export interface ThumbnailResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  timestamp: number;
}

/**
 * Gera thumbnail do vídeo usando Canvas API
 */
export async function generateVideoThumbnail(
  videoFile: File,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    quality = 0.8
  } = options;

  // Validações iniciais
  if (!videoFile) {
    throw new Error('Arquivo de vídeo é obrigatório');
  }

  if (!videoFile.type.startsWith('video/')) {
    throw new Error('Arquivo deve ser um vídeo');
  }

  // Verificar suporte do navegador
  const support = checkThumbnailSupport();
  if (!support.supported) {
    throw new Error(`Navegador não suporta geração de thumbnails: ${support.reasons.join(', ')}`);
  }

  console.log('🎬 Iniciando geração de thumbnail para:', {
    nome: videoFile.name,
    tamanho: videoFile.size,
    tipo: videoFile.type,
    seekTime: options.seekTime
  });

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

    // Timeout de segurança reduzido
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        console.error('❌ Timeout ao gerar thumbnail após 15 segundos');
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        reject(new Error('Timeout ao gerar thumbnail (15s)'));
      }
    }, 15000);

    // Contador de tentativas para debugging
    let loadAttempts = 0;
    const maxLoadAttempts = 3;

    const attemptLoad = () => {
      loadAttempts++;
      console.log(`🔄 Tentativa ${loadAttempts}/${maxLoadAttempts} de carregamento...`);
      
      video.load();
      
      // Timeout para esta tentativa específica
      const attemptTimeout = setTimeout(() => {
        if (loadAttempts < maxLoadAttempts) {
          console.warn(`⚠️ Tentativa ${loadAttempts} timeout, tentando novamente...`);
          attemptLoad();
        }
      }, 5000);

      video.onloadedmetadata = () => {
        clearTimeout(attemptTimeout);
        console.log('📊 Metadata carregada na tentativa', loadAttempts, ':', {
          duração: video.duration,
          largura: video.videoWidth,
          altura: video.videoHeight,
          readyState: video.readyState,
          networkState: video.networkState
        });

        if (video.duration <= 0 || isNaN(video.duration)) {
          if (loadAttempts < maxLoadAttempts) {
            console.warn('⚠️ Duração inválida, tentando recarregar...');
            attemptLoad();
            return;
          }
          
          clearTimeout(timeout);
          if (!isResolved) {
            isResolved = true;
            console.error('❌ Duração do vídeo permanece inválida após', maxLoadAttempts, 'tentativas');
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            reject(new Error('Vídeo não possui duração válida após múltiplas tentativas'));
          }
          return;
        }

        // Calcular tempo de captura (3 segundos ou 20% do vídeo, o que for menor)
        const seekTime = options.seekTime ?? Math.min(3, video.duration * 0.2);
        const finalSeekTime = Math.max(0, Math.min(seekTime, video.duration - 0.1));
        
        console.log('⏱️ Navegando para timestamp:', finalSeekTime);
        video.currentTime = finalSeekTime;
      };
    };

    video.onseeked = () => {
      try {
        console.log('🎯 Seek completo em:', video.currentTime + 's');

        // Calcular dimensões mantendo aspect ratio
        let { videoWidth: width, videoHeight: height } = video;
        
        if (width <= 0 || height <= 0) {
          throw new Error('Dimensões do vídeo inválidas');
        }

        console.log('📏 Dimensões originais:', { width, height });
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
          console.log('📏 Dimensões redimensionadas:', { width, height, ratio });
        }

        // Configurar canvas
        canvas.width = width;
        canvas.height = height;

        console.log('🎨 Canvas configurado:', { width, height });

        // Desenhar frame do vídeo
        ctx.drawImage(video, 0, 0, width, height);
        console.log('🖼️ Frame desenhado no canvas');

        // Converter para blob
        canvas.toBlob((blob) => {
          clearTimeout(timeout);
          
          if (!isResolved && blob) {
            isResolved = true;
            console.log('✅ Thumbnail gerado com sucesso:', {
              tamanho: blob.size,
              tipo: blob.type,
              timestamp: video.currentTime
            });
            
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
            console.error('❌ Falha ao gerar blob da thumbnail');
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            reject(new Error('Falha ao gerar thumbnail - blob nulo'));
          }
        }, 'image/jpeg', quality);

      } catch (error) {
        clearTimeout(timeout);
        if (!isResolved) {
          isResolved = true;
          console.error('❌ Erro ao processar thumbnail:', error);
          if (videoUrl) URL.revokeObjectURL(videoUrl);
          reject(error instanceof Error ? error : new Error('Erro ao processar thumbnail'));
        }
      }
    };

    video.onerror = (error) => {
      console.error('❌ Erro ao carregar vídeo na tentativa', loadAttempts, ':', error);
      
      if (loadAttempts < maxLoadAttempts) {
        console.warn('⚠️ Erro de carregamento, tentando novamente...');
        setTimeout(() => attemptLoad(), 1000);
        return;
      }
      
      clearTimeout(timeout);
      if (!isResolved) {
        isResolved = true;
        console.error('❌ Falha definitiva ao carregar vídeo após', maxLoadAttempts, 'tentativas');
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        reject(new Error(`Erro ao carregar vídeo para thumbnail (${maxLoadAttempts} tentativas)`));
      }
    };

    video.onabort = () => {
      console.warn('⚠️ Carregamento abortado na tentativa', loadAttempts);
      
      if (loadAttempts < maxLoadAttempts) {
        setTimeout(() => attemptLoad(), 1000);
        return;
      }
      
      clearTimeout(timeout);
      if (!isResolved) {
        isResolved = true;
        console.error('❌ Carregamento foi abortado após', maxLoadAttempts, 'tentativas');
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        reject(new Error('Carregamento do vídeo foi abortado'));
      }
    };

    video.onstalled = () => {
      console.warn('⚠️ Carregamento travado na tentativa', loadAttempts);
    };

    video.onloadstart = () => {
      console.log('🔄 Início do carregamento na tentativa', loadAttempts);
    };

    video.onloadeddata = () => {
      console.log('📊 Dados carregados na tentativa', loadAttempts);
    };

    video.oncanplay = () => {
      console.log('▶️ Pode reproduzir na tentativa', loadAttempts);
    };

    video.oncanplaythrough = () => {
      console.log('🏁 Pode reproduzir completo na tentativa', loadAttempts);
    };

    // Configurar vídeo
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true; // Importante para dispositivos móveis
    video.controls = false; // Garantir que não há controles visuais
    
    // Não usar crossOrigin para arquivos locais
    // video.crossOrigin = 'anonymous';
    
    videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    
    console.log('🔄 Iniciando processo de carregamento do vídeo...', {
      fileName: videoFile.name,
      fileSize: videoFile.size,
      fileType: videoFile.type
    });
    
    // Iniciar primeiro carregamento
    attemptLoad();
  });
}

/**
 * Versão alternativa simples de geração de thumbnail para casos problemáticos
 */
export async function generateVideoThumbnailSimple(
  videoSource: File | string,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  console.log('🔄 Tentando geração simples de thumbnail...');
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas não suportado'));
      return;
    }

    let videoUrl: string;
    let resolved = false;

    const cleanup = () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error('Timeout na geração simples'));
      }
    }, 8000);

    video.addEventListener('loadedmetadata', () => {
      console.log('📊 Metadata simples carregada');
      
      // Usar timestamp/seekTime ou 0 como fallback
      const seekTime = options.seekTime ?? options.timestamp ?? 0;
      video.currentTime = seekTime;
    });

    video.addEventListener('seeked', () => {
      if (resolved) return;
      
      try {
        const { maxWidth = 640, maxHeight = 360, quality = 0.8 } = options;
        let { videoWidth: width, videoHeight: height } = video;
        
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
          if (!resolved && blob) {
            resolved = true;
            console.log('✅ Thumbnail simples gerado');
            cleanup();
            resolve({
              blob,
              url: URL.createObjectURL(blob),
              width,
              height,
              timestamp: video.currentTime
            });
          } else if (!resolved) {
            resolved = true;
            cleanup();
            reject(new Error('Falha ao gerar blob simples'));
          }
        }, 'image/jpeg', quality);

      } catch (error) {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(error);
        }
      }
    });

    video.addEventListener('error', () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error('Erro no carregamento simples'));
      }
    });

    // Configuração mais simples
    video.muted = true;
    video.preload = 'metadata';
    video.controls = false;
    
    // Suportar tanto File quanto URL string
    if (typeof videoSource === 'string') {
      video.src = videoSource;
      videoUrl = '';  // Não precisamos revogar URL externa
    } else {
      videoUrl = URL.createObjectURL(videoSource);
      video.src = videoUrl;
    }
  });
}

/**
 * Gera múltiplos thumbnails em timestamps diferentes
 */
export async function generateMultipleThumbnails(
  videoFile: File,
  timestamps: number[],
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult[]> {
  const results: ThumbnailResult[] = [];
  
  for (const timestamp of timestamps) {
    try {
      const result = await generateVideoThumbnail(videoFile, {
        ...options,
        seekTime: timestamp
      });
      results.push(result);
    } catch (error) {
      console.warn(`Falha ao gerar thumbnail para timestamp ${timestamp}:`, error);
      
      // Tentar versão simples como fallback
      try {
        const simpleResult = await generateVideoThumbnailSimple(videoFile, {
          ...options,
          seekTime: timestamp
        });
        results.push(simpleResult);
        console.log(`✅ Thumbnail simples gerado para timestamp ${timestamp}`);
      } catch (simpleError) {
        console.warn(`Falha também na versão simples para timestamp ${timestamp}:`, simpleError);
      }
    }
  }
  
  return results;
}

/**
 * Upload de thumbnail para Supabase Storage
 */
export async function uploadThumbnailToStorage(
  thumbnailBlob: Blob,
  videoFileName: string
): Promise<string> {
  const { uploadThumbnailWithFallback, ensureVideosBucket } = await import('./supabase-storage');
  
  // Ensure videos bucket exists
  await ensureVideosBucket();
  
  // Upload with fallback strategy
  return await uploadThumbnailWithFallback(thumbnailBlob, videoFileName);
}

/**
 * Verifica se o browser suporta Canvas API para thumbnails
 */
export function checkThumbnailSupport(): {
  supported: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  console.log('🔍 Verificando suporte do navegador para geração de thumbnails...');
  
  // Verificar Canvas 2D
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reasons.push('Canvas 2D context não disponível');
    } else {
      // Testar se o canvas pode desenhar
      try {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 10, 10);
        console.log('✅ Canvas 2D funcional');
      } catch (error) {
        reasons.push('Canvas 2D não funcional');
      }
    }
  } catch (error) {
    reasons.push('Canvas API não suportada');
  }
  
  // Verificar suporte a vídeo
  try {
    const video = document.createElement('video');
    if (!video.canPlayType) {
      reasons.push('Elemento video não suportado');
    } else {
      // Testar formatos de vídeo suportados
      const mp4Support = video.canPlayType('video/mp4');
      const webmSupport = video.canPlayType('video/webm');
      const movSupport = video.canPlayType('video/quicktime');
      
      console.log('🎥 Suporte a formatos de vídeo:', {
        mp4: mp4Support,
        webm: webmSupport,
        mov: movSupport
      });
      
      if (!mp4Support && !webmSupport && !movSupport) {
        reasons.push('Nenhum formato de vídeo suportado');
      }
    }
  } catch (error) {
    reasons.push('Elemento video não disponível');
  }
  
  // Verificar Blob e URL
  if (typeof Blob === 'undefined') {
    reasons.push('Blob API não suportada');
  } else {
    console.log('✅ Blob API disponível');
  }
  
  if (typeof URL.createObjectURL === 'undefined') {
    reasons.push('URL.createObjectURL não suportado');
  } else {
    console.log('✅ URL.createObjectURL disponível');
  }
  
  // Verificar se estamos em um contexto seguro (HTTPS ou localhost)
  const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
  if (!isSecureContext) {
    console.warn('⚠️ Contexto não seguro - algumas funcionalidades podem não funcionar');
  }
  
  // Verificar User Agent para dispositivos móveis conhecidos por problemas
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isIOS = /ipad|iphone|ipod/.test(userAgent);
  
  console.log('📱 Informações do dispositivo:', {
    isMobile,
    isIOS,
    userAgent: userAgent.substring(0, 100) + '...'
  });
  
  if (isIOS) {
    console.warn('⚠️ iOS detectado - pode ter limitações com geração de thumbnails');
  }
  
  const result = {
    supported: reasons.length === 0,
    reasons
  };
  
  console.log(result.supported ? '✅ Navegador suporta geração de thumbnails' : '❌ Navegador NÃO suporta geração de thumbnails:', result.reasons);
  
  return result;
}

/**
 * Cleanup de URLs de objeto criadas
 */
export function cleanupObjectUrls(urls: string[]): void {
  urls.forEach(url => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Erro ao limpar URL de objeto:', error);
    }
  });
}