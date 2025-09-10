interface NewsCardProps {
  title: string
  excerpt: string
  author: string
  date: string
  imageUrl?: string
  category: string
}

export default function NewsCard({ 
  title, 
  excerpt, 
  author, 
  date, 
  imageUrl,
  category 
}: NewsCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {imageUrl && (
        <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
          [Image Placeholder]
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-blue-600 uppercase">
            {category}
          </span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {excerpt}
        </p>
        <p className="text-xs text-gray-500">
          By {author}
        </p>
      </div>
    </article>
  )
}