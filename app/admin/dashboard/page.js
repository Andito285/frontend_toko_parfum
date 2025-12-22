"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuthUser, isAdmin, isAuthenticated, getAuthToken } from "@/lib/auth";

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
      const token = getAuthToken();
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Ambil data statistik dari API Laravel
      const res = await axios.get(`${baseURL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data || {});
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Gagal memuat statistik. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">
            Selamat datang, {getAuthUser()?.name}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Parfum"
            value={stats.totalPerfumes}
            icon="📦"
            color="bg-blue-50 text-blue-700"
          />
          <StatCard
            title="Total Pengguna"
            value={stats.totalUsers}
            icon="👥"
            color="bg-green-50 text-green-700"
          />
          <StatCard
            title="Penjualan Hari Ini"
            value={`Rp${(stats.totalSales || 0).toLocaleString("id-ID")}`}
            icon="💰"
            color="bg-yellow-50 text-yellow-700"
          />
          <StatCard
            title="Stok Rendah"
            value={stats.lowStockCount}
            icon="⚠️"
            color="bg-red-50 text-red-700"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              label="Lihat Laporan"
              onClick={() => router.push("/admin/reports")}
              icon="📊"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          © 2025 JamalFragrance. Semua hak dilindungi.
        </div>
      </div>
    </div>
  );
}

// Komponen Stat Card
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`rounded-xl p-5 shadow-sm ${color}`}>
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
      className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition cursor-pointer"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </button>
  );
}
