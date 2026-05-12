"use client";

import React, { useState, useEffect } from "react";

// Struktur antarmuka data pengguna
interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default function AuthPage() {
  // Pengaturan mode tampilan halaman
  const [view, setView] = useState<"login" | "register" | "profile">("login");
  
  // State data otentikasi
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // State form input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State umpan balik UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Periksa sesi pengguna (token) saat komponen dimuat
  useEffect(() => {
    const storedToken = localStorage.getItem("laci_token");
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    }
  }, []);

  // Mengambil profil pengguna yang terautentikasi
  const fetchProfile = async (jwtToken: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/me", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setView("profile");
      } else {
        // Token tidak valid atau kedaluwarsa
        localStorage.removeItem("laci_token");
        setToken(null);
      }
    } catch (err) {
      console.error("Gagal memverifikasi sesi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Menangani penyerahan formulir Pendaftaran
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.");
        // Reset formulir dan alihkan ke mode login
        setName("");
        setPassword("");
        setView("login");
      } else {
        setError(data.error || "Gagal melakukan pendaftaran.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  // Menangani penyerahan formulir Masuk (Login)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        // Simpan token secara lokal
        localStorage.setItem("laci_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setSuccess("Selamat datang kembali!");
        setPassword(""); // Bersihkan kata sandi demi keamanan
        setView("profile");
      } else {
        setError(data.error || "Email atau kata sandi tidak sesuai.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  // Menangani tindakan Keluar (Logout)
  const handleLogout = async () => {
    setLoading(true);
    try {
      // Panggil endpoint logout di server (opsional untuk stateless JWT)
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
      }).catch(() => {}); // Abaikan jika server terputus
    } finally {
      localStorage.removeItem("laci_token");
      setToken(null);
      setUser(null);
      setSuccess("Anda telah berhasil keluar dari sesi.");
      setView("login");
      setLoading(false);
    }
  };

  // Ekstrak inisial nama untuk Avatar
  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    return fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <main className="auth-container">
      {/* Efek Latar Belakang Ambien Premium */}
      <div className="ambient-glow top-left" />
      <div className="ambient-glow bottom-right" />

      {/* Wadah Utama Glassmorphism */}
      <div className="glass-card">
        {/* Pesan Sukses / Error Global */}
        {error && (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            <span>✓</span> {success}
          </div>
        )}

        {/* TAMPILAN 1: MASUK (LOGIN) */}
        {view === "login" && (
          <div>
            <h1 className="heading-premium">Masuk Akun</h1>
            <p className="subheading">Portal akses aman Laci Cabang v3</p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">Alamat Email</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="nama@cabang.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password" className="form-label">Kata Sandi</label>
                <input
                  id="login-password"
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                className="btn-premium"
                disabled={loading}
              >
                {loading ? <div className="spinner" /> : "Masuk Sekarang"}
              </button>
            </form>

            <div className="link-switch" onClick={() => { setView("register"); setError(null); setSuccess(null); }}>
              Belum memiliki akun? <span id="link-to-register">Daftar di sini</span>
            </div>
          </div>
        )}

        {/* TAMPILAN 2: PENDAFTARAN (REGISTER) */}
        {view === "register" && (
          <div>
            <h1 className="heading-premium">Pendaftaran Akun</h1>
            <p className="subheading">Bergabunglah dengan ekosistem Laci Cabang</p>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">Nama Lengkap</label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Nama Pengguna"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-email" className="form-label">Alamat Email</label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="nama@cabang.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">Kata Sandi</label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={6}
                  className="form-input"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                className="btn-premium"
                disabled={loading}
              >
                {loading ? <div className="spinner" /> : "Buat Akun Baru"}
              </button>
            </form>

            <div className="link-switch" onClick={() => { setView("login"); setError(null); setSuccess(null); }}>
              Sudah memiliki akun? <span id="link-to-login">Masuk di sini</span>
            </div>
          </div>
        )}

        {/* TAMPILAN 3: PROFIL PENGGUNA (SESI AKTIF) */}
        {view === "profile" && (
          <div className="profile-card">
            <h1 className="heading-premium" style={{ fontSize: "1.6rem" }}>Dasbor Pengguna</h1>
            <p className="subheading" style={{ marginBottom: "20px" }}>Sesi aktif terautentikasi secara aman</p>

            <div className="avatar-placeholder">
              {getInitials(user?.name || "")}
            </div>

            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
              {user?.name || "Pengguna"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {user?.email || "-"}
            </p>

            <div className="profile-meta">
              <div className="profile-meta-item">
                <span style={{ color: "var(--text-muted)" }}>ID Pengguna</span>
                <span style={{ fontWeight: 600, color: "#fff" }}>#{user?.id}</span>
              </div>
              <div className="profile-meta-item">
                <span style={{ color: "var(--text-muted)" }}>Bergabung Pada</span>
                <span style={{ color: "#fff" }}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  }) : "-"}
                </span>
              </div>
              <div className="profile-meta-item">
                <span style={{ color: "var(--text-muted)" }}>Status Sesi</span>
                <span style={{ color: "var(--success-color)", fontWeight: 600 }}>• Terverifikasi (JWT)</span>
              </div>
            </div>

            <button
              id="btn-action-logout"
              onClick={handleLogout}
              className="btn-premium"
              style={{ background: "linear-gradient(135deg, #ff4d4d, #cc0000)" }}
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : "Keluar (Logout)"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
