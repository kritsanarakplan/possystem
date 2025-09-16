import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    // รับพารามิเตอร์สำหรับการกรองข้อมูล
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const owner = searchParams.get('owner')
    
    // สร้างเงื่อนไขการค้นหา
    let whereCondition = {}
    
    // ถ้ามีวันที่เริ่มต้นและวันที่สิ้นสุด
    if (startDate && endDate) {
      // กำหนดให้ endDate เป็นช่วงเวลาสิ้นสุดของวัน (23:59:59.999)
      const endDateWithTime = new Date(endDate)
      endDateWithTime.setHours(23, 59, 59, 999)
      
      whereCondition = {
        date: {
          gte: new Date(startDate),
          lte: endDateWithTime
        }
      }
    } 
    // ถ้ามีแค่วันที่เริ่มต้น
    else if (startDate) {
      whereCondition = {
        date: {
          gte: new Date(startDate)
        }
      }
    } 
    // ถ้ามีแค่วันที่สิ้นสุด
    else if (endDate) {
      const endDateWithTime = new Date(endDate)
      endDateWithTime.setHours(23, 59, 59, 999)
      
      whereCondition = {
        date: {
          lte: endDateWithTime
        }
      }
    }
    
    // ดึงข้อมูลจาก database
    const sales = await prisma.sale.findMany({
      where: whereCondition,
      include: {
        items: {
          include: {
            product: true
          }
        },
        store: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    // กรองตาม owner (ทำที่ฝั่ง client เนื่องจาก owner อยู่ในตาราง product)
    let filteredSales = sales
    if (owner) {
      filteredSales = sales.filter(sale => 
        sale.items.some(item => 
          item.product.owner && item.product.owner.toLowerCase().includes(owner.toLowerCase())
        )
      )
    }
    
    // คำนวณสรุปข้อมูลเพิ่มเติม (ถ้าต้องการ)
    const summary = {
      totalSales: filteredSales.length,
      totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
      // กลุ่มข้อมูลตามเดือน
      monthlyData: groupSalesByMonth(filteredSales)
    }
    
    return NextResponse.json({
      sales: filteredSales,
      summary
    })
  } catch (error) {
    console.error('Revenue report error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// ฟังก์ชันสำหรับจัดกลุ่มข้อมูลตามเดือน
function groupSalesByMonth(sales) {
  const grouped = {}
  
  sales.forEach(sale => {
    const date = new Date(sale.date)
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        monthName: date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
        totalSales: 0,
        totalRevenue: 0,
        count: 0
      }
    }
    
    grouped[monthYear].totalRevenue += sale.total
    grouped[monthYear].count += 1
  })
  
  // แปลงเป็น array และเรียงตามเดือนล่าสุด
  return Object.values(grouped).sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year
    }
    return b.month - a.month
  })
}