import React, { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { CONFIG } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  onSuccess?: (user: any, token: string) => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({
  className,
  onSuccess,
  onSwitchToRegister,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("laci_token", data.token)
        // Simpan role & perms ke cache agar sidebar bisa membacanya sebelum fetch /me selesai
        if (data.user?.role?.name) {
          localStorage.setItem("laci_role", data.user.role.name);
          const perms = (data.user.role.permissions || []).map((p: any) => p.name);
          localStorage.setItem("laci_perms", JSON.stringify(perms));
        }
        // Pemanggilan toast monokrom khas Shadcn UI saat sukses
        toast("Login Berhasil", {
          description: `Selamat datang kembali, ${data.user?.name || "Pengguna"}.`,
        })
        if (onSuccess) onSuccess(data.user, data.token)
      } else {
        // Kesalahan sandi/email dimunculkan secara inline di halaman form
        setError(data.error || "Email atau password yang Anda masukkan salah.")
      }
    } catch (err) {
      setError("Gagal menghubungi server backend lokal.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Masuk ke Akun Anda</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Masukkan email terdaftar Anda di bawah ini
          </p>
        </div>

        {/* Kotak Error Inline Halaman Formulir */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 text-center font-medium">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@cabang.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="text-sm underline-offset-4 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Lupa password?
              </a>
            </div>
            
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
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
          <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </div>
      </form>

      <div className="text-center text-sm">
        Belum memiliki akun?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="underline underline-offset-4 font-medium text-primary hover:text-primary/80"
        >
          Daftar sekarang
        </button>
      </div>
    </div>
  )
}
