/**
 * VideoUploadFormEnhanced - Modern Enterprise Component
 * Refactored from 784-line monolithic component to modular architecture
 * Now uses the new VideoUploadForm component system
 */

"use client";

import { VideoUploadForm } from './VideoUploadForm'
import type { VideoFormProps } from './VideoUploadForm'

// Legacy component wrapper for backward compatibility
export default function VideoUploadFormEnhanced({ initialData, onSave, onCancel }: VideoFormProps) {
  return (
    <VideoUploadForm
      initialData={initialData}
      onSave={onSave}
      onCancel={onCancel}
    />
  )
}

