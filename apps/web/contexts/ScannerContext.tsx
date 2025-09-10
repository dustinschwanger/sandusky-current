'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface Transmission {
  id: string
  type: 'police' | 'fire' | 'ems'
  unit: string
  message: string
  timestamp: string
}

interface Transcription {
  id: string
  text: string
  timestamp: string
  confidence: number
  duration: number
  isMock?: boolean
}

interface IncidentSummary {
  id: string
  worthPosting: boolean
  summary: string | null
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  location: string | null
  socialMedia: string | null
  timestamp: string
  transcriptionId: string
  isMock?: boolean
}

interface ScannerContextType {
  transmissions: Transmission[]
  transcriptions: Transcription[]
  summaries: IncidentSummary[]
  isConnected: boolean
  connectionError: string | null
  audioListeners: number
}

const ScannerContext = createContext<ScannerContextType>({
  transmissions: [],
  transcriptions: [],
  summaries: [],
  isConnected: false,
  connectionError: null,
  audioListeners: 0
})

export function ScannerProvider({ children }: { children: React.ReactNode }) {
  const [transmissions, setTransmissions] = useState<Transmission[]>([])
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [summaries, setSummaries] = useState<IncidentSummary[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [audioListeners, setAudioListeners] = useState(0)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001')

    ws.onopen = () => {
      console.log('Connected to scanner service')
      setIsConnected(true)
      setConnectionError(null)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        if (message.type === 'transmission') {
          setTransmissions(prev => [message.data, ...prev].slice(0, 50))
        } else if (message.type === 'transcription_complete') {
          setTranscriptions(prev => [message.data, ...prev].slice(0, 50))
          console.log('New transcription:', message.data.text)
        } else if (message.type === 'incident_summary') {
          setSummaries(prev => [message.data, ...prev].slice(0, 30))
          console.log('Newsworthy incident:', message.data.category, '-', message.data.summary)
        } else if (message.type === 'recording_saved') {
          console.log('Recording saved:', message.data.filename)
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnectionError('Connection error')
    }

    ws.onclose = () => {
      console.log('Disconnected from scanner service')
      setIsConnected(false)
    }

    // Check audio listeners periodically
    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3001/health')
        const data = await response.json()
        setAudioListeners(data.audioClients || 0)
      } catch (error) {
        console.error('Error checking health:', error)
      }
    }, 5000)

    return () => {
      ws.close()
      clearInterval(interval)
    }
  }, [])

  return (
    <ScannerContext.Provider value={{ 
      transmissions, 
      transcriptions,
      summaries,
      isConnected, 
      connectionError,
      audioListeners 
    }}>
      {children}
    </ScannerContext.Provider>
  )
}

export const useScanner = () => useContext(ScannerContext)