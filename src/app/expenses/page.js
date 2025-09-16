'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { PlusCircle, Trash2, Edit, Save, X, Calendar, ChevronDown, ListFilter, Plus } from 'lucide-react'
import Link from 'next/link'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  
  // Form state
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '-',
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    categoryId: ''
  })
  
  // Filter state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: ''
  })
  
  // Get expense categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/expense-categories')
      if (!response.ok) {
        throw new Error('Failed to fetch expense categories')
      }
      
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }
  
  // Get expenses
  const fetchExpenses = async () => {
    setLoading(true)
    try {
      let url = '/api/expenses'
      
      // Add filters if any
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.categoryId) params.append('categoryId', filters.categoryId)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch expenses')
      }
      
      const data = await response.json()
      setExpenses(data)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  // Initial fetch
  useEffect(() => {
    fetchExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])
  
  // Fetch categories once on load
  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryId: ''
    })
    setIsEditing(false)
    setEditingId(null)
  }
  
  // Create expense
  const createExpense = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create expense')
      }
      
      await fetchExpenses()
      resetForm()
    } catch (err) {
      setError(err.message)
      console.error(err)
    }
  }
  
  // Update expense
  const updateExpense = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/expenses/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update expense')
      }
      
      await fetchExpenses()
      resetForm()
    } catch (err) {
      setError(err.message)
      console.error(err)
    }
  }
  
  // Delete expense
  const deleteExpense = async (id) => {
    if (!confirm('ยืนยันการลบรายการรายจ่าย?')) return
    
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete expense')
      }
      
      await fetchExpenses()
    } catch (err) {
      setError(err.message)
      console.error(err)
    }
  }
  
  // Edit expense
  const handleEdit = (expense) => {
    setIsEditing(true)
    setEditingId(expense.id)
    setFormData({
      name: expense.name,
      description: expense.description || '',
      amount: expense.amount.toString(),
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      categoryId: expense.categoryId || ''
    })
  }
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการรายจ่าย</h1>
        <div className="mt-4 md:mt-0">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative">
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                className="pl-10 pr-8 py-2 border rounded-lg appearance-none"
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <ListFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="pl-10 pr-4 py-2 border rounded-lg"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <span className="self-center">ถึง</span>
            <div className="relative">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="pl-10 pr-4 py-2 border rounded-lg"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Expense Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{isEditing ? 'แก้ไขรายจ่าย' : 'เพิ่มรายจ่าย'}</h2>
          <Link href="/expense-categories" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            จัดการหมวดหมู่
          </Link>
        </div>
        <form onSubmit={isEditing ? updateExpense : createExpense}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรายจ่าย</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ชื่อรายจ่าย"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                onFocus={(e) => e.target.select()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <div className="relative">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด (ถ้ามี)</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="รายละเอียดเพิ่มเติม"
              />
            </div>
          </div>
          
          <div className="mt-6 flex items-center space-x-4">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  ยกเลิก
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                เพิ่มรายจ่าย
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Expenses Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-2">สรุปรายจ่ายทั้งหมด</h2>
        <p className="text-3xl font-bold">{totalExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</p>
      </div>
      
      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อรายจ่าย</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายละเอียด</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">กำลังโหลด...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">ไม่พบข้อมูลรายจ่าย</td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(expense.date), 'dd MMMM yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      {expense.name}
                    </td>
                    <td className="px-6 py-4">
                      {expense.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {expense.category.name}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {expense.description || '-'}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {expense.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}