import { Course } from "./course.types";

export interface Favorite {
  _id: string;
  course: Course;
  createdAt: string;
}

export interface MyFavoritesResponse {
  data: {
    myFavorites: Favorite[];
  };
}

export interface ToggleFavoriteResponse {
  data: {
    toggleFavorite: boolean;
  };
}

export interface IsFavoriteResponse {
  data: {
    isFavorite: boolean;
  };
}
