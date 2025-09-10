import { NextResponse } from 'next/server'
import { processDocument } from '@/lib/document-processor'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const title = formData.get('title')
    const type = formData.get('type')
    const source = formData.get('source')
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    const result = await processDocument(file, {
      title,
      type,
      source
    })
    
    if (result.success) {
      return NextResponse.json({
        message: 'Document processed successfully',
        documentId: result.documentId
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}