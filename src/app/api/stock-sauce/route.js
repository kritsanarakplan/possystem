import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all stock sauce entries
export async function GET(request) {
  try {
    const stockSauces = await prisma.stockSauce.findMany({
      orderBy: {
        sauceType: 'asc',
      },
    });

    return NextResponse.json(stockSauces);
  } catch (error) {
    console.error('Error fetching stock sauce:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST to create or update stock sauce entry
export async function POST(request) {
  try {
    const body = await request.json();
    const { sauceType, stock } = body;

    if (!sauceType) {
      return NextResponse.json(
        { error: 'Sauce type is required' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingStock = await prisma.stockSauce.findUnique({
      where: {
        sauceType,
      },
    });

    let stockSauce;
    if (existingStock) {
      // Update existing record
      stockSauce = await prisma.stockSauce.update({
        where: {
          id: existingStock.id,
        },
        data: {
          stock: stock !== undefined ? parseInt(stock) : existingStock.stock,
        },
      });
    } else {
      // Create new record
      stockSauce = await prisma.stockSauce.create({
        data: {
          sauceType,
          stock: stock !== undefined ? parseInt(stock) : 0,
        },
      });
    }

    return NextResponse.json(stockSauce);
  } catch (error) {
    console.error('Error updating stock sauce:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT to update stock sauce entry
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, stock } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Stock sauce ID is required' },
        { status: 400 }
      );
    }

    const stockSauce = await prisma.stockSauce.update({
      where: {
        id: parseInt(id),
      },
      data: {
        stock: parseInt(stock),
      },
    });

    return NextResponse.json(stockSauce);
  } catch (error) {
    console.error('Error updating stock sauce:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE stock sauce entry
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Stock sauce ID is required' },
        { status: 400 }
      );
    }

    await prisma.stockSauce.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stock sauce:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}