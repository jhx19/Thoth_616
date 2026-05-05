import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/shared/Toast"

export const metadata: Metadata = {
  title: "Project Thoth",
  description: "AI-powered knowledge management system",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
