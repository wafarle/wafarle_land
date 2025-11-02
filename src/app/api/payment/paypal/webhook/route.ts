/**
 * PayPal Webhook Handler
 * Handles PayPal payment events
 * 
 * Note: In production, you need to:
 * 1. Install PayPal SDK: npm install @paypal/checkout-server-sdk
 * 2. Configure webhook URL in PayPal dashboard
 * 3. Verify webhook signatures
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateOrder } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        const payment = body.resource;
        const orderId = payment.purchase_units?.[0]?.reference_id;

        if (orderId) {
          await updateOrder(orderId, {
            paymentStatus: 'paid',
            paymentMethod: 'paypal',
            status: 'confirmed',
          });
        }
        break;

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        const declinedPayment = body.resource;
        const declinedOrderId = declinedPayment.purchase_units?.[0]?.reference_id;

        if (declinedOrderId) {
          await updateOrder(declinedOrderId, {
            paymentStatus: 'failed',
            paymentMethod: 'paypal',
          });
        }
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        const refund = body.resource;
        const refundedOrderId = refund.purchase_units?.[0]?.reference_id;

        if (refundedOrderId) {
          await updateOrder(refundedOrderId, {
            paymentStatus: 'refunded',
          });
        }
        break;

      default:
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}






