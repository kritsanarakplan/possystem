'use client'
import { useState, useEffect } from 'react'

export default function StoresPage() {
  const [stores, setStores] = useState([])
  const [products, setProducts] = useState([])
  const [newStore, setNewStore] = useState({
    name: ''
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
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">จัดการร้านค้า</h1>

      {/* Form for adding new store */}
      <form onSubmit={handleSubmit} className="mb-8 max-w-md">
        <div className="mb-4">
          <label className="block mb-1">ชื่อร้านค้า</label>
          <input
            type="text"
            value={newStore.name}
            onChange={(e) => setNewStore({...newStore, name: e.target.value})}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          เพิ่มร้านค้า
        </button>
      </form>

      {/* Stores list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stores.map(store => (
          <div key={store.id} className="border p-4 rounded">
            <h3 className="font-bold">{store.name}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}