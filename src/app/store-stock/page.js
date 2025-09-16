'use client'
import { useState, useEffect } from 'react'

export default function StoreStockPage() {
  const [stores, setStores] = useState([])
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    storeId: '',
    productId: '',
    quantity: 0
  })

  useEffect(() => {
    fetchStores()
    fetchProducts()
  }, [])

  const fetchStores = async () => {
    const res = await fetch('/api/stores')
    const data = await res.json()
    setStores(data)
  }

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/store-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: parseInt(formData.storeId),
          productId: parseInt(formData.productId),
          stock: parseInt(formData.quantity)
        })
      })

      if (!res.ok) throw new Error('Failed to update stock')
      
      // Reset form
      setFormData({
        storeId: '',
        productId: '',
        quantity: 0
      })
      
      alert('บันทึกสต็อกสำเร็จ')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการสต็อกสินค้า</h1>
          <p className="text-gray-600">เพิ่มหรืออัปเดตจำนวนสินค้าในสต็อกตามร้านค้า</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Form Section */}
            <div className="md:w-1/2 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  บันทึกข้อมูลสต็อก
                </h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">ร้านค้า</label>
                  <select
                    value={formData.storeId}
                    onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- เลือกร้านค้า --</option>
                    {stores.map(store => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">สินค้า</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- เลือกสินค้า --</option>
                    {products.filter(product => product.shelf).map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.owner}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">* แสดงเฉพาะสินค้าที่มีการจัดการสต็อก</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">จำนวน</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">ชิ้น</span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  บันทึกสต็อก
                </button>
              </form>
            </div>

            {/* Information Section */}
            <div className="md:w-1/2 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  คำแนะนำการใช้งาน
                </h2>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="font-medium mb-2">1. เลือกร้านค้า</p>
                  <p>เลือกร้านค้าที่ต้องการจัดการสต็อกสินค้า</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="font-medium mb-2">2. เลือกสินค้า</p>
                  <p>เลือกสินค้าที่ต้องการเพิ่มหรืออัปเดตจำนวนในสต็อก (เฉพาะสินค้าที่มีการจัดการสต็อก)</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="font-medium mb-2">3. ระบุจำนวน</p>
                  <p>ใส่จำนวนสินค้าที่ต้องการบันทึกลงในสต็อก หากมีอยู่แล้วจะเป็นการอัปเดตจำนวนใหม่</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}