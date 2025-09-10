'use client'

import { useState, useRef, useEffect } from 'react'
import { useChatContext } from '@/contexts/ChatContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSubscribePrompt, setShowSubscribePrompt] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { sessionToken, freeQueriesUsed, isSubscribed, initializeUser } = useChatContext()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      // Initialize user if needed
      if (!isSubscribed && freeQueriesUsed === 0) {
        await initializeUser()
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionToken
        })
      })

      const data = await response.json()

      if (response.status === 403) {
        setShowSubscribePrompt(true)
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'You\'ve reached your free question limit. Please subscribe to continue asking questions.' 
        }])
      } else if (response.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
        }])
        
        // Show remaining queries if not subscribed
        if (!isSubscribed && data.queriesUsed) {
          const remaining = 3 - data.queriesUsed
          if (remaining > 0 && remaining <= 2) {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `ℹ️ You have ${remaining} free question${remaining === 1 ? '' : 's'} remaining.` 
            }])
          }
        }
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Failed to connect. Please check your connection and try again.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Sandusky Assistant</h2>
        <p className="text-sm text-gray-600 mt-1">
          Ask me about local incidents, city documents, or upcoming events
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-4">👋 Welcome! I can help you with:</p>
            <div className="text-left max-w-md mx-auto space-y-2">
              <p>• Recent police and fire incidents</p>
              <p>• City council decisions and documents</p>
              <p>• Property records and court cases</p>
              <p>• Upcoming local events</p>
              <p>• General questions about Sandusky</p>
            </div>
            <p className="mt-4 text-sm">Try asking: "What incidents happened today?"</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Subscribe Prompt */}
      {showSubscribePrompt && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Subscribe for unlimited questions and premium features.
            <button className="ml-2 text-blue-600 underline">
              Learn More
            </button>
          </p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about incidents, documents, or events..."
          disabled={loading || (!isSubscribed && freeQueriesUsed >= 3)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || (!isSubscribed && freeQueriesUsed >= 3)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      {/* Query Counter */}
      {!isSubscribed && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Free questions used: {freeQueriesUsed}/3
        </p>
      )}
    </div>
  )
}