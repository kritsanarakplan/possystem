'use client'
import { useState, useEffect } from 'react'

export default function StoresPage() {
  const [stores, setStores] = useState([])
  const [products, setProducts] = useState([])
  const [newStore, setNewStore] = useState({
    name: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchStores()
    fetchProducts()
  }, [])

  const fetchStores = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/stores')
      const data = await res.json()
      setStores(data)
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore)
      })

      if (!res.ok) throw new Error('Failed to add store')

      const store = await res.json()
      
      // Initialize store stock for all products
      await Promise.all(products.map(product => 
        fetch(`/api/stores/${store.id}/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            stock: 0
          })
        })
      ))

      setNewStore({ name: '' })
      fetchStores()
      alert('เพิ่มร้านค้าสำเร็จ')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStore = async (storeId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบร้านค้านี้?')) return

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete store')

      fetchStores()
      alert('ลบร้านค้าสำเร็จ')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">จัดการร้านค้า</h1>
              <p className="text-gray-600 mt-1">เพิ่มและจัดการร้านค้าในระบบ</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">{stores.length} ร้านค้า</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="font-medium">{products.length} สินค้า</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Add Store Form */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">เพิ่มร้านค้าใหม่</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ชื่อร้านค้า
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newStore.name}
                      onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 pl-11 focus:border-indigo-500 focus:ring-0 transition-colors"
                      placeholder="กรอกชื่อร้านค้า..."
                      required
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !newStore.name.trim()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      กำลังเพิ่ม...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      เพิ่มร้านค้า
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">หมายเหตุ:</p>
                    <p>เมื่อเพิ่มร้านค้าใหม่ ระบบจะสร้างสต็อกเริ่มต้นเป็น 0 สำหรับสินค้าทุกรายการ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stores List */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">รายการร้านค้า</h2>
                </div>
                
                <button
                  onClick={fetchStores}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  รีเฟรช
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                </div>
              ) : stores.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg mb-2">ยังไม่มีร้านค้าในระบบ</p>
                  <p className="text-gray-400 text-sm">เพิ่มร้านค้าแรกของคุณเพื่อเริ่มต้นใช้งาน</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stores.map((store, index) => (
                    <div
                      key={store.id}
                      className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-xl p-6 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteStore(store.id)}
                          className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                          title="ลบร้านค้า"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {store.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-800 mb-1 truncate group-hover:text-indigo-700 transition-colors">
                            {store.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3">
                            ID: #{store.id}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1 text-emerald-600">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span>จัดการสต็อก</span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-600">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>ใช้งานได้</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>ร้านค้าที่ #{index + 1}</span>
                          <span>สร้างเมื่อ: วันนี้</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}