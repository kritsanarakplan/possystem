import './globals.css'
import Sidebar from '@/app/components/Sidebar'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex">
          <Sidebar />
          <main className="ml-20 md:ml-72 min-h-screen w-full p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}