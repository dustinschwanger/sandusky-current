import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}