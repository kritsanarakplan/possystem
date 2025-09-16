'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, ChevronLeft, Package, Store, DollarSign, LayoutGrid, Home } from 'lucide-react'

const Sidebar = () => {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: <Home className="w-5 h-5" />
    },
     {
      title: 'รายรับ',
      path: '/sales',
      icon: <Package className="w-5 h-5" />
    },
    {
      title: 'สินค้า',
      path: '/products',
      icon: <Package className="w-5 h-5" />
    },
    {
      title: 'ร้านค้า',
      path: '/stores',
      icon: <Store className="w-5 h-5" />
    },
    {
      title: 'จัดการสต็อก',
      path: '/store-stock',
      icon: <LayoutGrid className="w-5 h-5" />
    }
  ]

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 flex flex-col bg-white/80 backdrop-blur-lg h-screen border-r shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 border-b bg-gradient-to-r from-blue-500 to-indigo-600 px-4">
        <span className={`text-lg font-bold text-white transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
        }`}>
          POS System
        </span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-white" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === item.path
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <div className="flex items-center">
              {item.icon}
              <span className={`ml-3 font-medium transition-all duration-300 ${
                isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
              }`}>
                {item.title}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-semibold">A</span>
          </div>
          <span className={`ml-3 font-medium text-gray-700 transition-opacity duration-300 ${
            isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
          }`}>
            Admin User
          </span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar