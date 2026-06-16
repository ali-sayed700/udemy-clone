"use client";
import { logger } from "@/lib/logger";

import { useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import { PAYPAL_CLIENT_ID, PAYPAL_CURRENCY } from "@/lib/constants";

interface CheckoutSummaryProps {
  totalPrice: number;
  isProcessing: boolean;
  onStripeCheckout: () => void;
  onCreatePayPalOrder: () => Promise<string>;
  onCapturePayPalOrder: (orderId: string) => Promise<void>;
}

export default function CheckoutSummary({
  totalPrice,
  isProcessing,
  onStripeCheckout,
  onCreatePayPalOrder,
  onCapturePayPalOrder,
}: CheckoutSummaryProps) {
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");

  return (
    <div className="w-full lg:w-96">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 lg:sticky lg:top-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Total:</h3>
        <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 font-mono tracking-tight">
          ${totalPrice.toFixed(2)}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
              Select Payment Method
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod("stripe")}
                className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === "stripe"
                    ? "border-indigo-500 bg-indigo-50/50 text-indigo-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <CreditCard className="h-6 w-6" />
                <span className="font-semibold text-sm">Stripe</span>
              </button>
              <button
                onClick={() => setPaymentMethod("paypal")}
                className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === "paypal"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <ShieldCheck className="h-6 w-6" />
                <span className="font-semibold text-sm">PayPal</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            {paymentMethod === "stripe" ? (
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg py-7 rounded-xl transition-all duration-300 shadow-lg"
                onClick={onStripeCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  "Checkout with Stripe"
                )}
              </Button>
            ) : PAYPAL_CLIENT_ID ? (
              <PayPalScriptProvider
                options={{
                  clientId: PAYPAL_CLIENT_ID,
                  currency: PAYPAL_CURRENCY,
                }}
              >
                <PayPalButtons
                  style={{ layout: "vertical", shape: "rect", height: 50 }}
                  createOrder={async () => {
                    const orderId = await onCreatePayPalOrder();
                    if (!orderId) throw new Error("No order ID received");
                    return orderId;
                  }}
                  onApprove={async (data) => {
                    try {
                      await onCapturePayPalOrder(data.orderID);
                    } catch {
                      toast.error("Failed to complete payment. Please try again.");
                    }
                  }}
                  onError={(err) => {
                    const error =
                      err instanceof Error
                        ? err
                        : new Error("PayPal encountered an error");

                    logger.error("PayPal SDK error:", error);
                    toast.error(error.message);
                  }}
                />
              </PayPalScriptProvider>
            ) : (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-7 rounded-xl"
                disabled
              >
                PayPal not configured
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
