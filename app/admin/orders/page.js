"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { isAuthenticated, isAdmin } from "@/lib/auth";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
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
        fetchOrders();
    }, [router, filter]);

    const fetchOrders = async () => {
        try {
            const url = filter === "all"
                ? "/api/admin/orders"
                : `/api/admin/orders?status=${filter}`;

            const res = await api.get(url);
            setOrders(res.data.data || []);
        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err.response?.status !== 401) {
                setError("Gagal memuat pesanan");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (orderId) => {
        setActionLoading(true);
        try {
            await api.put(`/api/admin/orders/${orderId}/verify`, {});
            setSuccess("Pembayaran berhasil diverifikasi!");
            setModalOpen(false);
            fetchOrders();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Verify error:", err);
            if (err.response?.status !== 401) {
                setError(err.response?.data?.error || "Gagal memverifikasi pembayaran");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (orderId) => {
        setActionLoading(true);
        try {
            await api.put(`/api/admin/orders/${orderId}/reject`, {});
            setSuccess("Pembayaran ditolak. User dapat mengupload ulang bukti.");
            setModalOpen(false);
            fetchOrders();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Reject error:", err);
            if (err.response?.status !== 401) {
                setError(err.response?.data?.error || "Gagal menolak pembayaran");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
            paid: { label: "Menunggu Verifikasi", color: "bg-blue-100 text-blue-800" },
            verified: { label: "Terverifikasi", color: "bg-green-100 text-green-800" },
            cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800" }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const openModal = (order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">📋 Manajemen Pesanan</h1>
                        <p className="text-gray-600 mt-1">Verifikasi pembayaran pelanggan</p>
                    </div>
                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        ← Kembali ke Dashboard
                    </button>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                        ❌ {error}
                        <button onClick={() => setError("")} className="float-right">×</button>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                        ✅ {success}
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: "all", label: "Semua" },
                            { key: "pending", label: "Pending" },
                            { key: "paid", label: "Menunggu Verifikasi" },
                            { key: "verified", label: "Terverifikasi" }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === tab.key
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Pelanggan
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada pesanan
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                #{order.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {order.user?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {order.user?.email}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-indigo-600">
                                                Rp{Number(order.total_amount).toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(order.payment_status)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openModal(order)}
                                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {modalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                Detail Order #{selectedOrder.id}
                            </h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Pelanggan</h3>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-medium">{selectedOrder.user?.name}</p>
                                    <p className="text-gray-600">{selectedOrder.user?.email}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Item Pesanan</h3>
                                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                    {selectedOrder.items?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.perfume?.display_image?.url ? (
                                                        <img
                                                            src={item.perfume.display_image.url}
                                                            alt={item.perfume?.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-sm">
                                                            🌸
                                                        </div>
                                                    )}
                                                </div>
                                                <span>{item.perfume?.name} x{item.quantity}</span>
                                            </div>
                                            <span className="font-medium">
                                                Rp{(item.quantity * item.price).toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
                                        <span>Total</span>
                                        <span className="text-indigo-600">
                                            Rp{Number(selectedOrder.total_amount).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Status Pembayaran</h3>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(selectedOrder.payment_status)}
                                    {selectedOrder.payment_date && (
                                        <span className="text-sm text-gray-600">
                                            Dibayar: {formatDate(selectedOrder.payment_date)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Payment Proof */}
                            {selectedOrder.payment_proof && (
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Bukti Pembayaran</h3>
                                    <img
                                        src={`${baseURL}/storage/${selectedOrder.payment_proof}`}
                                        alt="Bukti Pembayaran"
                                        className="max-w-full rounded-xl border border-gray-200"
                                    />
                                </div>
                            )}

                            {/* Verification Info */}
                            {selectedOrder.verified_at && (
                                <div className="bg-green-50 p-4 rounded-xl">
                                    <p className="text-green-700">
                                        ✅ Diverifikasi pada {formatDate(selectedOrder.verified_at)}
                                        {selectedOrder.verified_by_user && (
                                            <> oleh {selectedOrder.verified_by_user.name}</>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedOrder.payment_status === "paid" && (
                                <div className="flex gap-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleVerify(selectedOrder.id)}
                                        disabled={actionLoading}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                    >
                                        {actionLoading ? "Memproses..." : "✅ Verifikasi"}
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedOrder.id)}
                                        disabled={actionLoading}
                                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400"
                                    >
                                        {actionLoading ? "Memproses..." : "❌ Tolak"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
