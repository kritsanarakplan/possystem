'use client';

import { useState, useEffect } from 'react';

export default function StockSaucePage() {
  const [stockSauces, setStockSauces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state for adding or updating sauce stock
  const [formData, setFormData] = useState({
    sauceType: 'MILD',
    stock: 0,
  });

  const sauceTypes = ['MILD', 'MEDIUM', 'HOT', 'PADTHAI'];
  
  useEffect(() => {
    fetchStockSauces();
  }, []);
  
  const fetchStockSauces = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stock-sauce');
      const data = await res.json();
      setStockSauces(data);
    } catch (error) {
      console.error('Error fetching stock sauces:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? parseInt(value) : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/stock-sauce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        // Reset form and refresh data
        setFormData(prev => ({ ...prev, stock: 0 }));
        fetchStockSauces();
      } else {
        console.error('Failed to update stock sauce');
      }
    } catch (error) {
      console.error('Error updating stock sauce:', error);
    }
  };
  
  const handleUpdateStock = async (id, newStock) => {
    try {
      const res = await fetch('/api/stock-sauce', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          stock: newStock
        }),
      });
      
      if (res.ok) {
        fetchStockSauces();
      } else {
        console.error('Failed to update stock sauce');
      }
    } catch (error) {
      console.error('Error updating stock sauce:', error);
    }
  };

  // Initialize sauce stock
  const initializeStockSauce = async () => {
    try {
      // Create all sauce types
      const promises = sauceTypes.map(sauceType => 
        fetch('/api/stock-sauce', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sauceType,
            stock: 0
          }),
        })
      );
      
      await Promise.all(promises);
      fetchStockSauces();
    } catch (error) {
      console.error('Error initializing stock sauce:', error);
    }
  };

  // Helper function to get sauce name in Thai
  const getSauceNameThai = (sauceType) => {
    switch(sauceType) {
      case 'MILD': return 'ซอสเผ็ดน้อย';
      case 'MEDIUM': return 'ซอสเผ็ดกลาง';
      case 'HOT': return 'ซอสเผ็ดมาก';
      case 'PADTHAI': return 'ซอสผัดไทย';
      default: return sauceType;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ระบบจัดการสต็อกซอส</h1>
      
      {/* Form to add or update sauce stock */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">เพิ่ม/อัพเดทสต็อกซอส</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทซอส</label>
              <select
                name="sauceType"
                value={formData.sauceType}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {sauceTypes.map(type => (
                  <option key={type} value={type}>
                    {getSauceNameThai(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จำนวน</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              บันทึก
            </button>
          </form>
        </div>
        
        {/* Stock sauce table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">สต็อกซอส</h2>
            <button 
              onClick={initializeStockSauce}
              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm"
            >
              เริ่มต้นสต็อกซอส
            </button>
          </div>
          
          {loading ? (
            <div className="p-4 text-center">กำลังโหลด...</div>
          ) : stockSauces.length === 0 ? (
            <div className="p-4 text-center">ไม่พบข้อมูลสต็อกซอส กรุณากดปุ่มเริ่มต้นสต็อกซอส</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภทซอส</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนคงเหลือ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockSauces.map(sauce => (
                  <tr key={sauce.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSauceNameThai(sauce.sauceType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{sauce.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button 
                        onClick={() => handleUpdateStock(sauce.id, sauce.stock + 1)}
                        className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 text-sm"
                      >
                        +
                      </button>
                      {sauce.stock > 0 && (
                        <button 
                          onClick={() => handleUpdateStock(sauce.id, sauce.stock - 1)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 text-sm"
                        >
                          -
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
  );
}