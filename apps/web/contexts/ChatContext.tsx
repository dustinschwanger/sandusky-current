'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface ChatContextType {
  sessionToken: string
  userId: string | null
  freeQueriesUsed: number
  isSubscribed: boolean
  incrementQueryCount: () => Promise<boolean>
  initializeUser: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessionToken, setSessionToken] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [freeQueriesUsed, setFreeQueriesUsed] = useState(0)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    initializeSession()
  }, [])

  const initializeSession = async () => {
    // Check for existing session in localStorage
    let token = localStorage.getItem('chat_session_token')
    
    if (!token) {
      token = uuidv4()
      localStorage.setItem('chat_session_token', token)
    }
    
    setSessionToken(token)
    
    // Check if session exists in database
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('*, user_profiles(*)')
      .eq('session_token', token)
      .single()
    
    if (session?.user_profiles) {
      setUserId(session.user_profiles.id)
      setFreeQueriesUsed(session.user_profiles.free_queries_used)
      setIsSubscribed(session.user_profiles.is_subscribed)
    }
  }

  const initializeUser = async () => {
    if (userId) return
    
    // Create anonymous user
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .insert({})
      .select()
      .single()
    
    if (user) {
      setUserId(user.id)
      
      // Create or update session
      await supabase.from('chat_sessions').upsert({
        session_token: sessionToken,
        user_id: user.id
      })
    }
  }

  const incrementQueryCount = async () => {
    if (!userId) await initializeUser()
    
    if (!isSubscribed && freeQueriesUsed >= 3) {
      return false // Limit reached
    }
    
    const newCount = freeQueriesUsed + 1
    
    await supabase
      .from('user_profiles')
      .update({ free_queries_used: newCount })
      .eq('id', userId)
    
    setFreeQueriesUsed(newCount)
    return true
  }

  return (
    <ChatContext.Provider value={{
      sessionToken,
      userId,
      freeQueriesUsed,
      isSubscribed,
      incrementQueryCount,
      initializeUser
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}