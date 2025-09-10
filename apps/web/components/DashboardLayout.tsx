import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  sidebar: ReactNode
}

export default function DashboardLayout({ children, sidebar }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {children}
          </div>
          
          {/* Sidebar */}
          <div>
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  )
}