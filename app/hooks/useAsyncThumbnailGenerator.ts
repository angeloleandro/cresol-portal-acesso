import { useState, useCallback, useEffect } from 'react'




interface AsyncThumbnailState {
  isGenerating: boolean
  isComplete: boolean
  thumbnailUrl: string | null
  error: string | null
  timestamp: number | null
}

interface UseAsyncThumbnailGeneratorOptions {
  videoId?: string
  videoUrl?: string
  autoStart?: boolean
  timestamp?: number
}

/**
 * useAsyncThumbnailGenerator function
 * @todo Add proper documentation
 */
export function useAsyncThumbnailGenerator(options: UseAsyncThumbnailGeneratorOptions = {}) {
  const { videoId, videoUrl, autoStart = false, timestamp = 1.0 } = options

  const [state, setState] = useState<AsyncThumbnailState>({
    isGenerating: false,
    isComplete: false,
    thumbnailUrl: null,
    error: null,
    timestamp: null
  })

  // Função para iniciar geração assíncrona
  const generateThumbnail = useCallback(async (
    targetVideoId?: string,
    targetVideoUrl?: string,
    targetTimestamp?: number
  ) => {
    const finalVideoId = targetVideoId || videoId
    const finalVideoUrl = targetVideoUrl || videoUrl
    const finalTimestamp = targetTimestamp || timestamp

    if (!finalVideoId || !finalVideoUrl) {
      setState(prev => ({ 
        ...prev, 
        error: 'videoId e videoUrl são obrigatórios para gerar thumbnail',
        isGenerating: false 
      }))
      return null
    }

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      isComplete: false
    }))

    try {
      const response = await fetch('/api/videos/generate-thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: finalVideoId,
          videoUrl: finalVideoUrl,
          timestamp: finalTimestamp
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao gerar thumbnail')
      }

      if (result.success) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          isComplete: true,
          thumbnailUrl: result.thumbnailUrl,
          timestamp: result.timestamp,
          error: null
        }))

        return {
          thumbnailUrl: result.thumbnailUrl,
          timestamp: result.timestamp
        }
      } else {
        throw new Error(result.error || 'Falha na geração de thumbnail')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        isComplete: false,
        error: errorMessage
      }))

      // Log do erro para debugging
      if (process.env.NODE_ENV === 'development') {

      }

      return null
    }
  }, [videoId, videoUrl, timestamp])

  // Função para verificar status atual
  const checkThumbnailStatus = useCallback(async (targetVideoId?: string) => {
    const finalVideoId = targetVideoId || videoId

    if (!finalVideoId) return null

    try {
      const response = await fetch(`/api/videos/generate-thumbnail?videoId=${finalVideoId}`)
      const result = await response.json()

      if (response.ok && result.hasAutoThumbnail) {
        setState(prev => ({
          ...prev,
          isComplete: true,
          thumbnailUrl: result.thumbnailUrl,
          timestamp: result.timestamp
        }))

        return {
          hasAutoThumbnail: result.hasAutoThumbnail,
          thumbnailUrl: result.thumbnailUrl,
          timestamp: result.timestamp
        }
      }

      return result
    } catch (error) {

      return null
    }
  }, [videoId])

  // Auto-start se especificado
  useEffect(() => {
    if (autoStart && videoId && videoUrl && !state.isGenerating && !state.isComplete) {
      // Pequeno delay para evitar conflito com outros processos
      const timer = setTimeout(() => {
        generateThumbnail()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [autoStart, videoId, videoUrl, generateThumbnail, state.isGenerating, state.isComplete])

  // Reset quando videoId muda
  useEffect(() => {
    setState({
      isGenerating: false,
      isComplete: false,
      thumbnailUrl: null,
      error: null,
      timestamp: null
    })
  }, [videoId])

  return {
    ...state,
    generateThumbnail,
    checkThumbnailStatus,
    // Funções utilitárias
    reset: () => setState({
      isGenerating: false,
      isComplete: false,
      thumbnailUrl: null,
      error: null,
      timestamp: null
    })
  }
}