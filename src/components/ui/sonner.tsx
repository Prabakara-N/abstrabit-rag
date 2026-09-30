"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group toast !bg-zinc-900 border border-zinc-700 shadow-lg",
          title: "text-zinc-100",
          description: "text-zinc-400",
          success: "!bg-zinc-900 border-green-500/50 text-green-400",
          error: "!bg-zinc-900 border-red-500/50 text-red-400",
          info: "!bg-zinc-900 border-blue-500/50 text-blue-400",
          warning: "!bg-zinc-900 border-yellow-500/50 text-yellow-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
