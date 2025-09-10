import { NextResponse } from 'next/server'
import { getChatCompletion } from '@/lib/openai'
import { searchContext, buildContextPrompt } from '@/lib/rag'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  console.log('=== CHAT API REQUEST START ===')
  try {
    console.log('Chat: Parsing request body')
    const { message, sessionToken } = await request.json()
    
    console.log('Chat: Request data:', {
      hasMessage: !!message,
      messageLength: message?.length,
      hasSessionToken: !!sessionToken,
      sessionToken: sessionToken?.substring(0, 8) + '...'
    })
    
    if (!message || !sessionToken) {
      console.log('Chat: Missing required fields')
      return NextResponse.json(
        { error: 'Message and session token required' },
        { status: 400 }
      )
    }
    
    // Get session and check query limit
    console.log('Chat: Fetching session from Supabase')
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*, user_profiles(*)')
      .eq('session_token', sessionToken)
      .single()
    
    if (sessionError) {
      console.error('Chat: Session fetch error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      )
    }
    
    if (!session) {
      console.log('Chat: Invalid session token')
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }
    
    console.log('Chat: Session found:', {
      sessionId: session.id,
      hasUser: !!session.user_profiles,
      isSubscribed: session.user_profiles?.is_subscribed,
      queriesUsed: session.user_profiles?.free_queries_used
    })
    
    const user = session.user_profiles
    if (user && !user.is_subscribed && user.free_queries_used >= 3) {
      console.log('Chat: User hit free query limit')
      return NextResponse.json(
        { error: 'Free query limit reached. Please subscribe for unlimited access.' },
        { status: 403 }
      )
    }
    
    // Search for relevant context
    console.log('Chat: Starting context search')
    const searchResults = await searchContext(message)
    console.log('Chat: Building context prompt')
    const context = buildContextPrompt(searchResults)
    
    // Build messages for GPT
    console.log('Chat: Building GPT messages')
    const messages = [
      {
        role: 'system',
        content: `You are a helpful assistant for Sandusky, Ohio residents. You have access to real-time scanner incidents, city documents, and local events. Use the provided context to answer questions accurately. If you don't have specific information, say so clearly.
        
Current Context:
${context}

Current Date: ${new Date().toLocaleDateString()}`
      },
      {
        role: 'user',
        content: message
      }
    ]
    
    console.log('Chat: Context length:', context.length)
    console.log('Chat: Calling OpenAI for completion')
    
    // Get chat completion
    const completion = await getChatCompletion(messages, false)
    
    if (!completion || !completion.choices || !completion.choices[0]) {
      throw new Error('Invalid response from OpenAI')
    }
    
    const responseContent = completion.choices[0].message.content
    console.log('Chat: Got response from OpenAI, length:', responseContent?.length)
    
    // Store messages in database
    console.log('Chat: Storing messages in database')
    const sessionId = session.id
    
    // Store user message
    const { error: userMsgError } = await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message
    })
    
    if (userMsgError) {
      console.error('Chat: Failed to store user message:', userMsgError)
    }
    
    // Store assistant response
    const { error: assistantMsgError } = await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: responseContent
    })
    
    if (assistantMsgError) {
      console.error('Chat: Failed to store assistant message:', assistantMsgError)
    }
    
    // Update query count if user exists
    if (user) {
      console.log('Chat: Updating user query count')
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ free_queries_used: user.free_queries_used + 1 })
        .eq('id', user.id)
        
      if (updateError) {
        console.error('Chat: Failed to update query count:', updateError)
      }
    }
    
    console.log('Chat: Preparing response')
    const response = {
      response: responseContent,
      sources: {
        incidents: searchResults.incidents.length,
        documents: searchResults.documents.length,
        events: searchResults.events.length
      },
      queriesUsed: user ? user.free_queries_used + 1 : 0
    }
    
    console.log('Chat: Success! Response prepared:', {
      responseLength: responseContent?.length,
      sources: response.sources,
      queriesUsed: response.queriesUsed
    })
    console.log('=== CHAT API REQUEST END ===')
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('=== CHAT API ERROR ===')
    console.error('Chat: Main error:', error)
    console.error('Chat: Error stack:', error.stack)
    console.error('Chat: Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause
    })
    console.log('=== CHAT API REQUEST END (ERROR) ===')
    
    return NextResponse.json(
      { error: `Chat request failed: ${error.message}` },
      { status: 500 }
    )
  }
}