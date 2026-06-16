import { Field, InputType, Float } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

@InputType()
export class NumberComparisonInput {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  gt?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  gte?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  lt?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  lte?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  eq?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  ne?: number;
}

// course.query.input.ts
@InputType()
export class QueryArgs {
  // pagination
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  page?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  limit?: string;

  // fields
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fields?: string;

  // search
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  keyword?: string;

  // filters
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categories?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  level?: string;

  @Field(() => NumberComparisonInput, { nullable: true })
  @IsOptional()
  price?: NumberComparisonInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  // sorting
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sort?: string;

  // @Field({ nullable: true })
  // order?: 'asc' | 'desc';
}
