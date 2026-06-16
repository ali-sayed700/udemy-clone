"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PayPalCheckoutButtonsProps {
  createOrder: () => Promise<string>;
  onApprove: (orderId: string) => Promise<void>;
  onError: (message: string) => void;
}

export default function PayPalCheckoutButtons({
  createOrder,
  onApprove,
  onError,
}: PayPalCheckoutButtonsProps) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        currency: process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD",
      }}
    >
      <PayPalButtons
        style={{
          layout: "vertical",
          shape: "rect",
          height: 50,
        }}
        createOrder={async () => {
          const orderId = await createOrder();
          if (!orderId) {
            throw new Error("No order ID received from PayPal");
          }
          return orderId;
        }}
        onApprove={async (data) => {
          await onApprove(data.orderID);
        }}
        onError={(err) => {
          onError(
            err instanceof Error ? err.message : "PayPal encountered an error",
          );
        }}
      />
    </PayPalScriptProvider>
  );
}
