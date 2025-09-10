'use client'

import { useState, useEffect } from 'react'

interface Incident {
  id: string
  type: 'police' | 'fire' | 'medical'
  title: string
  location: string
  time: string
  lat?: number
  lng?: number
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // For now, use mock data
    // Later this will fetch from NEXT_PUBLIC_API_URL
    const mockData: Incident[] = [
      {
        id: '1',
        type: 'police',
        title: 'Traffic Stop',
        location: 'Columbus Ave & Hayes Ave',
        time: '5 mins ago',
        lat: 41.4489,
        lng: -82.7080
      },
      {
        id: '2',
        type: 'medical',
        title: 'Medical Emergency',
        location: '1000 Block Cedar Point Dr',
        time: '12 mins ago',
        lat: 41.4812,
        lng: -82.6835
      }
    ]

    setTimeout(() => {
      setIncidents(mockData)
      setLoading(false)
    }, 500)
  }, [])

  return { incidents, loading, error }
}