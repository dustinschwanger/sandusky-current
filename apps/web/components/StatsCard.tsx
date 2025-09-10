import React from 'react'

interface StatsCardProps {
  label: string
  value: number | string
  trend?: 'up' | 'down' | 'neutral'
}

export default function StatsCard({ label, value, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span className={`text-sm ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'}
          </span>
        )}
      </div>
    </div>
  )
}