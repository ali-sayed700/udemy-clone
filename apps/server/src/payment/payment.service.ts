import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

interface CourseItem {
  courseId: string;
  title: string;
  price: number;
}

interface PayPalTokenResponse {
  access_token?: string;
}

interface PayPalOrderResponse {
  id?: string;
  links?: { rel: string; href: string }[];
  message?: string;
}

interface PayPalCaptureResponse {
  id?: string;
  status?: string;
  message?: string;
}

interface PayPalOrderDetails {
  id: string;
  status: string;
  purchase_units: any[];
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe;
  private readonly MAX_RETRIES = 3;
  private readonly PAYPAL_SANDBOX_URL = 'https://api-m.sandbox.paypal.com';
  private readonly PAYPAL_PRODUCTION_URL = 'https://api-m.paypal.com';
  private readonly SUPPORTED_CURRENCIES = [
    'USD',
    'EUR',
    'GBP',
    'AUD',
    'CAD',
    'CHF',
    'CZK',
    'DKK',
    'HKD',
    'HUF',
    'INR',
    'ILS',
    'JPY',
    'MXN',
    'MYR',
    'NOK',
    'NZD',
    'PHP',
    'PLN',
    'SEK',
    'SGD',
    'THB',
    'ZAR',
    'CNY',
    'RUB',
  ];

  constructor(private configService: ConfigService) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey);
    }
  }

  // ── Stripe ──────────────────────────────────────────────

  async createStripeCheckoutSession(
    items: CourseItem[],
    userId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ sessionId: string; url: string }> {
    const courseIds = items.map((item) => item.courseId).join(',');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        courseIds,
        userId,
      },
    });

    return { sessionId: session.id, url: session.url! };
  }

  // ── PayPal Helper Methods ──────────────────────────────

  private async getPayPalAccessToken(): Promise<string> {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    const baseUrl = this.getPayPalBaseUrl();
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      // const errorText = await response.text();
      throw new Error(`PayPal authentication failed: ${response.status}`);
    }

    const data = (await response.json()) as PayPalTokenResponse;
    if (!data.access_token) {
      throw new Error('PayPal authentication returned no token');
    }

    return data.access_token;
  }

  private getPayPalBaseUrl(): string {
    const mode = this.configService.get<string>('PAYPAL_MODE') || 'sandbox';
    return mode === 'sandbox'
      ? this.PAYPAL_SANDBOX_URL
      : this.PAYPAL_PRODUCTION_URL;
  }

  private getPayPalCurrency(): string {
    const currency = this.configService.get<string>('PAYPAL_CURRENCY') || 'USD';

    if (!this.SUPPORTED_CURRENCIES.includes(currency)) {
      this.logger.warn(
        `Currency "${currency}" not supported. Using USD instead.`,
      );
      return 'USD';
    }

    return currency;
  }

  private parsePrice(price: unknown): number {
    const parsed =
      typeof price === 'string' ? parseFloat(price) : (price as number);

    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(`Invalid price: ${String(price)}`);
    }

    return parsed;
  }

  private validateItems(items: CourseItem[]): void {
    if (!items?.length) {
      throw new Error('No items provided');
    }

    for (const item of items) {
      // const price = this.parsePrice(item.price);
      if (!item.title?.trim()) {
        throw new Error('Course title is missing or empty');
      }
    }
  }

  private sanitizeTitle(title: string): string {
    return title.substring(0, 100).replace(/[^\w\s\-.()]/g, '');
  }

  private formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // ── PayPal Order Management ────────────────────────────

  async createPayPalOrder(
    items: CourseItem[],
    // userId: string,
  ): Promise<{ orderId: string; approvalUrl: string }> {
    try {
      this.validateItems(items);

      const accessToken = await this.getPayPalAccessToken();
      const baseUrl = this.getPayPalBaseUrl();
      const currency = this.getPayPalCurrency();

      const itemsArray = this.buildPayPalItems(items, currency);
      const totalAmount: number = (
        itemsArray as Array<{ unit_amount: { value: string } }>
      ).reduce(
        (sum: number, item: { unit_amount: { value: string } }): number => {
          return sum + parseFloat(String(item.unit_amount.value));
        },
        0,
      );
      const courseIds = items.map((item) => item.courseId).join(',');

      const orderPayload = this.buildPayPalOrderPayload(
        items,
        itemsArray,
        courseIds,
        currency,
        this.formatPrice(totalAmount),
      );

      const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        await this.handlePayPalError(response, 'Order creation failed');
      }

      const data = (await response.json()) as PayPalOrderResponse;

      if (!data.id) {
        throw new Error('PayPal order creation returned no order ID');
      }

      const approvalUrl =
        data.links?.find((l) => l.rel === 'approve')?.href || '';

      return { orderId: data.id, approvalUrl };
    } catch (error) {
      this.logger.error('Failed to create PayPal order', error);
      throw error;
    }
  }

  private buildPayPalItems(items: CourseItem[], currency: string): Array<any> {
    return items.map((item) => {
      const price = this.parsePrice(item.price);
      const priceStr = this.formatPrice(price);
      const sanitizedTitle = this.sanitizeTitle(item.title);

      return {
        name: sanitizedTitle,
        description: `Course: ${item.courseId}`,
        sku: item.courseId,
        unit_amount: {
          currency_code: currency,
          value: priceStr,
        },
        quantity: '1',
        category: 'DIGITAL_GOODS',
      };
    });
  }

  private buildPayPalOrderPayload(
    items: CourseItem[],
    itemsArray: any[],
    courseIds: string,
    currency: string,
    totalAmount: string,
  ): object {
    const frontendUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    const firstCourseId = items[0]?.courseId || 'course';

    return {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `REF${Date.now().toString().slice(-10)}`,
          description: 'Course purchase',
          custom_id: courseIds.substring(0, 50),
          amount: {
            currency_code: currency,
            value: totalAmount,
            breakdown: {
              item_total: {
                currency_code: currency,
                value: totalAmount,
              },
            },
          },
          items: itemsArray,
        },
      ],
      application_context: {
        brand_name: 'Udemy Clone',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${frontendUrl}/course/${firstCourseId}`,
        cancel_url: `${frontendUrl}/cart`,
      },
    };
  }

  private async handlePayPalError(
    response: Response,
    context: string,
  ): Promise<void> {
    const errorText = await response.text();

    try {
      const errorData = JSON.parse(errorText) as {
        details?: Array<{ description?: string }>;
        message?: string;
      };
      const message: string =
        String(errorData?.details?.[0]?.description || '') ||
        String(errorData?.message || '') ||
        'Unknown error';
      throw new Error(`PayPal ${context}: ${message}`);
    } catch {
      throw new Error(
        `PayPal ${context}: ${response.status} - ${errorText.substring(0, 200)}`,
      );
    }
  }

  async capturePayPalOrder(
    orderId: string,
  ): Promise<{ status: string; paymentId: string }> {
    this.validateOrderId(orderId);

    for (let _attempt = 1; _attempt <= this.MAX_RETRIES; _attempt++) {
      try {
        const accessToken = await this.getPayPalAccessToken();
        const baseUrl = this.getPayPalBaseUrl();

        const response = await fetch(
          `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!response.ok) {
          await this.handleCaptureError(response);
        }

        const data = (await response.json()) as PayPalCaptureResponse;

        if (!data.id || !data.status) {
          throw new Error(
            'PayPal capture returned invalid response: missing id or status',
          );
        }

        return {
          status: data.status,
          paymentId: data.id,
        };
      } catch (error) {
        if (_attempt === this.MAX_RETRIES) {
          this.logger.error(
            'Failed to capture PayPal order after retries',
            error,
          );
          throw error;
        }

        if (error instanceof Error && !this.isRetryableError(error.message)) {
          throw error;
        }

        const waitTime = Math.pow(2, _attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    throw new Error('PayPal capture failed after retries');
  }

  private validateOrderId(orderId: string): void {
    if (
      !orderId ||
      typeof orderId !== 'string' ||
      orderId.trim().length === 0
    ) {
      throw new Error(`Invalid orderId: ${orderId}`);
    }
  }

  private async handleCaptureError(response: Response): Promise<void> {
    const responseText = await response.text();

    try {
      const errorData = JSON.parse(responseText) as {
        details?: Array<{ description?: string; issue?: string }>;
        message?: string;
      };
      const message: string =
        String(errorData?.details?.[0]?.description || '') ||
        String(errorData?.message || '') ||
        'Unknown error';
      const issue: string =
        String(errorData?.details?.[0]?.issue || '') || 'UNKNOWN_ISSUE';

      if (
        issue === 'COMPLIANCE_VIOLATION' ||
        issue === 'AUTHENTICATION_FAILURE'
      ) {
        throw new Error(`PayPal capture failed: ${issue} - ${message}`);
      }

      throw new Error(`PayPal capture failed: ${message}`);
    } catch {
      throw new Error(
        `PayPal capture failed: ${response.status} - ${responseText.substring(0, 200)}`,
      );
    }
  }

  private isRetryableError(errorMessage: string): boolean {
    return (
      !errorMessage.includes('COMPLIANCE_VIOLATION') &&
      !errorMessage.includes('AUTHENTICATION')
    );
  }

  async getPayPalOrderDetails(orderId: string): Promise<PayPalOrderDetails> {
    try {
      this.validateOrderId(orderId);

      const accessToken = await this.getPayPalAccessToken();
      const baseUrl = this.getPayPalBaseUrl();

      const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await this.handlePayPalError(response, 'Cannot fetch order details');
      }

      const data = (await response.json()) as PayPalOrderDetails;

      return {
        id: data.id || '',
        status: data.status || 'UNKNOWN',
        purchase_units: data.purchase_units || [],
      };
    } catch (error) {
      this.logger.error('Failed to fetch PayPal order details', error);
      throw error;
    }
  }
}
