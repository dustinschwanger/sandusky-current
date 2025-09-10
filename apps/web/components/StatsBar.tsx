'use client'

import StatsCard from './StatsCard'
import { useScanner } from '../contexts/ScannerContext'

export default function StatsBar() {
  const { transmissions, isConnected } = useScanner()
  
  // Count today's incidents
  const today = new Date().toDateString()
  const todayIncidents = transmissions.filter(t => 
    new Date(t.timestamp).toDateString() === today
  ).length

  // Count active units (unique units in last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const activeUnits = new Set(
    transmissions
      .filter(t => new Date(t.timestamp) > oneHourAgo)
      .map(t => t.unit)
  ).size

  // Mock listener count (will be real when we add audio streaming)
  const listeners = isConnected ? 47 + Math.floor(Math.random() * 10) : 0

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatsCard 
        label="Today's Incidents" 
        value={todayIncidents} 
        trend={todayIncidents > 10 ? 'up' : 'neutral'} 
      />
      <StatsCard 
        label="Active Units" 
        value={activeUnits} 
        trend="neutral" 
      />
      <StatsCard 
        label="Scanner Listeners" 
        value={listeners} 
        trend={isConnected ? 'up' : 'down'} 
      />
    </div>
  )
}