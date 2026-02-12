"use client"

import { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"

interface CollapsibleTranscriptProps {
  text: string
  label?: string
  maxLength?: number
}

export function CollapsibleTranscript({ text, label = "Transcription:", maxLength = 150 }: CollapsibleTranscriptProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = text.length > maxLength

  if (!shouldTruncate) {
    return (
      <div className="bg-base-200 rounded-lg p-3">
        <p className="text-xs font-medium text-base-content/60 mb-1">{label}</p>
        <p className="text-sm text-base-content/80">{text}</p>
      </div>
    )
  }

  return (
    <div className="bg-base-200 rounded-lg p-3">
      <p className="text-xs font-medium text-base-content/60 mb-1">{label}</p>
      <p className="text-sm text-base-content/80">
        {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="btn btn-ghost btn-xs mt-2 gap-1"
      >
        {isExpanded ? (
          <>
            <ChevronUpIcon className="h-3 w-3" />
            Show less
          </>
        ) : (
          <>
            <ChevronDownIcon className="h-3 w-3" />
            Show more
          </>
        )}
      </button>
    </div>
  )
}
