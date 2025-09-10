import pdf from 'pdf-parse'
import { generateEmbedding } from './openai'
import { supabase } from './supabase'
import { getPineconeIndex } from './pinecone'
import { v4 as uuidv4 } from 'uuid'

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

export function createChunks(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = []
  let start = 0
  
  while (start < text.length) {
    const end = start + chunkSize
    const chunk = text.slice(start, end)
    chunks.push(chunk)
    start = end - overlap
  }
  
  return chunks
}

export async function processDocument(file, metadata) {
  try {
    // Extract text from PDF
    const buffer = await file.arrayBuffer()
    const data = await pdf(Buffer.from(buffer))
    const text = data.text
    
    // Create chunks
    const chunks = createChunks(text)
    
    // Store document metadata in Supabase
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        title: metadata.title || file.name,
        filename: file.name,
        type: metadata.type || 'general',
        source: metadata.source || 'upload'
      })
      .select()
      .single()
    
    if (docError) throw docError
    
    // Process chunks
    const index = await getPineconeIndex()
    const vectors = []
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embedding = await generateEmbedding(chunk)
      const vectorId = uuidv4()
      
      vectors.push({
        id: vectorId,
        values: embedding,
        metadata: {
          documentId: doc.id,
          chunkIndex: i,
          content: chunk,
          title: doc.title,
          type: doc.type
        }
      })
      
      // Store chunk reference in Supabase
      await supabase.from('document_chunks').insert({
        document_id: doc.id,
        content: chunk,
        chunk_index: i,
        embedding_id: vectorId
      })
    }
    
    // Upsert to Pinecone
    await index.namespace('documents').upsert(vectors)
    
    return { success: true, documentId: doc.id }
  } catch (error) {
    console.error('Document processing error:', error)
    return { success: false, error: error.message }
  }
}