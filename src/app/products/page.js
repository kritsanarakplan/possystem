'use client'
import { useState, useEffect } from 'react'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    owner: '',
    shelf: false
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })

      if (!res.ok) throw new Error('Failed to add product')
      
      setNewProduct({ name: '', price: 0, owner: '', shelf: false })
      fetchProducts()
      alert('เพิ่มสินค้าสำเร็จ')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">จัดการสินค้า</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form for adding new product */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">เพิ่มสินค้าใหม่</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">ชื่อสินค้า</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">ราคา</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">฿</span>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 pl-8 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">เจ้าของสินค้า</label>
                <input
                  type="text"
                  value={newProduct.owner}
                  onChange={(e) => setNewProduct({...newProduct, owner: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newProduct.shelf}
                    onChange={(e) => setNewProduct({...newProduct, shelf: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">มีการจัดการสต็อก</span>
                </label>
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors duration-300"
              >
                เพิ่มสินค้า
              </button>
            </form>
          </div>
        </div>

        {/* Product list */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">รายการสินค้าทั้งหมด</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center py-8">ไม่มีสินค้า กรุณาเพิ่มสินค้าใหม่</p>
            ) : (
              products.map(product => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-600 font-medium text-lg">฿{product.price.toLocaleString()}</p>
                    <p className="text-gray-600">เจ้าของ: {product.owner}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-gray-600 mr-2">จัดการสต็อก:</span>
                      {product.shelf ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">ใช่</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">ไม่ใช่</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}