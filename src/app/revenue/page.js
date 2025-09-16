'use client'
import React, { useState, useEffect } from 'react'
import { DollarSign, Calendar, FileText, TrendingUp, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'

export default function RevenueReportPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // กำหนดค่าเริ่มต้นสำหรับตัวกรอง
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  const [filters, setFilters] = useState({
    startDate: formatDateForInput(firstDayOfMonth),
    endDate: formatDateForInput(today),
    owner: ''
  })
  
  // State สำหรับการจัดเรียงข้อมูล
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  })
  
  // State สำหรับการแสดง/ซ่อนรายละเอียด
  const [expandedSaleId, setExpandedSaleId] = useState(null)
  
  useEffect(() => {
    fetchSales()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // ฟังก์ชันสำหรับดึงข้อมูลการขาย
  const fetchSales = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // สร้าง query params สำหรับการกรองข้อมูลตามวันที่
      const queryParams = new URLSearchParams()
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)
      if (filters.owner) queryParams.append('owner', filters.owner)
      
      const res = await fetch(`/api/reports/revenue?${queryParams.toString()}`)
      
      if (!res.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลรายการขายได้')
      }
      
      const data = await res.json()
      setSales(data.sales)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching sales:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // ฟังก์ชันสำหรับฟอร์แมตวันที่ให้เป็น YYYY-MM-DD สำหรับ input type="date"
  function formatDateForInput(date) {
    const d = new Date(date)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${month}-${day}`
  }
  
  // ฟังก์ชันสำหรับฟอร์แมตวันที่ให้แสดงผล
  function formatDate(dateString) {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('th-TH', options)
  }
  
  // ฟังก์ชันสำหรับฟอร์แมตตัวเลขให้เป็นรูปแบบเงิน
  function formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    }).format(amount)
  }
  
  // ฟังก์ชันสำหรับการกรองข้อมูลตามวันที่
  function handleFilterChange(e) {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // ฟังก์ชันสำหรับการใช้ฟิลเตอร์
  function applyFilters() {
    fetchSales()
  }
  
  // ฟังก์ชันสำหรับการจัดเรียงข้อมูล
  function handleSort(key) {
    let direction = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }
  
  // ฟังก์ชันสำหรับการดึงข้อมูล owner ที่ไม่ซ้ำกันจากรายการสินค้า
  function getUniqueOwners(items) {
    if (!items || items.length === 0) return []
    
    const uniqueOwners = new Set()
    items.forEach(item => {
      if (item.product?.owner) {
        uniqueOwners.add(item.product.owner)
      }
    })
    
    return Array.from(uniqueOwners)
  }
  
  // ฟังก์ชันสำหรับการขยาย/ยุบรายละเอียด
  function toggleSaleDetails(saleId) {
    if (expandedSaleId === saleId) {
      setExpandedSaleId(null)
    } else {
      setExpandedSaleId(saleId)
    }
  }
  
  // ฟังก์ชันสำหรับการกรองข้อมูลตามวันที่
  function getFilteredSales() {
    const startDate = new Date(filters.startDate)
    const endDate = new Date(filters.endDate)
    endDate.setHours(23, 59, 59, 999) // ตั้งเวลาเป็นสิ้นสุดของวัน
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date)
      
      // กรองตามวันที่
      const dateMatch = saleDate >= startDate && saleDate <= endDate
      
      // กรองตาม owner ถ้ามีการระบุ
      let ownerMatch = true
      if (filters.owner) {
        ownerMatch = sale.items.some(item => 
          item.product?.owner && item.product.owner.toLowerCase().includes(filters.owner.toLowerCase())
        )
      }
      
      return dateMatch && ownerMatch
    })
  }
  
  // ฟังก์ชันสำหรับการจัดเรียงข้อมูล
  function getSortedSales(salesData) {
    const sortableData = [...salesData]
    
    return sortableData.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const aValue = new Date(a.date).getTime()
        const bValue = new Date(b.date).getTime()
        
        if (sortConfig.direction === 'asc') {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      } else if (sortConfig.key === 'total') {
        if (sortConfig.direction === 'asc') {
          return a.total - b.total
        } else {
          return b.total - a.total
        }
      }
      
      return 0
    })
  }
  
  // ฟังก์ชันสำหรับการจัดกลุ่มข้อมูลตามเดือน
  function groupSalesByMonth(salesData) {
    const grouped = {}
    
    salesData.forEach(sale => {
      const date = new Date(sale.date)
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`
      
      if (!grouped[monthYear]) {
        const monthName = date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
        grouped[monthYear] = {
          monthName,
          totalSales: 0,
          count: 0
        }
      }
      
      grouped[monthYear].totalSales += sale.total
      grouped[monthYear].count += 1
    })
    
    return Object.values(grouped).sort((a, b) => {
      // เรียงตามเดือนล่าสุดก่อน
      const aMonth = Object.keys(grouped).find(key => grouped[key] === a)
      const bMonth = Object.keys(grouped).find(key => grouped[key] === b)
      return bMonth.localeCompare(aMonth)
    })
  }
  
  // ฟังก์ชันสำหรับการจัดกลุ่มข้อมูลตาม owner
  function groupSalesByOwner(salesData) {
    const owners = {}
    
    salesData.forEach(sale => {
      sale.items.forEach(item => {
        if (item.product?.owner) {
          const owner = item.product.owner
          
          if (!owners[owner]) {
            owners[owner] = {
              owner,
              totalRevenue: 0,
              count: 0,
              items: 0
            }
          }
          
          owners[owner].totalRevenue += item.price * item.quantity
          owners[owner].items += item.quantity
          // นับเฉพาะ sales ที่ไม่ซ้ำกัน
          if (!owners[owner][sale.id]) {
            owners[owner].count += 1
            owners[owner][sale.id] = true
          }
        }
      })
    })
    
    return Object.values(owners).sort((a, b) => b.totalRevenue - a.totalRevenue)
  }
  
  // ประมวลผลข้อมูล
  const filteredSales = getFilteredSales()
  const sortedSales = getSortedSales(filteredSales)
  const monthlySummary = groupSalesByMonth(filteredSales)
  const ownerSummary = groupSalesByOwner(filteredSales)
  
  // คำนวณยอดรวมทั้งหมด
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalSales = filteredSales.length

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">รายงานรายรับ</h1>
        <p className="text-gray-600">ดูรายละเอียดและวิเคราะห์ยอดขาย</p>
      </div>
      
      {/* ส่วนสรุปภาพรวม */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">รายรับทั้งหมด</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FileText className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">จำนวนรายการขาย</p>
              <p className="text-xl font-bold text-gray-800">{totalSales} รายการ</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ช่วงเวลา</p>
              <p className="text-xl font-bold text-gray-800">
                {new Date(filters.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - 
                {new Date(filters.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 mr-4">
              <TrendingUp className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">เฉลี่ยต่อรายการ</p>
              <p className="text-xl font-bold text-gray-800">
                {totalSales > 0 ? formatCurrency(totalRevenue / totalSales) : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* ส่วนฟิลเตอร์ */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-gray-600" />
              กรองข้อมูล
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">กรองตามเจ้าของสินค้า (Owner)</label>
                <input
                  type="text"
                  name="owner"
                  value={filters.owner}
                  onChange={handleFilterChange}
                  placeholder="ระบุชื่อเจ้าของสินค้า"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="md:self-end">
            <button
              onClick={applyFilters}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Search className="h-4 w-4 mr-2" />
              กรองข้อมูล
            </button>
          </div>
        </div>
      </div>
      
      {/* สรุปตามเจ้าของสินค้า */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <div className="border-b px-4 py-3 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">สรุปตามเจ้าของสินค้า (Owner)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เจ้าของสินค้า
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนการขาย
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนสินค้า
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ยอดรวม
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ownerSummary.map((ownerData, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ownerData.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ownerData.count} รายการ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ownerData.items} ชิ้น
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(ownerData.totalRevenue)}
                  </td>
                </tr>
              ))}
              {ownerSummary.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* สรุปรายเดือน */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <div className="border-b px-4 py-3 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">สรุปรายเดือน</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เดือน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนรายการ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ยอดรวม
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เฉลี่ยต่อรายการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlySummary.map((month, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {month.monthName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {month.count} รายการ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(month.totalSales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(month.totalSales / month.count)}
                  </td>
                </tr>
              ))}
              {monthlySummary.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* รายการขายทั้งหมด */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <div className="border-b px-4 py-3 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">รายการขายทั้งหมด</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort('date')}
                    >
                      วันที่
                      {sortConfig.key === 'date' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="h-4 w-4 ml-1" /> 
                          : <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ร้านค้า
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เจ้าของสินค้า
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort('total')}
                    >
                      ยอดรวม
                      {sortConfig.key === 'total' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="h-4 w-4 ml-1" /> 
                          : <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รายละเอียด
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedSales.length > 0 ? (
                  sortedSales.map(sale => (
                    <React.Fragment key={sale.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(sale.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale.store?.name || 'ไม่ระบุ'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getUniqueOwners(sale.items).join(', ') || 'ไม่ระบุ'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(sale.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => toggleSaleDetails(sale.id)}
                            className="text-blue-600 hover:text-blue-800 flex items-center focus:outline-none"
                          >
                            {expandedSaleId === sale.id ? (
                              <>
                                <span>ซ่อนรายละเอียด</span>
                                <ChevronUp className="h-4 w-4 ml-1" />
                              </>
                            ) : (
                              <>
                                <span>ดูรายละเอียด</span>
                                <ChevronDown className="h-4 w-4 ml-1" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      
                      {expandedSaleId === sale.id && (
                        <tr className="bg-gray-50">
                          <td colSpan="4" className="px-6 py-4">
                            <div className="border-t border-gray-200 pt-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">รายการสินค้า</h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        สินค้า
                                      </th>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ราคา
                                      </th>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        จำนวน
                                      </th>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        รวม
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {sale.items?.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                                          {item.product?.name || 'ไม่ระบุ'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                          {formatCurrency(item.price)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                          {item.quantity}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                          {formatCurrency(item.price * item.quantity)}
                                        </td>
                                      </tr>
                                    ))}
                                    {!sale.items?.length && (
                                      <tr>
                                        <td colSpan="4" className="px-4 py-2 text-center text-xs text-gray-500">
                                          ไม่พบรายการสินค้า
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      ไม่พบข้อมูลในช่วงเวลาที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}