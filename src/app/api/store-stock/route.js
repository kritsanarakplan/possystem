import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { storeId, productId, stock } = await request.json()

    // First, get the product details to check if it has a sauce type
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Start a transaction to ensure both store stock and sauce stock are updated atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update store stock
      const storeStock = await tx.storeStock.upsert({
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

      // If product is on shelf AND has a sauce type, deduct from sauce stock
      if (product.shelf && product.sauceType && product.sauceType !== 'NONE') {
        // Check if sauce stock exists
        const sauceStock = await tx.stockSauce.findUnique({
          where: {
            sauceType: product.sauceType
          }
        })

        if (sauceStock) {
          // Check if there's enough sauce stock
          if (sauceStock.stock < stock) {
            // Not enough sauce stock, throw error to rollback transaction
            throw new Error(`ซอส${
              product.sauceType === 'MILD' ? 'เผ็ดน้อย' : 
              product.sauceType === 'MEDIUM' ? 'เผ็ดกลาง' : 
              product.sauceType === 'HOT' ? 'เผ็ดมาก' : 
              'ผัดไทย'}ไม่พอ`)
          }

          // Update sauce stock
          await tx.stockSauce.update({
            where: {
              id: sauceStock.id
            },
            data: {
              stock: {
                decrement: stock
              }
            }
          })
        } else {
          // No sauce stock found
          throw new Error(`ไม่พบสต็อกซอส${
            product.sauceType === 'MILD' ? 'เผ็ดน้อย' : 
            product.sauceType === 'MEDIUM' ? 'เผ็ดกลาง' : 
            product.sauceType === 'HOT' ? 'เผ็ดมาก' : 
            'ผัดไทย'}`)
        }
      }

      return storeStock
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}