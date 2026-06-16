import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { Favorite } from './entities/favorite.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CourseIdArgs } from '../shared/dto/course-id.args';

@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async toggleFavorite(
    @Args() { courseId }: CourseIdArgs,
    @Context() context: { req: { user: { userId: string } } },
  ): Promise<boolean> {
    const result = await this.favoriteService.toggleFavorite(
      context.req.user.userId,
      courseId,
    );
    return result.isFavorite;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Favorite])
  async myFavorites(
    @Context() context: { req: { user: { userId: string } } },
  ): Promise<Favorite[]> {
    return this.favoriteService.getMyFavorites(context.req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  async isFavorite(
    @Args() { courseId }: CourseIdArgs,
    @Context() context: { req: { user: { userId: string } } },
  ): Promise<boolean> {
    return this.favoriteService.isFavorite(context.req.user.userId, courseId);
  }
}
