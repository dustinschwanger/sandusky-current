'use client'

export default function LiveTicker() {
  const updates = [
    { id: 1, text: "🚓 Traffic stop at Cleveland Rd & Perkins Ave", time: "12:45 PM" },
    { id: 2, text: "🚒 Fire unit responding to Columbus Ave", time: "12:38 PM" },
    { id: 3, text: "🚑 EMS transport from Firelands Medical", time: "12:22 PM" },
    { id: 4, text: "🚓 Officer cleared from Venice Rd call", time: "12:15 PM" },
  ]

  return (
    <div className="bg-blue-900 text-white py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm whitespace-nowrap">LIVE</span>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-8 animate-scroll">
              {updates.map((update) => (
                <span key={update.id} className="text-sm whitespace-nowrap">
                  {update.text} • {update.time}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}