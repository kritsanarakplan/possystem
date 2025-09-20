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
  const [ownerFilter, setOwnerFilter] = useState('')
  const [uniqueOwners, setUniqueOwners] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchStores()
  }, [])

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
    
    // ดึงข้อมูล owner ที่ไม่ซ้ำกันเพื่อใช้ในการกรอง
    const owners = [...new Set(data.map(product => product.owner).filter(owner => owner))]
    setUniqueOwners(owners)
  }

  const fetchStores = async () => {
    const res = await fetch('/api/stores')
    const data = await res.json()
    setStores(data)
  }

  const handleOwnerFilterChange = (e) => {
    setOwnerFilter(e.target.value)
  }
  
  // ฟังก์ชันสำหรับกรองสินค้าตาม owner
  const getFilteredProducts = () => {
    if (!ownerFilter) return products || []
    return products ? products.filter(product => 
      product.owner && product.owner.toLowerCase().includes(ownerFilter.toLowerCase())
    ) : []
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

      const data = await res.json()
     
      if (!res.ok) {
        alert('Error: ' + (data.error || 'สินค้าไม่พอในสต็อก'))
        return
      }
      
      setCart([])
      alert('บันทึกการขายสำเร็จ')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH').format(price)
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-2 sm:px-4 md:px-6">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">ระบบขาย</h1>
          <p className="text-sm sm:text-base text-gray-600">เลือกสินค้าและจัดการการขาย</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Products Section */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">สินค้าทั้งหมด</h2>
              </div>
              
              {/* ส่วนกรองตาม Owner */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">กรองตามเจ้าของ:</label>
                  <div className="flex-1 flex gap-2">
                    <select
                      value={ownerFilter}
                      onChange={handleOwnerFilterChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">ทั้งหมด</option>
                      {uniqueOwners.map((owner, index) => (
                        <option key={index} value={owner}>{owner}</option>
                      ))}
                    </select>
                    {ownerFilter && (
                      <button
                        onClick={() => setOwnerFilter('')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center"
                      >
                        ล้าง
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {products.length === 0 ? (
                <div className="text-center py-6 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-gray-500">กำลังโหลดสินค้า...</p>
                </div>
              ) : getFilteredProducts().length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
                  <button 
                    onClick={() => setOwnerFilter('')} 
                    className="mt-3 text-blue-500 hover:text-blue-700 font-medium"
                  >
                    แสดงสินค้าทั้งหมด
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {getFilteredProducts().map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="group relative p-3 sm:p-4 md:p-6 border-2 border-gray-100 rounded-lg sm:rounded-xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-white transform hover:-translate-y-1"
                    >
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base group-hover:text-blue-700 transition-colors truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1 truncate">เจ้าของ: {product.owner}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                            ฿{formatPrice(product.price)}
                          </p>
                          {product.shelf && (
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                              จัดการสต็อก
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1 order-1 lg:order-2 mb-4 lg:mb-0">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 sticky top-2 sm:top-4 md:top-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m4.5-5.5v6m0-6l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">ตะกร้าสินค้า</h2>
                {cart.length > 0 && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium">
                    {cart.length}
                  </span>
                )}
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m4.5-5.5v6m0-6l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">ตะกร้าว่าง</p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800 flex-1">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-400 hover:text-red-600 ml-2 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {item.quantity} × ฿{formatPrice(item.price)}
                      </div>
                      
                      {item.storeName && (
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mb-2">
                          📍 {item.storeName}
                        </div>
                      )}
                      
                      <div className="text-right">
                        <span className="font-bold text-gray-800">
                          ฿{formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-700">ยอดรวม</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ฿{formatPrice(getTotalPrice())}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    บันทึกการขาย
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-blue-600 font-semibold mt-1">฿{formatPrice(selectedProduct.price)}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">จำนวน</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    onClick={(e) => e.target.select()}
                    className="flex-1 text-center border-2 border-gray-200 rounded-xl py-2 px-4 focus:border-blue-500 focus:ring-0 font-medium"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {selectedProduct.shelf && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">เลือกร้านค้า</label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 bg-white"
                    required={selectedProduct.shelf}
                  >
                    <option value="">-- เลือกร้านค้า --</option>
                    {stores.map(store => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">รวมเป็นเงิน</span>
                  <span className="text-xl font-bold text-blue-600">
                    ฿{formatPrice(selectedProduct.price * quantity)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={addToCart}
                disabled={selectedProduct.shelf && !selectedStore}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
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