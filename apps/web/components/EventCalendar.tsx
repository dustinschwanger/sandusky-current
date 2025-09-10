'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Event {
  id: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
  category: string
}

export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(10)

    if (data) setEvents(data)
    setLoading(false)
  }

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const { error } = await supabase.from('events').insert({
      title: formData.get('title'),
      description: formData.get('description'),
      location: formData.get('location'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      category: formData.get('category')
    })

    if (!error) {
      setShowAddForm(false)
      fetchEvents()
      e.currentTarget.reset()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddEvent} className="mb-4 p-4 bg-gray-50 rounded space-y-3">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            placeholder="Description"
            className="w-full p-2 border rounded"
            rows={2}
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="w-full p-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="datetime-local"
              name="start_date"
              required
              className="p-2 border rounded"
            />
            <input
              type="datetime-local"
              name="end_date"
              className="p-2 border rounded"
            />
          </div>
          <select name="category" className="w-full p-2 border rounded">
            <option value="community">Community</option>
            <option value="government">Government</option>
            <option value="entertainment">Entertainment</option>
            <option value="sports">Sports</option>
          </select>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Add Event
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No upcoming events</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="border-l-4 border-blue-500 pl-3">
              <h3 className="font-medium">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.description}</p>
              <div className="text-xs text-gray-500 mt-1">
                📍 {event.location} • 📅 {formatDate(event.start_date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}