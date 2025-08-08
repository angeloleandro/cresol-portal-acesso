/**
 * VideoUploadFormClean - Clean Interface Wrapper
 * Simplified and organized video upload form with minimal visual noise
 */

"use client";

import { VideoUploadFormCleanRoot } from './VideoUploadForm/VideoUploadForm.CleanRoot'
import type { VideoFormProps } from './VideoUploadForm'

// Clean wrapper component for backward compatibility
export default function VideoUploadFormClean({ initialData, onSave, onCancel }: VideoFormProps) {
  return (
    <VideoUploadFormCleanRoot
      initialData={initialData}
      onSave={onSave}
      onCancel={onCancel}
    />
  )
}

export { VideoUploadFormCleanRoot }