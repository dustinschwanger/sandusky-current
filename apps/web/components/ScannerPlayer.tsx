'use client'

import { useState } from 'react'

export default function ScannerPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(75)

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Live Scanner</h2>
        <span className="text-xs text-gray-500">Erie County</span>
      </div>
      
      <div className="space-y-3">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isPlaying 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play Live Scanner'}
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-10 text-right">{volume}%</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs">
          <span className={`flex items-center gap-1 ${isPlaying ? 'text-green-600' : 'text-gray-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`} />
            {isPlaying ? 'Live' : 'Offline'}
          </span>
          <span className="text-gray-500">47 listeners</span>
        </div>
      </div>
    </div>
  )
}