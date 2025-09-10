'use client'

import { useScanner } from '../contexts/ScannerContext'

export default function LiveTicker() {
  const { summaries, isConnected } = useScanner()

  // Format time to 12-hour format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Get emoji based on category
  const getEmoji = (category: string) => {
    switch(category) {
      case 'crime': return '🚓'
      case 'fire': return '🚒'
      case 'medical': return '🚑'
      case 'accident': return '🚗'
      case 'traffic': return '🚦'
      default: return '📡'
    }
  }

  // Only use newsworthy summaries for ticker
  const updates = summaries
    .filter(s => s.worthPosting && s.summary)
    .slice(0, 10)
    .map(s => ({
      id: s.id,
      text: `${getEmoji(s.category)} ${s.summary}`,
      time: formatTime(s.timestamp)
    }))

  // Add default message if no incidents yet
  if (updates.length === 0) {
    updates.push({ 
      id: '1', 
      text: isConnected ? '📡 Scanner monitoring - no significant incidents to report' : '🔴 Connecting to scanner...', 
      time: '' 
    })
  }

  return (
    <div className="bg-blue-900 text-white py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm whitespace-nowrap flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            LIVE
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-8 animate-scroll">
              {updates.map((update) => (
                <span key={update.id} className="text-sm whitespace-nowrap">
                  {update.text} {update.time && `• ${update.time}`}
                </span>
              ))}
              {/* Duplicate for continuous scroll */}
              {updates.map((update) => (
                <span key={`dup-${update.id}`} className="text-sm whitespace-nowrap">
                  {update.text} {update.time && `• ${update.time}`}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}