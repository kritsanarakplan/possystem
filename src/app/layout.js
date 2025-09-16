import './globals.css'
import Sidebar from '@/app/components/Sidebar'
import { Sarabun } from 'next/font/google'

const sarabun = Sarabun({
  weight: '400',
  subsets: ['latin'],
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sarabun.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-gray-50">
        <div className="flex">
          <Sidebar />
          <main className="ml-20 md:ml-72 min-h-screen w-full p-2 sm:p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}