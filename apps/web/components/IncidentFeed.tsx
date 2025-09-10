'use client'

import { useScanner } from '../contexts/ScannerContext'

export default function IncidentFeed() {
  const { summaries } = useScanner()

  const getTypeColor = (category: string) => {
    switch(category) {
      case 'crime': return 'bg-blue-100 text-blue-800'
      case 'fire': return 'bg-red-100 text-red-800'
      case 'medical': return 'bg-green-100 text-green-800'
      case 'accident': return 'bg-orange-100 text-orange-800'
      case 'traffic': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return '🔴'
      case 'high': return '🟠'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return ''
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000)
    
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  // Only show newsworthy summaries
  const incidents = summaries
    .filter(s => s.worthPosting && s.summary)
    .slice(0, 5)

  if (incidents.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        No significant incidents to report
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <div key={incident.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(incident.category)}`}>
                  {incident.category.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">{getTimeAgo(incident.timestamp)}</span>
                <span title={`Severity: ${incident.severity}`}>
                  {getSeverityIcon(incident.severity)}
                </span>
              </div>
              <p className="text-sm text-gray-900 font-medium mb-1">
                {incident.summary}
              </p>
              {incident.location && (
                <p className="text-xs text-gray-600">
                  📍 {incident.location}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}