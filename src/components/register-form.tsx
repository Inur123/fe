import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { CONFIG } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RegisterFormProps extends React.ComponentPropsWithoutRef<"div"> {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({
  className,
  onSuccess,
  onSwitchToLogin,
  ...props
}: RegisterFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      // Menggunakan URL dasar terpusat dari konfigurasi sistem
      const res = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccessMsg("Akun berhasil dibuat! Mengalihkan ke halaman masuk...")
        setTimeout(() => {
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        setError(data.error || "Gagal mendaftarkan akun.")
      }
    } catch (err) {
      setError("Gagal terhubung ke server backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Daftar Akun Baru</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Lengkapi data di bawah ini untuk bergabung dengan Laci Cabang v3
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20 text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 border border-green-500/20 text-center font-medium">
            {successMsg}
          </div>
        )}

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="reg-name">Nama Lengkap</Label>
            <Input
              id="reg-name"
              type="text"
              placeholder="Nama Anda"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="nama@cabang.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reg-password">Password</Label>
            
            {/* Input Password Terintegrasi dengan Tombol Eye Toggle */}
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                className="pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
                title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Mendaftarkan..." : "Buat Akun"}
          </Button>
        </div>
      </form>

      <div className="text-center text-sm">
        Sudah memiliki akun?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="underline underline-offset-4 font-medium text-primary hover:text-primary/80"
        >
          Masuk di sini
        </button>
      </div>
    </div>
  )
}
