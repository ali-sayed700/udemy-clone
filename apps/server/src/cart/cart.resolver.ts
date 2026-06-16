import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CourseIdArgs } from '../shared/dto/course-id.args';

export interface GraphqlContext {
  req: {
    user: {
      userId: string;
      role?: string;
    };
  };
}

@Resolver(() => Cart)
@UseGuards(JwtAuthGuard)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => Cart, { description: 'Get the current user cart' })
  async myCart(@Context() context: GraphqlContext) {
    const userId = context.req.user.userId;
    return this.cartService.getCart(userId);
  }

  @Mutation(() => Cart)
  async addToCart(
    @Args() { courseId }: CourseIdArgs,
    @Context() context: GraphqlContext,
  ) {
    const userId = context.req.user.userId;
    return this.cartService.addItem(userId, courseId);
  }

  @Mutation(() => Cart)
  async removeFromCart(
    @Args() { courseId }: CourseIdArgs,
    @Context() context: GraphqlContext,
  ) {
    const userId = context.req.user.userId;
    return this.cartService.removeItem(userId, courseId);
  }

  @Mutation(() => Boolean)
  async clearCart(@Context() context: GraphqlContext) {
    const userId = context.req.user.userId;
    await this.cartService.clearCart(userId);
    return true;
  }
}
