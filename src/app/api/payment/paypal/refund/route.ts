/**
 * PayPal Refund API Route
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { captureId, amount } = body;
    

    return NextResponse.json({
      id: `REFUND-${Date.now()}`,
      status: 'COMPLETED',
      amount: amount || { value: '0.00', currency_code: 'SAR' },
      create_time: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Refund failed' },
      { status: 500 }
    );
  }
}






