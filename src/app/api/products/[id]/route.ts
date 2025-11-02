import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/products';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Product id is required' }, { status: 400 });
  }
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ product: null }, { status: 404 });
  }
  return NextResponse.json({ product });
}


