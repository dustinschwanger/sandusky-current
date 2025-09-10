'use client'

import { useScanner } from '../contexts/ScannerContext'

export default function Transcriptions() {
  const { transcriptions } = useScanner()

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDuration = (duration: number) => {
    return `${duration.toFixed(1)}s`
  }

  if (transcriptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Transcriptions</h2>
        <div className="text-gray-500 text-sm text-center py-8">
          Waiting for transcriptions...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Recent Transcriptions</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transcriptions.slice(0, 10).map((transcription) => (
          <div 
            key={transcription.id} 
            className="border-l-4 border-blue-500 pl-3 py-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">
                {formatTime(transcription.timestamp)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {formatDuration(transcription.duration)}
                </span>
                {transcription.isMock && (
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    Mock
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded ${
                  transcription.confidence > 0.9 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {Math.round(transcription.confidence * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-800 italic">
              "{transcription.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}