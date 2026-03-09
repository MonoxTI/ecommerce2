// components/PayFastForm.tsx
// Drop this on your checkout page after creating an order.
//
// Usage:
//   const { fields, actionUrl } = await fetch('/api/payments/initiate', {
//     method: 'POST',
//     body: JSON.stringify({ orderId })
//   }).then(r => r.json()).then(r => r.data)
//
//   <PayFastForm fields={fields} actionUrl={actionUrl} />
//
// The form auto-submits on mount, redirecting the user to PayFast.
// Show a loading spinner while it submits.

"use client";

import { useEffect, useRef } from "react";

interface PayFastFormProps {
  fields:    Record<string, string>;
  actionUrl: string;
  autoSubmit?: boolean; // default true
}

export default function PayFastForm({
  fields,
  actionUrl,
  autoSubmit = true,
}: PayFastFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (autoSubmit && formRef.current) {
      formRef.current.submit();
    }
  }, [autoSubmit]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      {/* Loading state shown while form auto-submits */}
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-600">Redirecting to PayFast...</p>
      </div>

      {/* Hidden form — auto-submits via useEffect */}
      <form
        ref={formRef}
        method="POST"
        action={actionUrl}
        className="hidden"
      >
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

        {/* Fallback button if auto-submit fails */}
        <button type="submit">Pay with PayFast</button>
      </form>

      {/* Visible fallback button */}
      {!autoSubmit && (
        <button
          onClick={() => formRef.current?.submit()}
          className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Pay with PayFast
        </button>
      )}
    </div>
  );
}