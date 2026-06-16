"use client";

import {
  useGetCartQuery,
  useRemoveFromCartMutation,
} from "@/service/cart/cart.useQuery";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCheckout } from "@/hooks/useCheckout";
import CartItemCard from "@/components/cart/CartItemCard";
import CheckoutSummary from "@/components/cart/CheckoutSummary";

export default function CartPage() {
  const { userId, isLoading: loadingUser } = useCurrentUser();
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();
  const { mutateAsync: removeFromCart } = useRemoveFromCartMutation();

  const cartItems = cartData?.items || [];
  const loading = loadingUser || isCartLoading;
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  const {
    isProcessing,
    handleStripeCheckout,
    createPayPalOrder,
    capturePayPalOrder,
  } = useCheckout(cartItems, userId, totalPrice);

  async function handleRemoveItem(courseId: string) {
    if (!courseId) {
      toast.error("Error: Could not identify the course.");
      return;
    }
    try {
      await removeFromCart(courseId);
      toast.success("Course removed from cart.");
    } catch (error) {
      toast.error(
        `Failed to remove course: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // ── Not Signed In ──
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <ShoppingCart className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Please Sign In
        </h2>
        <p className="text-slate-500 mb-6">
          You need to sign in to access your cart
        </p>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    );
  }

  // ── Empty Cart ──
  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Shopping Cart
        </h1>
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <ShoppingCart className="h-20 w-20 text-slate-300 mb-6" />
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-slate-500 mb-8 max-w-md">
            Looks like you haven&apos;t added any courses to your cart yet. Keep
            exploring to find a course you&apos;ll love!
          </p>
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 py-6 px-8 text-lg rounded-xl"
          >
            <Link href="/">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Cart with Items ──
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">
            {cartItems.length} {cartItems.length === 1 ? "Course" : "Courses"}{" "}
            in Cart
          </h2>
          {cartItems.map((item) => (
            <CartItemCard
              key={item._id}
              item={item}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        {/* Checkout Summary */}
        <CheckoutSummary
          totalPrice={totalPrice}
          isProcessing={isProcessing}
          onStripeCheckout={handleStripeCheckout}
          onCreatePayPalOrder={createPayPalOrder}
          onCapturePayPalOrder={capturePayPalOrder}
        />
      </div>
    </div>
  );
}
