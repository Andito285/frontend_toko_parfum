"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { isAuthenticated, getAuthUser } from "@/lib/auth";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const user = getAuthUser();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }
        fetchOrders();
    }, [router]);

    const fetchOrders = async () => {
        try {
            const res = await api.get("/api/orders");
            console.log("Orders API Response:", res.data);
            if (res.data.length > 0 && res.data[0].items) {
                console.log("First order items:", res.data[0].items);
                console.log("First item perfume data:", res.data[0].items[0]?.perfume);
            }
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err.response?.status !== 401) {
                setError("Gagal memuat pesanan");
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: "Menunggu Pembayaran", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
            paid: { label: "Menunggu Verifikasi", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
            verified: { label: "Terverifikasi", color: "bg-green-500/20 text-green-400 border-green-500/30" },
            cancelled: { label: "Dibatalkan", color: "bg-red-500/20 text-red-400 border-red-500/30" }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Memuat pesanan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">📦 Pesanan <span className="text-yellow-400">Saya</span></h1>
                        <p className="text-gray-400 mt-1">
                            Halo {user?.name}, berikut daftar pesanan kamu
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-colors font-medium"
                    >
                        Kembali Belanja
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/50 text-red-400 rounded-xl border border-red-600/30">
                        ❌ {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-gray-900 rounded-2xl shadow-md border border-yellow-600/30 p-12 text-center">
                        <span className="text-8xl block mb-6">📦</span>
                        <h2 className="text-2xl font-bold text-white mb-2">Belum Ada Pesanan</h2>
                        <p className="text-gray-400 mb-6">
                            Yuk, mulai belanja parfum favoritmu!
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-full font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-colors"
                        >
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-gray-900 rounded-2xl shadow-md border border-yellow-600/20 overflow-hidden">
                                {/* Order Header */}
                                <div className="p-6 border-b border-yellow-600/20">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Order #{order.id} • {formatDate(order.created_at)}
                                            </p>
                                            <p className="text-xl font-bold text-yellow-400 mt-1">
                                                Rp{Number(order.total_amount).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(order.payment_status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6 bg-gray-800/50">
                                    <div className="space-y-3">
                                        {order.items?.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.perfume?.display_image?.url && (
                                                            <img
                                                                src={item.perfume.display_image.url}
                                                                alt={item.perfume?.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {item.perfume?.name || "Produk"}
                                                        </p>
                                                        <p className="text-sm text-gray-400">
                                                            {item.quantity}x @ Rp{Number(item.price).toLocaleString("id-ID")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-white">
                                                    Rp{(item.quantity * item.price).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Actions */}
                                <div className="p-6 border-t border-yellow-600/20">
                                    {order.payment_status === "pending" && (
                                        <Link
                                            href={`/orders/${order.id}/payment`}
                                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-colors"
                                        >
                                            💳 Upload Bukti Pembayaran
                                        </Link>
                                    )}
                                    {order.payment_status === "paid" && (
                                        <div className="flex items-center space-x-3 text-blue-400">
                                            <span className="animate-pulse">⏳</span>
                                            <span>Menunggu verifikasi admin...</span>
                                        </div>
                                    )}
                                    {order.payment_status === "verified" && (
                                        <div className="flex items-center space-x-3 text-green-400">
                                            <span>✅</span>
                                            <span>Pembayaran telah diverifikasi</span>
                                            {order.verified_at && (
                                                <span className="text-sm text-gray-500">
                                                    pada {formatDate(order.verified_at)}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Show uploaded proof preview */}
                                    {order.payment_proof && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-400 mb-2">Bukti Pembayaran:</p>
                                            <img
                                                src={`${baseURL}/storage/${order.payment_proof}`}
                                                alt="Bukti Pembayaran"
                                                className="w-32 h-32 object-cover rounded-lg border border-yellow-600/30"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
