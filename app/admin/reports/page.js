"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { isAuthenticated, isAdmin, getAuthToken } from "@/lib/auth";

export default function ReportsPage() {
    const [reports, setReports] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const router = useRouter();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }
        if (!isAdmin()) {
            router.push("/");
            return;
        }
        fetchData();
    }, [router]);

    const fetchData = async () => {
        try {
            const token = getAuthToken();
            const [reportsRes, ordersRes] = await Promise.all([
                axios.get(`${baseURL}/api/admin/reports`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${baseURL}/api/admin/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setReports(reportsRes.data);
            setOrders(ordersRes.data.data || ordersRes.data || []);
        } catch (err) {
            console.error("Error fetching reports:", err);
            setError("Gagal memuat laporan.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat laporan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">📊 Laporan & Analitik</h1>
                        <p className="text-gray-600 mt-1">Pantau perkembangan bisnis Anda</p>
                    </div>
                    <Link
                        href="/admin/dashboard"
                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        ← Kembali ke Dashboard
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        ❌ {error}
                    </div>
                )}

                {/* Summary Cards */}
                {reports?.summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Pendapatan</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatCurrency(reports.summary.totalRevenue)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">💰</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Pesanan</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {reports.summary.totalOrders}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">📦</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Rata-rata Transaksi</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatCurrency(reports.summary.avgOrderValue)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">📈</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pendapatan Bulan Ini</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatCurrency(reports.summary.thisMonthRevenue)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">📅</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "overview"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        📊 Summary
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "orders"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        📦 Riwayat Pesanan
                    </button>
                </div>

                {activeTab === "overview" && reports && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Sales */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Penjualan 7 Hari Terakhir
                            </h3>
                            <div className="space-y-3">
                                {reports.dailySales?.map((day, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm text-gray-500 w-12">{day.day}</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                            (day.sales /
                                                                Math.max(
                                                                    ...reports.dailySales.map((d) => d.sales || 1)
                                                                )) *
                                                            100,
                                                            100
                                                        )}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-800">
                                                {formatCurrency(day.sales)}
                                            </p>
                                            <p className="text-xs text-gray-500">{day.orders} pesanan</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Monthly Sales */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Penjualan 6 Bulan Terakhir
                            </h3>
                            <div className="space-y-3">
                                {reports.monthlySales?.map((month, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm text-gray-500 w-16">{month.month}</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-28">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                            (month.sales /
                                                                Math.max(
                                                                    ...reports.monthlySales.map((m) => m.sales || 1)
                                                                )) *
                                                            100,
                                                            100
                                                        )}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-800">
                                                {formatCurrency(month.sales)}
                                            </p>
                                            <p className="text-xs text-gray-500">{month.orders} pesanan</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Low Stock Alert */}
                        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                ⚠️ Parfum Stok Rendah
                            </h3>
                            {reports.topPerfumes?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {reports.topPerfumes.map((perfume) => (
                                        <div
                                            key={perfume.id}
                                            className="p-4 bg-red-50 rounded-lg border border-red-100"
                                        >
                                            <p className="font-medium text-gray-800 truncate">
                                                {perfume.name}
                                            </p>
                                            <p className="text-sm text-red-600 font-semibold">
                                                Stok: {perfume.stock}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">Tidak ada parfum dengan stok rendah</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Pelanggan
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Item
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Total
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Tanggal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-800">
                                                    #{order.id}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {order.user?.name || "Unknown"}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {order.items?.length || 0} item
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-800">
                                                    {formatCurrency(order.total_amount)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                Belum ada pesanan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
