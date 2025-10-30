/**
 * Stripe Confirm Payment API Route
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, clientSecret } = body;
    
    console.log('✅ Stripe Payment Confirmed (simulated):', { paymentIntentId });

    return NextResponse.json({
      id: paymentIntentId,
      status: 'succeeded',
      amount: 0,
      currency: 'sar',
      metadata: {}
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Payment confirmation failed' },
      { status: 500 }
    );
  }
}




