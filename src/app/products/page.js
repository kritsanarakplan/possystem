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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">จัดการสินค้า</h1>

      {/* Form for adding new product */}
      <form onSubmit={handleSubmit} className="mb-8 max-w-md">
        <div className="mb-4">
          <label className="block mb-1">ชื่อสินค้า</label>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">ราคา</label>
          <input
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
            className="w-full border rounded p-2"
            min="0"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">เจ้าของสินค้า</label>
          <input
            type="text"
            value={newProduct.owner}
            onChange={(e) => setNewProduct({...newProduct, owner: e.target.value})}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={newProduct.shelf}
              onChange={(e) => setNewProduct({...newProduct, shelf: e.target.checked})}
              className="mr-2"
            />
            มีการจัดการสต็อก
          </label>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          เพิ่มสินค้า
        </button>
      </form>

      {/* Product list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="border p-4 rounded">
            <h3 className="font-bold">{product.name}</h3>
            <p>ราคา: ฿{product.price}</p>
            <p>เจ้าของ: {product.owner}</p>
            <p>จัดการสต็อก: {product.shelf ? 'ใช่' : 'ไม่ใช่'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}