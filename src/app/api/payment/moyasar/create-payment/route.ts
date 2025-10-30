/**
 * Moyasar Create Payment API Route
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, description, metadata, callback_url } = body;
    
    // In production, use Moyasar SDK or API
    console.log('🇸🇦 Moyasar Payment Created (simulated):', { amount, currency, description });

    const paymentId = `moy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      id: paymentId,
      status: 'initiated',
      amount: amount,
      currency: currency || 'SAR',
      description: description,
      metadata: metadata || {},
      source: {
        type: 'creditcard',
        transaction_url: callback_url || `https://moyasar.com/payment/${paymentId}`
      }
    });
  } catch (error: any) {
    console.error('Moyasar create payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}




