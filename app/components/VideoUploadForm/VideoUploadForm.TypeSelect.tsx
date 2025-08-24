import { memo, useCallback } from 'react'

import { VideoTypeSelectProps } from './VideoUploadForm.types'




export const VideoUploadFormTypeSelect = memo(({ 
  uploadType, 
  onChange, 
  disabled = false 
}: VideoTypeSelectProps) => {
  
  const handleYouTubeSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && e.target.checked) {
      onChange('youtube')
    }
  }, [disabled, onChange])
  
  const handleDirectSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && e.target.checked) {
      onChange('direct')
    }
  }, [disabled, onChange])
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Tipo de Vídeo
          <span className="text-red-500 ml-1">*</span>
        </label>
        
        <fieldset disabled={disabled}>
          <legend className="sr-only">
            Escolha entre upload do YouTube ou upload direto de arquivo
          </legend>
          
          <div 
            className="flex gap-4"
            role="radiogroup"
            aria-labelledby="upload-type-legend"
            aria-describedby="upload-type-help"
          >
            {/* YouTube Option */}
            <label 
              className={`
                flex items-center gap-2 p-3 border rounded-lg cursor-pointer text-sm font-medium
                transition-all duration-200 hover:border-neutral-400
                ${uploadType === 'youtube' 
                  ? 'border-neutral-500 bg-neutral-50' 
                  : 'border-neutral-300 bg-white'
                }
              `}
              htmlFor="upload-type-youtube"
            >
              <input
                id="upload-type-youtube"
                type="radio"
                name="uploadType"
                value="youtube"
                checked={uploadType === 'youtube'}
                onChange={handleYouTubeSelect}
                disabled={disabled}
                className="w-4 h-4 text-neutral-600 border-neutral-300 focus:ring-2 focus:ring-neutral-500/20"
                aria-describedby="youtube-help"
              />
              <div>
                <div className="text-neutral-900">YouTube</div>
                <div className="text-xs text-neutral-500">Link do vídeo</div>
              </div>
            </label>
            
            {/* Direct Upload Option */}
            <label 
              className={`
                flex items-center gap-2 p-3 border rounded-lg cursor-pointer text-sm font-medium
                transition-all duration-200 hover:border-neutral-400
                ${uploadType === 'direct' 
                  ? 'border-neutral-500 bg-neutral-50' 
                  : 'border-neutral-300 bg-white'
                }
              `}
              htmlFor="upload-type-direct"
            >
              <input
                id="upload-type-direct"
                type="radio"
                name="uploadType"
                value="direct"
                checked={uploadType === 'direct'}
                onChange={handleDirectSelect}
                disabled={disabled}
                className="w-4 h-4 text-neutral-600 border-neutral-300 focus:ring-2 focus:ring-neutral-500/20"
                aria-describedby="direct-help"
              />
              <div>
                <div className="text-neutral-900">Upload Interno</div>
                <div className="text-xs text-neutral-500">Arquivo local</div>
              </div>
            </label>
          </div>
          
          {/* Help text */}
          <div id="upload-type-help" className="text-xs text-neutral-500 mt-2">
            <div id="youtube-help" className={uploadType === 'youtube' ? 'block' : 'hidden'}>
              Insira a URL de um vídeo público do YouTube
            </div>
            <div id="direct-help" className={uploadType === 'direct' ? 'block' : 'hidden'}>
              Envie arquivo de vídeo (MP4, WebM, MOV, AVI - máx. 500MB)
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  )
})

VideoUploadFormTypeSelect.displayName = 'VideoUploadFormTypeSelect'