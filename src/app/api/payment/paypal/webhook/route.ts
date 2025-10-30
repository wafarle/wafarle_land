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

    console.log('📥 PayPal webhook received:', eventType);

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        const payment = body.resource;
        const orderId = payment.purchase_units?.[0]?.reference_id;

        if (orderId) {
          await updateOrder(orderId, {
            paymentStatus: 'paid',
            paymentGateway: 'paypal',
            paymentGatewayTransactionId: payment.id,
            paymentGatewayOrderId: payment.id,
            status: 'confirmed',
          });
          console.log('✅ Order updated after successful PayPal payment:', orderId);
        }
        break;

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        const declinedPayment = body.resource;
        const declinedOrderId = declinedPayment.purchase_units?.[0]?.reference_id;

        if (declinedOrderId) {
          await updateOrder(declinedOrderId, {
            paymentStatus: 'unpaid',
            paymentGateway: 'paypal',
            paymentGatewayTransactionId: declinedPayment.id,
          });
          console.log('❌ Order updated after declined PayPal payment:', declinedOrderId);
        }
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        const refund = body.resource;
        const refundedOrderId = refund.purchase_units?.[0]?.reference_id;

        if (refundedOrderId) {
          await updateOrder(refundedOrderId, {
            paymentStatus: 'refunded',
          });
          console.log('💰 Order updated after PayPal refund:', refundedOrderId);
        }
        break;

      default:
        console.log('⚠️ Unhandled PayPal event type:', eventType);
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




