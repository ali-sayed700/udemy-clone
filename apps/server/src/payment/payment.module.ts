import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { CartModule } from '../cart/cart.module';
import { OrderModule } from '../order/order.module';
import { CourseProgressModule } from '../course-progress/course-progress.module';

@Module({
  imports: [EnrollmentModule, CartModule, OrderModule, CourseProgressModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
