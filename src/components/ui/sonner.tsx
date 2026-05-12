"use client"

import React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light" // Memaksakan tema terang agar latar belakang selalu putih bersih
      className="toaster group"
      position="top-right"
      closeButton={true}
      richColors={false}
      toastOptions={{
        classNames: {
          // Kelas dipaksa secara eksplisit menjadi putih bersih dengan teks hitam elegan
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200 shadow-xl rounded-xl border",
          description: "group-[.toast]:text-zinc-500",
          actionButton:
            "group-[.toast]:bg-zinc-950 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500",
          closeButton:
            "group-[.toast]:bg-white group-[.toast]:text-zinc-950 group-[.toast]:border-zinc-200 hover:group-[.toast]:bg-zinc-100 transition-colors cursor-pointer",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
