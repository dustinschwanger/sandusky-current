import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateEmbedding(text) {
  try {
    console.log('OpenAI: Generating embedding for text:', text.substring(0, 100))
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    console.log('OpenAI: Embedding generated successfully')
    return response.data[0].embedding
  } catch (error) {
    console.error('OpenAI: Failed to generate embedding:', error)
    throw new Error(`Embedding generation failed: ${error.message}`)
  }
}

export async function getChatCompletion(messages, stream = false) {
  try {
    console.log('OpenAI: Starting chat completion with model gpt-4o-mini')
    console.log('OpenAI: Message count:', messages.length)
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      stream: stream,
    })
    
    console.log('OpenAI: Chat completion successful')
    return response
  } catch (error) {
    console.error('OpenAI: Chat completion failed:', error)
    console.error('OpenAI: Error details:', {
      message: error.message,
      status: error.status,
      code: error.code
    })
    throw new Error(`Chat completion failed: ${error.message}`)
  }
}

export { openai }