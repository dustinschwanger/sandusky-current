import './globals.css'
import { ScannerProvider } from '../contexts/ScannerContext'

export const metadata = {
  title: 'Sandusky Current',
  description: 'Real-time news and information for Sandusky, Ohio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ScannerProvider>
          {children}
        </ScannerProvider>
      </body>
    </html>
  )
}