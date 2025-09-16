import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        storeStocks: {
          include: {
            product: true
          }
        }
      }
    })
    return NextResponse.json(stores)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}