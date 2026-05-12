/**
 * Konfigurasi Terpusat Lingkungan Klien (Client Environment Configuration)
 * Mengambil variabel dari .env.local dengan fallback bawaan untuk keamanan saat pengembangan.
 */

export const CONFIG = {
  // URL dasar untuk semua pemanggilan REST API Backend
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
};
