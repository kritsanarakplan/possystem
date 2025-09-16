'use client'
import { useState, useEffect } from 'react'
import { PlusCircle, Trash2, Edit, Save, X } from 'lucide-react'
import Link from 'next/link'

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Form state
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  
  // Get categories
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/expense-categories')
      if (!response.ok) {
        throw new Error('Failed to fetch expense categories')
      }
      
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  // Initial fetch
  useEffect(() => {
    fetchCategories()
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
      description: ''
    })
    setIsEditing(false)
    setEditingId(null)
  }
  
  // Create category
  const createCategory = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/expense-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }
      
      await fetchCategories()
      resetForm()
    } catch (err) {
      setError(err.message)
      console.error(err)
    }
  }
  
  // Update category
  const updateCategory = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/expense-categories/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update category')
      }
      
      await fetchCategories()
      resetForm()
    } catch (err) {
      setError(err.message)
      console.error(err)
    }
  }
  
  // Delete category
  const deleteCategory = async (id) => {
    if (!confirm('ยืนยันการลบหมวดหมู่รายจ่าย?')) return
    
    try {
      const response = await fetch(`/api/expense-categories/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }
      
      await fetchCategories()
    } catch (err) {
      setError(err.message)
      console.error(err)
    }
  }
  
  // Edit category
  const handleEdit = (category) => {
    setIsEditing(true)
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการหมวดหมู่รายจ่าย</h1>
        <Link href="/expenses" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          กลับไปหน้ารายจ่าย
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Category Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่รายจ่าย'}</h2>
        <form onSubmit={isEditing ? updateCategory : createCategory}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหมวดหมู่</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ชื่อหมวดหมู่รายจ่าย"
              />
            </div>
            
            <div>
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
                เพิ่มหมวดหมู่
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อหมวดหมู่</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายละเอียด</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center">กำลังโหลด...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center">ไม่พบข้อมูลหมวดหมู่รายจ่าย</td>
                </tr>
              ) : (
                categories.map(category => (
                  <tr key={category.id}>
                    <td className="px-6 py-4">
                      {category.name}
                    </td>
                    <td className="px-6 py-4">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
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