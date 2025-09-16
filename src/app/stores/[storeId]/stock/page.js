'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function StoreStockPage() {
  const { storeId } = useParams()
  const [store, setStore] = useState(null)
  const [stocks, setStocks] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchStore()
    fetchProducts()
  }, [])

  const fetchStore = async () => {
    try {
      const res = await fetch(`/api/stores/${storeId}`)
      const data = await res.json()
      setStore(data)
      setStocks(data.storeStocks || [])
    } catch (error) {
      console.error('Error fetching store:', error)
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

  const updateStock = async (productId, newStock) => {
    try {
      const res = await fetch(`/api/stores/${storeId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          stock: parseInt(newStock)
        })
      })

      if (!res.ok) throw new Error('Failed to update stock')
      
      fetchStore() // Refresh stocks after update
    } catch (error) {
      alert('Error updating stock: ' + error.message)
    }
  }

  if (!store) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">จัดการสต็อกสินค้า - {store.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(product => {
          const stockItem = stocks.find(s => s.productId === product.id)
          
          return (
            <div key={product.id} className="border p-4 rounded">
              <h3 className="font-bold">{product.name}</h3>
              <p>ราคา: ฿{product.price}</p>
              <p>เจ้าของ: {product.owner}</p>
              
              <div className="mt-2">
                <label className="block mb-1">จำนวนในสต็อก</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={stockItem?.stock || 0}
                    onChange={(e) => updateStock(product.id, e.target.value)}
                    className="border rounded p-2 w-24"
                    min="0"
                  />
                  <span className="self-center">ชิ้น</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}