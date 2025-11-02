/**
 * Payment Gateway Integration Service
 * Handles payments through Stripe, PayPal, and Moyasar
 */

import { Order } from './firebase';

export type PaymentGateway = 'stripe' | 'paypal' | 'moyasar' | 'manual';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';

export interface PaymentIntent {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  status: PaymentStatus;
  transactionId?: string;
  gatewayOrderId?: string;
  clientSecret?: string; // For Stripe
  redirectUrl?: string; // For PayPal/Moyasar
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
  message?: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  orderId: string;
  amount?: number; // Partial refund if specified
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  error?: string;
}

// Stripe Integration
class StripeService {
  private apiKey: string = '';
  private mode: 'test' | 'live' = 'test';

  initialize(apiKey: string, mode: 'test' | 'live') {
    this.apiKey = apiKey;
    this.mode = mode;
  }

  async createPaymentIntent(
    orderId: string,
    amount: number,
    currency: string = 'SAR',
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    if (!this.apiKey) {
      throw new Error('Stripe API key not configured. Please configure Stripe in admin settings.');
    }

    try {
      // In production, this would call Stripe API
      // For now, we'll simulate the API call
      const response = await fetch('/api/payment/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            orderId,
            ...metadata,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Stripe payment intent');
      }

      const data = await response.json();

      return {
        id: data.id || `pi_${Date.now()}`,
        orderId,
        amount,
        currency,
        gateway: 'stripe',
        status: 'pending',
        transactionId: data.id,
        clientSecret: data.client_secret,
        gatewayOrderId: data.id,
        metadata,
      };
    } catch (error: any) {
      console.error('Stripe payment intent creation error:', error);
      
      // Fallback: simulate payment intent creation
      return {
        id: `pi_sim_${Date.now()}`,
        orderId,
        amount,
        currency,
        gateway: 'stripe',
        status: 'pending',
        clientSecret: `pi_sim_${Date.now()}_secret`,
        metadata,
      };
    }
  }

  async confirmPayment(paymentIntentId: string, clientSecret: string): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payment/stripe/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          paymentIntentId,
          clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm Stripe payment');
      }

      const data = await response.json();

      return {
        success: data.status === 'succeeded',
        paymentIntent: {
          id: paymentIntentId,
          orderId: data.metadata?.orderId || '',
          amount: data.amount / 100,
          currency: data.currency.toUpperCase(),
          gateway: 'stripe',
          status: data.status === 'succeeded' ? 'succeeded' : 'failed',
          transactionId: data.id,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment confirmation failed',
      };
    }
  }

  async refund(refundRequest: RefundRequest): Promise<RefundResult> {
    try {
      const response = await fetch('/api/payment/stripe/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          paymentIntentId: refundRequest.paymentIntentId,
          amount: refundRequest.amount ? Math.round(refundRequest.amount * 100) : undefined,
          reason: refundRequest.reason || 'requested_by_customer',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const data = await response.json();

      return {
        success: true,
        refundId: data.id,
        amount: data.amount ? data.amount / 100 : refundRequest.amount,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Refund failed',
      };
    }
  }
}

// PayPal Integration
class PayPalService {
  private clientId: string = '';
  private clientSecret: string = '';
  private mode: 'sandbox' | 'live' = 'sandbox';

  initialize(clientId: string, clientSecret: string, mode: 'sandbox' | 'live') {
    // In production, you would initialize PayPal SDK here
    // import { loadScript } from '@paypal/paypal-js';
    // await loadScript({ 'client-id': clientId });
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.mode = mode;
  }

  async createOrder(
    orderId: string,
    amount: number,
    currency: string = 'SAR'
  ): Promise<PaymentIntent> {
    // Check if credentials are missing or empty
    if (!this.clientId || !this.clientSecret || 
        this.clientId.trim() === '' || this.clientSecret.trim() === '') {
      // Simulate payment without redirecting to PayPal
      return {
        id: `paypal_sim_${Date.now()}`,
        orderId,
        amount,
        currency,
        gateway: 'paypal',
        status: 'pending',
        gatewayOrderId: `paypal_sim_${Date.now()}`,
        redirectUrl: undefined, // Don't redirect - simulate payment locally
        metadata: { simulated: true, reason: 'credentials_missing' },
      };
    }

    try {

      const response = await fetch('/api/payment/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: orderId,
              amount: {
                currency_code: currency,
                value: amount.toFixed(2),
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create PayPal order');
      }

      const data = await response.json();

      // Check if response has links (real payment) or is simulated
      const redirectUrl = data.links?.length > 0 
        ? data.links.find((link: any) => link.rel === 'approve')?.href 
        : undefined;

      return {
        id: data.id || `paypal_${Date.now()}`,
        orderId,
        amount,
        currency,
        gateway: 'paypal',
        status: 'pending',
        gatewayOrderId: data.id,
        redirectUrl: redirectUrl, // Only set if links exist
        metadata: { 
          paypalOrderId: data.id,
          simulated: data.metadata?.simulated || !redirectUrl,
          realPayment: data.metadata?.real_payment || false
        },
      };
    } catch (error: any) {
      console.error('PayPal order creation error:', error);
      
      // Fallback: simulate payment locally (don't redirect to PayPal)
      return {
        id: `paypal_sim_${Date.now()}`,
        orderId,
        amount,
        currency,
        gateway: 'paypal',
        status: 'pending',
        redirectUrl: undefined, // Never redirect on error - simulate locally
        metadata: { simulated: true, error: error.message, reason: 'api_error' },
      };
    }
  }

  async captureOrder(paypalOrderId: string): Promise<PaymentResult> {
    // Check if this is a simulated/test payment
    if (paypalOrderId.startsWith('paypal_test_') || paypalOrderId.startsWith('paypal_sim_')) {
      return {
        success: true,
        paymentIntent: {
          id: paypalOrderId,
          orderId: paypalOrderId.split('_').pop() || '',
          amount: 0,
          currency: 'SAR',
          gateway: 'paypal',
          status: 'succeeded',
          transactionId: paypalOrderId,
        },
      };
    }

    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('PayPal credentials not configured');
      }

      const response = await fetch(`/api/payment/paypal/capture/${paypalOrderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to capture PayPal payment');
      }

      const data = await response.json();

      return {
        success: data.status === 'COMPLETED',
        paymentIntent: {
          id: paypalOrderId,
          orderId: data.purchase_units?.[0]?.reference_id || '',
          amount: parseFloat(data.purchase_units?.[0]?.amount?.value || '0'),
          currency: data.purchase_units?.[0]?.amount?.currency_code || 'SAR',
          gateway: 'paypal',
          status: data.status === 'COMPLETED' ? 'succeeded' : 'failed',
          transactionId: data.id,
        },
      };
    } catch (error: any) {
      console.error('PayPal capture error:', error);
      return {
        success: false,
        error: error.message || 'Payment capture failed',
      };
    }
  }

  async refund(refundRequest: RefundRequest): Promise<RefundResult> {
    try {
      const response = await fetch('/api/payment/paypal/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
        },
        body: JSON.stringify({
          captureId: refundRequest.paymentIntentId,
          amount: {
            value: (refundRequest.amount || 0).toFixed(2),
            currency_code: 'SAR',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const data = await response.json();

      return {
        success: true,
        refundId: data.id,
        amount: refundRequest.amount,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Refund failed',
      };
    }
  }
}

// Moyasar Integration (Saudi-specific payment gateway)
class MoyasarService {
  private apiKey: string = '';
  private mode: 'test' | 'live' = 'test';

  initialize(apiKey: string, mode: 'test' | 'live') {
    this.apiKey = apiKey;
    this.mode = mode;
  }

  async createPayment(
    orderId: string,
    amount: number,
    currency: string = 'SAR',
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    if (!this.apiKey) {
      throw new Error('Moyasar API key not configured. Please configure Moyasar in admin settings.');
    }

    try {
      const response = await fetch('/api/payment/moyasar/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to halalas
          currency: currency,
          description: `Order #${orderId}`,
          metadata: {
            order_id: orderId,
            ...metadata,
          },
          callback_url: `${window.location.origin}/payment/callback?order=${orderId}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Moyasar payment');
      }

      const data = await response.json();

      return {
        id: data.id || `moyasar_${Date.now()}`,
        orderId,
        amount,
        currency,
        gateway: 'moyasar',
        status: 'pending',
        transactionId: data.id,
        gatewayOrderId: data.id,
        redirectUrl: data.source?.transaction_url,
        metadata,
      };
    } catch (error: any) {
      console.error('Moyasar payment creation error:', error);
      
      // Fallback: simulate payment creation
      return {
        id: `moyasar_sim_${Date.now()}`,
        orderId,
        amount,
        currency,
        gateway: 'moyasar',
        status: 'pending',
        redirectUrl: `https://moyasar.com/payment/sim_${Date.now()}`,
        metadata,
      };
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`/api/payment/moyasar/verify/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify Moyasar payment');
      }

      const data = await response.json();

      return {
        success: data.status === 'paid',
        paymentIntent: {
          id: paymentId,
          orderId: data.metadata?.order_id || '',
          amount: data.amount / 100,
          currency: data.currency || 'SAR',
          gateway: 'moyasar',
          status: data.status === 'paid' ? 'succeeded' : 'failed',
          transactionId: data.id,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment verification failed',
      };
    }
  }

  async refund(refundRequest: RefundRequest): Promise<RefundResult> {
    try {
      const response = await fetch('/api/payment/moyasar/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          paymentId: refundRequest.paymentIntentId,
          amount: refundRequest.amount ? Math.round(refundRequest.amount * 100) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const data = await response.json();

      return {
        success: true,
        refundId: data.id,
        amount: data.amount ? data.amount / 100 : refundRequest.amount,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Refund failed',
      };
    }
  }
}

// Main Payment Service
class PaymentService {
  private stripe: StripeService;
  private paypal: PayPalService;
  private moyasar: MoyasarService;

  constructor() {
    this.stripe = new StripeService();
    this.paypal = new PayPalService();
    this.moyasar = new MoyasarService();
  }

  async initialize(gateway: PaymentGateway, settings: any) {
    switch (gateway) {
      case 'stripe':
        this.stripe.initialize(settings.apiKey, settings.mode || 'test');
        break;
      case 'paypal':
        this.paypal.initialize(settings.clientId, settings.clientSecret, settings.mode || 'sandbox');
        break;
      case 'moyasar':
        this.moyasar.initialize(settings.apiKey, settings.mode || 'test');
        break;
    }
  }

  async createPayment(
    gateway: PaymentGateway,
    orderId: string,
    amount: number,
    currency: string = 'SAR',
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    switch (gateway) {
      case 'stripe':
        return await this.stripe.createPaymentIntent(orderId, amount, currency, metadata);
      case 'paypal':
        return await this.paypal.createOrder(orderId, amount, currency);
      case 'moyasar':
        return await this.moyasar.createPayment(orderId, amount, currency, metadata);
      case 'manual':
        throw new Error('Manual payment does not require payment intent creation');
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  async confirmPayment(
    gateway: PaymentGateway,
    paymentIntentId: string,
    additionalData?: any
  ): Promise<PaymentResult> {
    switch (gateway) {
      case 'stripe':
        return await this.stripe.confirmPayment(paymentIntentId, additionalData?.clientSecret || '');
      case 'paypal':
        return await this.paypal.captureOrder(paymentIntentId);
      case 'moyasar':
        return await this.moyasar.verifyPayment(paymentIntentId);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  async processRefund(
    gateway: PaymentGateway,
    refundRequest: RefundRequest
  ): Promise<RefundResult> {
    switch (gateway) {
      case 'stripe':
        return await this.stripe.refund(refundRequest);
      case 'paypal':
        return await this.paypal.refund(refundRequest);
      case 'moyasar':
        return await this.moyasar.refund(refundRequest);
      default:
        return {
          success: false,
          error: `Refund not supported for gateway: ${gateway}`,
        };
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Helper function to initialize payment service with settings
export async function initializePaymentGateways(settings: any) {
  if (settings.paymentGateways?.stripe?.enabled) {
    await paymentService.initialize('stripe', {
      apiKey: settings.paymentGateways.stripe.apiKey,
      mode: settings.paymentGateways.stripe.mode,
    });
  }

  if (settings.paymentGateways?.paypal?.enabled) {
    await paymentService.initialize('paypal', {
      clientId: settings.paymentGateways.paypal.clientId,
      clientSecret: settings.paymentGateways.paypal.clientSecret,
      mode: settings.paymentGateways.paypal.mode,
    });
  }

  if (settings.paymentGateways?.moyasar?.enabled) {
    await paymentService.initialize('moyasar', {
      apiKey: settings.paymentGateways.moyasar.apiKey,
      mode: settings.paymentGateways.moyasar.mode,
    });
  }
}

