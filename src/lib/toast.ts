import toast from "react-hot-toast";

/**
 * toast.ts — Reusable toast helpers.
 * Import `showToast` anywhere in the app instead of calling toast() directly.
 * This keeps all toast styling/config in one place.
 */

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string) => toast.dismiss(id),
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) =>
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }),
};
