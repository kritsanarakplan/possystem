import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    // Extract storeId from URL path
    const storeId = request.url.split('/').pop()
    
    const store = await prisma.store.findUnique({
      where: { 
        id: parseInt(storeId) 
      },
      include: {
        storeStocks: {
          include: {
            product: true
          }
        }
      }
    })
    
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json(store)
  } catch (error) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}