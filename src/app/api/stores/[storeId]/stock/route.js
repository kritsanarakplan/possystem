import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const { storeId } = params
    const { productId, stock } = await request.json()
    
    const storeStock = await prisma.storeStock.create({
      data: {
        storeId: parseInt(storeId),
        productId: parseInt(productId),
        stock
      }
    })
    return NextResponse.json(storeStock)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}