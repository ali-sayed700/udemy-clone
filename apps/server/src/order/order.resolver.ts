import { Resolver, Query, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/entities/user.entity';

export interface GraphqlContext {
  req: {
    user: {
      userId: string;
      role?: string;
    };
  };
}

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [Order], {
    name: 'myOrders',
    description: 'Get all orders for the current user',
  })
  async myOrders(@Context() context: GraphqlContext): Promise<Order[]> {
    const { userId } = context.req.user;
    return this.orderService.findByUser(userId);
  }

  @Roles(UserRole.Admin, UserRole.Instructor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [Order], {
    name: 'dashboardOrders',
    description: 'Get orders visible to admins or the current instructor',
  })
  async dashboardOrders(@Context() context: GraphqlContext): Promise<Order[]> {
    const { userId, role } = context.req.user;
    return this.orderService.findForDashboard(userId, role);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Order, {
    name: 'order',
    description: 'Get a specific order by ID',
  })
  async order(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GraphqlContext,
  ): Promise<Order> {
    const { userId, role } = context.req.user;
    return this.orderService.findByIdForUser(id, userId, role);
  }
}
