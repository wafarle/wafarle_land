/**
 * PayPal Capture Order API Route
 * Captures a PayPal payment after user approval
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization' },
        { status: 401 }
      );
    }

    // In production, you would use PayPal SDK:
    // import { orders } from '@paypal/checkout-server-sdk';
    // const capture = await orders.capture(orderId);
    
    console.log('💰 PayPal Capture Order (simulated):', orderId);

    // Simulate successful capture
    return NextResponse.json({
      id: `CAPTURE-${Date.now()}`,
      status: 'COMPLETED',
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: 'SAR',
            value: '0.00'
          },
          payee: {
            email_address: 'merchant@example.com'
          },
          payments: {
            captures: [
              {
                id: `CAPTURE-${Date.now()}`,
                status: 'COMPLETED',
                amount: {
                  currency_code: 'SAR',
                  value: '0.00'
                },
                create_time: new Date().toISOString()
              }
            ]
          }
        }
      ],
      payer: {
        email_address: 'buyer@example.com'
      }
    });
  } catch (error: any) {
    console.error('PayPal capture error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to capture PayPal payment' },
      { status: 500 }
    );
  }
}




