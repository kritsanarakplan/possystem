import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { items } = await request.json()
    
    // Check stock levels first before starting transaction
    for (const itemOrig of items) {
      const item = { ...itemOrig, productId: itemOrig.productId ?? 1 };
      
      // Get product details regardless of storeId
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      
      // Check store stock for shelf products
      if (product?.shelf && item.storeId) {
        const stockItem = await prisma.storeStock.findUnique({
          where: {
            storeId_productId: {
              storeId: parseInt(item.storeId),
              productId: item.productId
            }
          }
        })
        
        if (!stockItem || stockItem.stock <= 0 || stockItem.stock < item.quantity) {
          console.log('Stock not enough or zero')
          return NextResponse.json(
            { error: 'สินค้าไม่พอ' },
            { status: 400 }
          )
        }
      }
      
      // Check sauce stock if the product has a sauce type and is NOT a shelf product
      if (product?.sauceType && product.sauceType !== 'NONE' && !product.shelf) {
        const sauceStock = await prisma.stockSauce.findUnique({
          where: {
            sauceType: product.sauceType
          }
        })
        
        if (!sauceStock || sauceStock.stock <= 0 || sauceStock.stock < item.quantity) {
          return NextResponse.json(
            { error: `ซอส${
              product.sauceType === 'MILD' ? 'เผ็ดน้อย' : 
              product.sauceType === 'MEDIUM' ? 'เผ็ดกลาง' : 
              product.sauceType === 'HOT' ? 'เผ็ดมาก' : 
              'ผัดไทย'}ไม่พอ` },
            { status: 400 }
          )
        }
      }
    }
    
    // If all stock checks pass, proceed with transaction
    const sale = await prisma.$transaction(async (tx) => {
      // For shelf products, use provided storeId
      // For non-shelf products, use default store (1) or first store
      const defaultStore = await tx.store.findFirst()
      if (!defaultStore) throw new Error('No store found')

      // Create the sale record
      const newSale = await tx.sale.create({
        data: {
          storeId: parseInt(items.find(item => item.storeId)?.storeId) || defaultStore.id,
          total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          date: new Date(),
        }
      })

      // Create sale items and update stock if needed
      for (const itemOrig of items) {
        // ถ้าไม่มี productId ให้เป็น 1
        const item = { ...itemOrig, productId: itemOrig.productId ?? 1 };

        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        })

        // Get product details regardless of storeId
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { shelf: true, sauceType: true }
        })

        // If product is shelf type and has storeId, update store stock
        if (product?.shelf && item.storeId) {
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
        
        // Update sauce stock if product has a sauce type and is NOT a shelf product
        if (product?.sauceType && product.sauceType !== 'NONE' && !product.shelf) {
          // Find the sauce stock
          const sauceStock = await tx.stockSauce.findUnique({
            where: {
              sauceType: product.sauceType
            }
          })
          
          if (sauceStock) {
            // Update sauce stock
            await tx.stockSauce.update({
              where: {
                id: sauceStock.id
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
        },
        store: true
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