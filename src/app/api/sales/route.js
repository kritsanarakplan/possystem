import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { items } = await request.json()

    const sale = await prisma.$transaction(async (tx) => {
      // For shelf products, use provided storeId
      // For non-shelf products, use default store (1) or first store
      const defaultStore = await tx.store.findFirst()
      if (!defaultStore) throw new Error('No store found')

      // Create the sale record
      const newSale = await tx.sale.create({
        data: {
          storeId: items.find(item => item.storeId)?.storeId || defaultStore.id,
          total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          date: new Date(),
        }
      })

      // Create sale items and update stock if needed
      for (const item of items) {
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        })

        // Only update stock for shelf products
        if (item.storeId) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          })

          if (product?.shelf) {
            await tx.storeStock.update({
              where: {
                storeId_productId: {
                  storeId: parseInt(item.storeId),
                  productId: item.productId
                }
              },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            })
          }
        }
      }

      return newSale
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Sale error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Get sales history
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}