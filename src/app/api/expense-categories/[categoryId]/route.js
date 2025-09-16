import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { categoryId } = params;
    
    const category = await prisma.expenseCategory.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching expense category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense category' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { categoryId } = params;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if another category with the same name exists
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: { 
        name,
        NOT: { id: parseInt(categoryId) }
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.expenseCategory.update({
      where: { id: parseInt(categoryId) },
      data: {
        name,
        description: description || ''
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating expense category:', error);
    return NextResponse.json(
      { error: 'Failed to update expense category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { categoryId } = params;
    
    // Check if category is used by any expense
    const expensesWithCategory = await prisma.expense.count({
      where: { categoryId: parseInt(categoryId) }
    });

    if (expensesWithCategory > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is used by expenses' },
        { status: 400 }
      );
    }
    
    await prisma.expenseCategory.delete({
      where: { id: parseInt(categoryId) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense category' },
      { status: 500 }
    );
  }
}