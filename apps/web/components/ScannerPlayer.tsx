'use client'

import { useState, useRef, useEffect } from 'react'
import { useScanner } from '../contexts/ScannerContext'

export default function ScannerPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(75)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { isConnected } = useScanner()

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.src = 'http://localhost:3001/stream'
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err)
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Live Scanner</h2>
        <span className="text-xs text-gray-500">Erie County</span>
      </div>
      
      <div className="space-y-3">
        {/* Hidden audio element */}
        <audio ref={audioRef} />

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={!isConnected}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !isConnected 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isPlaying 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {!isConnected ? '⚠️ Scanner Offline' : isPlaying ? '⏸ Pause' : '▶ Play Live Scanner'}
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
            disabled={!isConnected}
          />
          <span className="text-sm text-gray-600 w-10 text-right">{volume}%</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs">
          <span className={`flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`} />
            {isConnected ? (isPlaying ? 'Streaming' : 'Ready') : 'Offline'}
          </span>
          <span className="text-gray-500">
            {isConnected ? '47 listeners' : 'No connection'}
          </span>
        </div>
      </div>
    </div>
  )
}