/**
 * Stripe Webhook Handler
 * Handles Stripe payment events (payment_intent.succeeded, payment_intent.payment_failed, etc.)
 * 
 * Note: In production, you need to:
 * 1. Install Stripe SDK: npm install stripe
 * 2. Configure webhook secret in environment variables
 * 3. Set up webhook endpoint in Stripe dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateOrder } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // In production, verify webhook signature:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET
    // );

    // For now, parse JSON directly (NOT SECURE - for development only)
    const event = JSON.parse(body);

    console.log('📥 Stripe webhook received:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await updateOrder(orderId, {
            paymentStatus: 'paid',
            paymentGateway: 'stripe',
            paymentGatewayTransactionId: paymentIntent.id,
            paymentGatewayOrderId: paymentIntent.id,
            status: 'confirmed',
          });
          console.log('✅ Order updated after successful payment:', orderId);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedOrderId = failedPayment.metadata?.orderId;

        if (failedOrderId) {
          await updateOrder(failedOrderId, {
            paymentStatus: 'unpaid',
            paymentGateway: 'stripe',
            paymentGatewayTransactionId: failedPayment.id,
          });
          console.log('❌ Order updated after failed payment:', failedOrderId);
        }
        break;

      case 'charge.refunded':
        const refund = event.data.object;
        const refundedOrderId = refund.metadata?.orderId;

        if (refundedOrderId) {
          await updateOrder(refundedOrderId, {
            paymentStatus: 'refunded',
          });
          console.log('💰 Order updated after refund:', refundedOrderId);
        }
        break;

      default:
        console.log('⚠️ Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}




