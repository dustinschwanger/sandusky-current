import StatsBar from '../components/StatsBar'
import IncidentFeed from '../components/IncidentFeed'
import ScannerPlayer from '../components/ScannerPlayer'
import NewsCard from '../components/NewsCard'
import LiveTicker from '../components/LiveTicker'
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
      {/* Live Ticker */}
        <LiveTicker />

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Bar */}
            <StatsBar />

            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow p-4 h-96">
              <h2 className="text-lg font-semibold mb-2">Live Incident Map</h2>
              <div className="bg-gray-100 h-80 rounded flex items-center justify-center">
                <p className="text-gray-500">Map will load here</p>
              </div>
            </div>
          </div>
          {/* News Articles */}
            <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Latest News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NewsCard
                title="Cedar Point Announces New Coaster for 2025 Season"
                excerpt="Cedar Point officials revealed plans for a record-breaking roller coaster that will debut next summer, featuring a 300-foot drop and speeds exceeding 95 mph."
                author="Sarah Johnson"
                date="2 hours ago"
                category="Tourism"
                imageUrl="placeholder"
                />
                <NewsCard
                title="Sandusky City Council Approves Waterfront Development"
                excerpt="In a 5-2 vote, city council approved the $45 million Jackson Pier redevelopment project that will bring new restaurants, shops, and public spaces to the waterfront."
                author="Mike Roberts"
                date="5 hours ago"
                category="Development"
                imageUrl="placeholder"
                />
            </div>
            </div>

          {/* Sidebar - Right Side */}
            <div className="space-y-6">
            {/* Scanner Player */}
            <ScannerPlayer />

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