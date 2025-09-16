import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { storeId, productId, stock } = await request.json()

    const storeStock = await prisma.storeStock.upsert({
      where: {
        storeId_productId: {
          storeId: storeId,
          productId: productId
        }
      },
      update: {
        stock: {
          increment: stock // Use increment instead of direct assignment
        }
      },
      create: {
        storeId: storeId,
        productId: productId,
        stock: stock
      }
    })

    return NextResponse.json(storeStock)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}