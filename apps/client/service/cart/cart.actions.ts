"use server";

import { authFetchGraphQL } from "@/lib/api/fetchGraphqlServer";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { GET_MY_CART, GET_MY_CART_COUNT, ADD_TO_CART_MUTATION, REMOVE_FROM_CART_MUTATION } from "@/lib/graphql/cart";

export async function getCartAction() {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return null;
    }

    const data = await authFetchGraphQL(GET_MY_CART);
    if (!data?.myCart) {
      throw new Error("Failed to fetch cart");
    }
    return data.myCart;
  } catch (error) {
    throw new Error(
      `Failed to fetch cart: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function getCartCountAction() {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return 0;
    }

    const data = await authFetchGraphQL(GET_MY_CART_COUNT);
    return data?.myCart?.items?.length || 0;
  } catch (error) {
    throw new Error(
      `Failed to fetch cart count: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function removeFromCartAction(courseId: string) {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return null;
    }

    if (!courseId) {
      throw new Error("Course ID is required");
    }

    const data = await authFetchGraphQL(REMOVE_FROM_CART_MUTATION, { courseId });

    if (!data?.removeFromCart) {
      throw new Error("Failed to remove course from cart");
    }

    revalidatePath("/cart");
    return data.removeFromCart;
  } catch (error) {
    throw new Error(
      `Failed to remove from cart: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function addToCartAction(courseId: string) {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return null;
    }

    if (!courseId) {
      throw new Error("Course ID is required");
    }

    const data = await authFetchGraphQL(ADD_TO_CART_MUTATION, { courseId });

    if (!data?.addToCart) {
      throw new Error("Server did not return cart data after adding course");
    }

    revalidatePath("/cart");
    return data.addToCart;
  } catch (error) {
    throw new Error(
      `Failed to add course to cart: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
