import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');

    // Build filter object
    const filter = {};
    
    if (categoryId) {
      filter.categoryId = parseInt(categoryId);
    }
    
    if (startDate && endDate) {
      filter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      filter.date = {
        lte: new Date(endDate),
      };
    }

    // Get expenses with filters
    const expenses = await prisma.expense.findMany({
      where: filter,
      include: {
        category: true
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, amount, date, categoryId } = body;

    if (!name || !amount) {
      return NextResponse.json(
        { error: 'Name and amount are required' },
        { status: 400 }
      );
    }

    // Create expense record
    const expense = await prisma.expense.create({
      data: {
        name,
        description: description || '',
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        categoryId: categoryId ? parseInt(categoryId) : null
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}