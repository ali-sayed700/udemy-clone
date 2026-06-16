import { Course } from "./course.types";

export interface Cart {
  _id: string;
  user: string;
  items: Course[];
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  data: {
    myCart: Cart;
  };
}
