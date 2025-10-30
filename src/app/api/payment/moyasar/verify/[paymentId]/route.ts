/**
 * Moyasar Verify Payment API Route
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;
    
    console.log('✅ Moyasar Payment Verified (simulated):', paymentId);

    // Simulate verified payment
    return NextResponse.json({
      id: paymentId,
      status: 'paid',
      amount: 0,
      currency: 'SAR',
      metadata: {}
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}




