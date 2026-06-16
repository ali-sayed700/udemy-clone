import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../order/order.service';
import { CourseProgressService } from '../course-progress/course-progress.service';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  constructor(
    private readonly paymentService: PaymentService,
    private readonly enrollmentService: EnrollmentService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly courseProgressService: CourseProgressService,
  ) {}

  // ── Stripe ──────────────────────────────────────────────

  @Post('stripe/create-checkout-session')
  async createStripeSession(
    @Body()
    body: {
      items: { courseId: string; title: string; price: number }[];
      userId: string;
      successUrl?: string;
    },
    @Res() res: Response,
  ) {
    try {
      const courseIds = body.items.map((i) => i.courseId).join(',');
      const totalAmount = body.items.reduce((sum, item) => sum + item.price, 0);

      const successUrl =
        body.successUrl ||
        `http://localhost:3000/course/payment-success?session_id={CHECKOUT_SESSION_ID}&method=stripe&courseIds=${courseIds}&amount=${totalAmount}`;
      const cancelUrl = `http://localhost:3000/cart`;

      const result = await this.paymentService.createStripeCheckoutSession(
        body.items,
        body.userId,
        successUrl,
        cancelUrl,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: (error as Error).message });
    }
  }

  /**
   * Called by the client after a successful Stripe checkout redirect.
   * Enrolls the user in courses, creates an order, and clears the cart.
   */
  @Post('stripe/confirm-payment')
  async confirmStripePayment(
    @Body()
    body: {
      userId: string;
      courseIds: string; // comma-separated
      sessionId: string;
      amount: number;
    },
    @Res() res: Response,
  ) {
    try {
      const courses = body.courseIds.split(',');
      const amountPerCourse =
        courses.length > 0 ? body.amount / courses.length : 0;

      // Enroll in all courses
      for (const courseId of courses) {
        try {
          await this.enrollmentService.enroll(
            body.userId,
            courseId,
            'stripe',
            body.sessionId,
            amountPerCourse,
          );
          // Initialize course progress after successful enrollment
          await this.courseProgressService.initializeCourseProgress(
            body.userId,
            courseId,
          );
        } catch (e) {
          this.logger.warn(
            `Could not enroll user ${body.userId} in course ${courseId}: ${(e as Error).message}`,
          );
        }
      }

      // Create order record
      try {
        await this.orderService.createOrder(
          body.userId,
          courses,
          'stripe',
          body.sessionId,
          body.amount,
        );
      } catch (e) {
        this.logger.warn(`Could not create order: ${(e as Error).message}`);
      }

      // Clear cart
      await this.cartService.clearCart(body.userId);

      return res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: (error as Error).message });
    }
  }

  // ── PayPal ──────────────────────────────────────────────

  @Post('paypal/create-order')
  async createPayPalOrder(
    @Body()
    body: {
      items: { courseId: string; title: string; price: number }[];
      userId: string;
    },
    @Res() res: Response,
  ) {
    try {
      this.logger.log('🚀 PayPal create-order request received');
      this.logger.log('📋 Raw request body:', JSON.stringify(body, null, 2));

      // Validate items before processing
      if (!body.items || body.items.length === 0) {
        throw new Error('No items in request');
      }

      // Validate each item price
      for (const item of body.items) {
        const price =
          typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        this.logger.log(
          `📦 Item "${item.title}" - Original price: ${item.price} (type: ${typeof item.price}) → Parsed: ${price}`,
        );

        if (isNaN(price) || price <= 0) {
          throw new Error(
            `Invalid price for course "${item.title}": ${item.price} (parsed: ${price})`,
          );
        }
      }

      const totalAmount = body.items.reduce((sum, item) => {
        const price =
          typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + price;
      }, 0);

      this.logger.log('💰 Total amount calculated:', totalAmount);

      if (totalAmount <= 0) {
        throw new Error(
          `Invalid total amount: ${totalAmount}. Prices must be > 0`,
        );
      }

      const result = await this.paymentService.createPayPalOrder(body.items);

      this.logger.log('✅ PayPal order created successfully:', result.orderId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error('❌ PayPal create-order error:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: (error as Error).message });
    }
  }

  @Post('paypal/capture-order')
  async capturePayPalOrder(
    @Body()
    body: {
      orderId: string;
      userId: string;
      courseIds?: string;
      amount?: number;
    },
    @Res() res: Response,
  ) {
    try {
      this.logger.log('🚀 PayPal capture-order request received');
      this.logger.log(
        '📋 OrderID:',
        body.orderId,
        'Length:',
        body.orderId?.length || 'undefined',
      );
      this.logger.log('📋 UserID:', body.userId);
      this.logger.log('📋 CourseIDs:', body.courseIds);
      this.logger.log('📋 Amount:', body.amount);

      if (
        !body.orderId ||
        typeof body.orderId !== 'string' ||
        body.orderId.trim().length === 0
      ) {
        throw new Error(`Invalid orderId: ${body.orderId}`);
      }

      // 📊 VALIDATE ORDER STATUS BEFORE CAPTURE
      this.logger.log('📊 Validating order status before capture...');
      const orderDetails = await this.paymentService.getPayPalOrderDetails(
        body.orderId,
      );

      if (orderDetails.status !== 'APPROVED') {
        this.logger.error(
          '❌ Order not in APPROVED state. Current status:',
          orderDetails.status,
        );
        throw new Error(
          `Order cannot be captured. Status: ${orderDetails.status}. Expected: APPROVED`,
        );
      }

      this.logger.log(
        '✅ Order status is valid (APPROVED). Proceeding with capture...',
      );

      const result = await this.paymentService.capturePayPalOrder(body.orderId);

      this.logger.log('✅ PayPal capture successful:', result);

      if (result.status === 'COMPLETED' && body.courseIds) {
        const courses = body.courseIds.split(',');
        const amountPerCourse = body.amount ? body.amount / courses.length : 0;
        const totalAmount = body.amount || 0;

        this.logger.log('📝 Enrolling user in courses:', courses);

        for (const courseId of courses) {
          try {
            await this.enrollmentService.enroll(
              body.userId,
              courseId,
              'paypal',
              result.paymentId,
              amountPerCourse,
            );
            // Initialize course progress after successful enrollment
            await this.courseProgressService.initializeCourseProgress(
              body.userId,
              courseId,
            );
          } catch (e) {
            this.logger.warn(
              `Could not enroll user ${body.userId} in course ${courseId}: ${(e as Error).message}`,
            );
          }
        }

        // Create order record
        try {
          await this.orderService.createOrder(
            body.userId,
            courses,
            'paypal',
            result.paymentId,
            totalAmount,
          );
        } catch (e) {
          this.logger.warn(`Could not create order: ${(e as Error).message}`);
        }

        // Clear user's cart
        await this.cartService.clearCart(body.userId);
      }

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error('💥 PayPal capture-order error:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: (error as Error).message });
    }
  }

  /**
   * DEBUG ENDPOINT: Test PayPal with a minimal $1.00 order
   * This helps diagnose if the issue is account restrictions or payload issues
   */
  @Post('paypal/debug-test-order')
  async testPayPalOrder(
    @Body() body: { userId: string },
    @Res() res: Response,
  ) {
    try {
      this.logger.log('🧪 DEBUG: Testing PayPal with $1.00 test order');

      const testItems = [
        {
          courseId: 'TEST_COURSE',
          title: 'Test Course',
          price: 1.0, // Minimal amount to test
        },
      ];

      const result = await this.paymentService.createPayPalOrder(testItems);

      this.logger.log('✅ DEBUG TEST PASSED: PayPal accepted the test order');
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Test order created successfully - PayPal account is working!',
        orderId: result.orderId,
      });
    } catch (error) {
      this.logger.error('❌ DEBUG TEST FAILED:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Test order failed',
        error: (error as Error).message,
        advice:
          'Your PayPal sandbox account may have restrictions. Try using Stripe instead.',
      });
    }
  }
}
