"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-[#1F1F1F] border border-[#2E2E2E] shadow-lg">
            <div className="grid gap-1.5">
              {title && <ToastTitle className="text-white font-medium">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-white/80">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-white/60 hover:text-white transition-colors" />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-16 left-1/2 -translate-x-1/2 p-6" />
    </ToastProvider>
  )
}
