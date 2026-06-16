import { InputType, Field, ID, Float } from '@nestjs/graphql';

@InputType()
export class CreateOrderInput {
  @Field(() => [ID])
  courseIds: string[];

  @Field()
  paymentMethod: string;

  @Field()
  paymentId: string;

  @Field(() => Float)
  totalAmount: number;
}
