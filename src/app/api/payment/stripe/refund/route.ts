/**
 * Stripe Refund API Route
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, amount, reason } = body;
    
    console.log('💸 Stripe Refund (simulated):', { paymentIntentId, amount, reason });

    return NextResponse.json({
      id: `re_sim_${Date.now()}`,
      amount: amount || 0,
      status: 'succeeded',
      reason: reason || 'requested_by_customer'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Refund failed' },
      { status: 500 }
    );
  }
}




