// This file provides a utility wrapper around the sonner toast library
// to make it easier to use throughout the application

"use client"

import { toast as sonnerToast, type Toast } from "sonner"

// Re-export the toast function from sonner
export const toast = sonnerToast

// Define toast variants
type ToastVariant = "default" | "destructive" | "success" | "warning"

// Extend the toast options with our custom variants
export interface ToastOptions extends Toast {
  variant?: ToastVariant
  title?: string
  description?: string
  duration?: number
}

// Helper function for more structured toast with title and description
export function showToast({
  title,
  description,
  variant = "default",
  duration = 3000,
  ...props
}: ToastOptions) {
  const style: Record<string, Record<string, string>> = {
    success: {
      borderLeft: "4px solid #10b981", // Green border
      background: "rgba(16, 185, 129, 0.1)", // Light green background
    },
    destructive: {
      borderLeft: "4px solid #ef4444", // Red border
      background: "rgba(239, 68, 68, 0.1)", // Light red background
    },
    warning: {
      borderLeft: "4px solid #f59e0b", // Yellow border
      background: "rgba(245, 158, 11, 0.1)", // Light yellow background
    },
    default: {},
  }

  return toast(description, {
    duration,
    style: style[variant],
    ...props,
  })
}

// Export a simple interface to use with the toast component
export type ToastActionElement = React.ReactElement 