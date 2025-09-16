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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">จัดการสต็อกสินค้า</h1>

      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label className="block mb-1">เลือกร้านค้า</label>
          <select
            value={formData.storeId}
            onChange={(e) => setFormData({...formData, storeId: e.target.value})}
            className="w-full border rounded p-2"
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

        <div className="mb-4">
          <label className="block mb-1">เลือกสินค้า</label>
          <select
            value={formData.productId}
            onChange={(e) => setFormData({...formData, productId: e.target.value})}
            className="w-full border rounded p-2"
            required
          >
            <option value="">-- เลือกสินค้า --</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.owner}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">จำนวน</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            className="w-full border rounded p-2"
            min="0"
            required
          />
        </div>

        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          บันทึกสต็อก
        </button>
      </form>
    </div>
  )
}