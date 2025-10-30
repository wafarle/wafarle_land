/**
 * Moyasar Refund API Route
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, amount } = body;
    
    console.log('💸 Moyasar Refund (simulated):', { paymentId, amount });

    return NextResponse.json({
      id: `moy_refund_${Date.now()}`,
      amount: amount || 0,
      status: 'completed'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Refund failed' },
      { status: 500 }
    );
  }
}




