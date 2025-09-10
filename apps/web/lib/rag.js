import { generateEmbedding } from './openai'
import { getPineconeIndex } from './pinecone'
import { supabase } from './supabase'

export async function searchContext(query, limit = 5) {
  console.log('RAG: Starting context search for query:', query.substring(0, 100))
  const results = {
    incidents: [],
    documents: [],
    events: []
  }
  
  try {
    // Generate embedding for the query
    console.log('RAG: Generating embedding for query')
    const queryEmbedding = await generateEmbedding(query)
    console.log('RAG: Embedding generated, connecting to Pinecone')
    
    const index = await getPineconeIndex()
    console.log('RAG: Connected to Pinecone index')
    
    // Search documents in Pinecone
    console.log('RAG: Searching documents in Pinecone namespace')
    const docResults = await index.namespace('documents').query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true
    })
    
    console.log('RAG: Found', docResults.matches.length, 'document matches')
    results.documents = docResults.matches.map(match => ({
      content: match.metadata.content,
      title: match.metadata.title,
      score: match.score,
      type: match.metadata.type
    }))
    
    // Search recent incidents in Supabase (last 24 hours)
    console.log('RAG: Searching recent incidents in Supabase')
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: incidents, error: incidentsError } = await supabase
      .from('incidents')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .eq('is_newsworthy', true)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (incidentsError) {
      console.error('RAG: Supabase incidents error:', incidentsError)
    } else {
      console.log('RAG: Found', incidents?.length || 0, 'recent incidents')
    }
    
    results.incidents = incidents || []
    
    // Search upcoming events
    console.log('RAG: Searching upcoming events in Supabase')
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(3)
    
    if (eventsError) {
      console.error('RAG: Supabase events error:', eventsError)
    } else {
      console.log('RAG: Found', events?.length || 0, 'upcoming events')
    }
    
    results.events = events || []
    
  } catch (error) {
    console.error('RAG: Context search error:', error)
    console.error('RAG: Error details:', {
      message: error.message,
      stack: error.stack
    })
  }
  
  console.log('RAG: Context search completed. Results:', {
    documents: results.documents.length,
    incidents: results.incidents.length,
    events: results.events.length
  })
  
  return results
}

export function buildContextPrompt(searchResults) {
  let context = ''
  
  // Add recent incidents
  if (searchResults.incidents.length > 0) {
    context += 'RECENT INCIDENTS:\n'
    searchResults.incidents.forEach(incident => {
      context += `- ${incident.title} at ${incident.location}: ${incident.summary}\n`
    })
    context += '\n'
  }
  
  // Add relevant documents
  if (searchResults.documents.length > 0) {
    context += 'RELEVANT DOCUMENTS:\n'
    searchResults.documents.forEach(doc => {
      context += `- From "${doc.title}" (${doc.type}): ${doc.content.substring(0, 300)}...\n`
    })
    context += '\n'
  }
  
  // Add upcoming events
  if (searchResults.events.length > 0) {
    context += 'UPCOMING EVENTS:\n'
    searchResults.events.forEach(event => {
      const date = new Date(event.start_date).toLocaleDateString()
      context += `- ${event.title} on ${date} at ${event.location}: ${event.description}\n`
    })
    context += '\n'
  }
  
  return context
}