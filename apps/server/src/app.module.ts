import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from './mongo/mongo.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Request, Response } from 'express';
import { FilesUploadModule } from './files-upload/files-upload.module';
import { LectureModule } from './lecture/lecture.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { CourseProgressModule } from './course-progress/course-progress.module';
import { PaymentModule } from './payment/payment.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { FavoriteModule } from './favorite/favorite.module';
import { SectionModule } from './section/section.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { GqlThrottlerGuard } from './auth/guards/gql-throttler.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Rate Limiting ──
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20, // Adjust limits as necessary
        },
      ],
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    MongoModule,
    AuthModule,
    UserModule,
    CourseModule,
    LectureModule,
    CloudinaryModule,
    FilesUploadModule,
    EnrollmentModule,
    CourseProgressModule,
    PaymentModule,
    CartModule,
    OrderModule,
    FavoriteModule,
    SectionModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
