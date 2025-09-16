'use client'
import { useState, useEffect } from 'react'

export default function SalesPage() {
  const [products, setProducts] = useState([])
  const [stores, setStores] = useState([])
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedStore, setSelectedStore] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchStores()
  }, [])

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
  }

  const fetchStores = async () => {
    const res = await fetch('/api/stores')
    const data = await res.json()
    setStores(data)
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setSelectedStore('')
    setShowModal(true)
  }

  const addToCart = () => {
    const cartItem = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: quantity,
      // Only include storeId and storeName if product is shelf type
      ...(selectedProduct.shelf ? {
        storeId: selectedStore,
        storeName: stores.find(s => s.id === parseInt(selectedStore))?.name
      } : {})
    }
    
    setCart([...cart, cartItem])
    setShowModal(false)
  }

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const handleCheckout = async () => {
    try {
      // Check if all shelf products have store selected
      const hasInvalidItems = cart.some(item => 
        products.find(p => p.id === item.productId)?.shelf && !item.storeId
      )

      if (hasInvalidItems) {
        alert('กรุณาเลือกร้านค้าสำหรับสินค้าที่มีการจัดการสต็อก')
        return
      }

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      })

      if (!res.ok) throw new Error('Failed to save sale')
      
      setCart([])
      alert('บันทึกการขายสำเร็จ')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">สินค้า</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="p-4 border rounded-xl hover:shadow-lg transition-all bg-white"
              >
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">฿{product.price}</p>
                {product.shelf && <p className="text-sm text-blue-500">จัดการสต็อก</p>}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="bg-white p-4 rounded-xl border">
          <h2 className="text-2xl font-bold mb-4">ตะกร้าสินค้า</h2>
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-start border-b pb-2">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x ฿{item.price}
                  </p>
                  {item.storeName && (
                    <p className="text-sm text-blue-500">{item.storeName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">฿{item.price * item.quantity}</p>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {cart.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>รวม</span>
                <span>
                  ฿{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                บันทึกการขาย
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Selection Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{selectedProduct.name}</h3>
            
            <div className="mb-4">
              <label className="block mb-2">จำนวน</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                min="1"
                className="w-full border rounded p-2"
              />
            </div>

            {selectedProduct.shelf && (
              <div className="mb-4">
                <label className="block mb-2">เลือกร้านค้า</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full border rounded p-2"
                  required={selectedProduct.shelf}
                >
                  <option value="">เลือกร้านค้า</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={addToCart}
                disabled={selectedProduct.shelf && !selectedStore}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}