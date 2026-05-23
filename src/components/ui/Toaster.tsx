"use client";

import { Toaster as HotToaster } from "react-hot-toast";

/**
 * Toaster — drop this once in the root layout.
 * Use the `toast` util from @/lib/toast anywhere in the app.
 */
export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "10px",
          background: "#18181b",
          color: "#fafafa",
          fontSize: "14px",
          padding: "12px 16px",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#fafafa",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fafafa",
          },
        },
      }}
    />
  );
}
