import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite, FavoriteDocument } from './entities/favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>,
  ) {}

  async toggleFavorite(
    userId: string,
    courseId: string,
  ): Promise<{ isFavorite: boolean; favoriteId?: string }> {
    const existing = await this.favoriteModel.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
    });

    if (existing) {
      await this.favoriteModel.deleteOne({ _id: existing._id });
      return { isFavorite: false };
    } else {
      const fav = new this.favoriteModel({
        user: new Types.ObjectId(userId),
        course: new Types.ObjectId(courseId),
      });
      await fav.save();
      return { isFavorite: true, favoriteId: fav._id.toString() };
    }
  }

  async getMyFavorites(userId: string): Promise<Favorite[]> {
    return this.favoriteModel
      .find({ user: new Types.ObjectId(userId) })
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          model: 'User',
        },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async isFavorite(userId: string, courseId: string): Promise<boolean> {
    const existing = await this.favoriteModel.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
    });
    return !!existing;
  }
}
