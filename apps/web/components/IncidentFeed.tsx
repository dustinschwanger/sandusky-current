interface Incident {
  id: string
  type: 'police' | 'fire' | 'medical'
  title: string
  location: string
  time: string
}

const mockIncidents: Incident[] = [
  {
    id: '1',
    type: 'police',
    title: 'Traffic Stop',
    location: 'Columbus Ave & Hayes Ave',
    time: '5 mins ago'
  },
  {
    id: '2',
    type: 'medical',
    title: 'Medical Emergency',
    location: '1000 Block Cedar Point Dr',
    time: '12 mins ago'
  },
  {
    id: '3',
    type: 'fire',
    title: 'Fire Alarm',
    location: 'Sandusky Mall',
    time: '28 mins ago'
  }
]

export default function IncidentFeed() {
  const getTypeColor = (type: Incident['type']) => {
    switch(type) {
      case 'police': return 'bg-blue-100 text-blue-800'
      case 'fire': return 'bg-red-100 text-red-800'
      case 'medical': return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="space-y-3">
      {mockIncidents.map((incident) => (
        <div key={incident.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(incident.type)}`}>
                  {incident.type.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">{incident.time}</span>
              </div>
              <h3 className="font-medium text-gray-900">{incident.title}</h3>
              <p className="text-sm text-gray-600">{incident.location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}