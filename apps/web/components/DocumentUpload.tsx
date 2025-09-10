'use client'

import { useState } from 'react'

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage('Document uploaded successfully!')
        e.currentTarget.reset()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document File (PDF)
          </label>
          <input
            type="file"
            name="file"
            accept=".pdf"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="e.g., City Council Minutes - January 2024"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            name="type"
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="general">General</option>
            <option value="city">City Document</option>
            <option value="court">Court Record</option>
            <option value="property">Property Record</option>
            <option value="police">Police Report</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <input
            type="text"
            name="source"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="e.g., GlyphReports"
          />
        </div>
        
        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-2 px-4 rounded font-medium text-white ${
            uploading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}