import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany()
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const product = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        owner: data.owner,
        shelf: data.shelf
      }
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}