"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getAuthUser, isAdmin, isAuthenticated } from "@/lib/auth";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPerfumes: 0,
    totalUsers: 0,
    totalSales: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Cek autentikasi dan role
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      router.push("/");
      return;
    }

    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      // Ambil data statistik dari API Laravel
      const res = await api.get("/api/admin/dashboard");
      setStats(res.data || {});
    } catch (err) {
      console.error("Error fetching stats:", err);
      if (err.response?.status !== 401) {
        setError("Gagal memuat statistik. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="bg-red-900/50 text-red-400 p-4 rounded-lg border border-red-600/30">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard <span className="text-yellow-400">Admin</span></h1>
          <p className="text-gray-400 mt-1">
            Selamat datang, {getAuthUser()?.name}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Parfum"
            value={stats.totalPerfumes}
            color="bg-blue-500/10 text-blue-400 border-blue-500/30"
          />
          <StatCard
            title="Total Pengguna"
            value={stats.totalUsers}
            color="bg-green-500/10 text-green-400 border-green-500/30"
          />
          <StatCard
            title="Penjualan Hari Ini"
            value={`Rp${(stats.totalSales || 0).toLocaleString("id-ID")}`}
            color="bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
          />
          <StatCard
            title="Stok Rendah"
            value={stats.lowStockCount}
            color="bg-red-500/10 text-red-400 border-red-500/30"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 rounded-xl shadow-md border border-yellow-600/30 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Aksi <span className="text-yellow-400">Cepat</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <QuickAction
              label="Tambah Parfum"
              onClick={() => router.push("/admin/perfumes/create")}
              icon="➕"
            />
            <QuickAction
              label="Lihat Semua Parfum"
              onClick={() => router.push("/admin/perfumes")}
              icon="🧾"
            />
            <QuickAction
              label="Kelola Pengguna"
              onClick={() => router.push("/admin/users")}
              icon="👨‍💼"
            />
            <QuickAction
              label="Verifikasi Pesanan"
              onClick={() => router.push("/admin/orders")}
              icon="✅"
            />
            <QuickAction
              label="Lihat Laporan"
              onClick={() => router.push("/admin/reports")}
              icon="📊"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          © 2025 <span className="text-yellow-500">JamalFragrance</span>. Semua hak dilindungi.
        </div>
      </div>
    </div>
  );
}

// Komponen Stat Card
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`rounded-xl p-5 shadow-sm border ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

// Komponen Quick Action
function QuickAction({ label, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 border border-yellow-600/20 rounded-lg transition cursor-pointer"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-white">{label}</span>
    </button>
  );
}
