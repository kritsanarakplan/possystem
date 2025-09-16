import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { expenseId } = params;
    
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(expenseId) },
      include: { category: true }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { expenseId } = params;
    const body = await request.json();
    const { name, description, amount, date, categoryId } = body;

    const expense = await prisma.expense.update({
      where: { id: parseInt(expenseId) },
      data: {
        name: name,
        description: description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : null
      },
      include: { category: true }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { expenseId } = params;
    
    await prisma.expense.delete({
      where: { id: parseInt(expenseId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}