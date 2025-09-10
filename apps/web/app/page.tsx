import StatsCard from '../components/StatsCard'
import IncidentFeed from '../components/IncidentFeed'
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-900">
            Sandusky Current
          </h1>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
            <StatsCard label="Today's Incidents" value={12} trend="up" />
            <StatsCard label="Active Units" value={3} trend="neutral" />
            <StatsCard label="Scanner Listeners" value={47} trend="up" />
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow p-4 h-96">
              <h2 className="text-lg font-semibold mb-2">Live Incident Map</h2>
              <div className="bg-gray-100 h-80 rounded flex items-center justify-center">
                <p className="text-gray-500">Map will load here</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Scanner Player */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Live Scanner</h2>
              <div className="bg-gray-100 h-20 rounded flex items-center justify-center">
                <p className="text-gray-500">Audio player coming soon</p>
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Recent Incidents</h2>
            <IncidentFeed />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}