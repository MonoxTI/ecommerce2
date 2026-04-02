// components/PaystackCheckout.tsx
// Paystack payment integration.
//
// Usage:
//   const { authorizationUrl } = await fetch('/api/payments/initiate-paystack', {
//     method: 'POST',
//     body: JSON.stringify({ orderId })
//   }).then(r => r.json()).then(r => r.data)
//
//   <PaystackCheckout authorizationUrl={authorizationUrl} />
//
// The component redirects to Paystack's hosted checkout page.

"use client";

import { useEffect } from "react";

interface PaystackCheckoutProps {
  authorizationUrl: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PaystackCheckout({
  authorizationUrl,
  onSuccess,
  onError,
}: PaystackCheckoutProps) {
  useEffect(() => {
    if (authorizationUrl) {
      // Redirect to Paystack checkout
      window.location.href = authorizationUrl;
    }
  }, [authorizationUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-600">Redirecting to Paystack...</p>
      </div>

      {/* Fallback link in case redirect doesn't work */}
      <a
        href={authorizationUrl}
        className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Continue to Paystack
      </a>
    </div>
  );
}