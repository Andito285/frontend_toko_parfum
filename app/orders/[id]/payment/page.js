"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";

export default function PaymentUploadPage() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const router = useRouter();
    const params = useParams();
    const orderId = params.id;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }
        fetchOrder();
    }, [router, orderId]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/api/orders/${orderId}`);
            setOrder(res.data);

            if (res.data.payment_status !== "pending") {
                setError("Order ini sudah dibayar atau diverifikasi");
            }
        } catch (err) {
            console.error("Error fetching order:", err);
            if (err.response?.status !== 401) {
                setError("Gagal memuat detail pesanan");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
                setError("Format file harus JPEG, PNG, atau JPG");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError("Ukuran file maksimal 2MB");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError("");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
                setError("Format file harus JPEG, PNG, atau JPG");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError("");
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Pilih file terlebih dahulu");
            return;
        }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("payment_proof", selectedFile);

            await api.post(`/api/orders/${orderId}/payment`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setSuccess("Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.");
            setTimeout(() => {
                router.push("/orders");
            }, 2000);
        } catch (err) {
            console.error("Upload error:", err);
            if (err.response?.status !== 401) {
                setError(err.response?.data?.error || "Gagal mengupload bukti pembayaran");
            }
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat detail pesanan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="mb-8">
                    <Link
                        href="/orders"
                        className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-2"
                    >
                        <span>←</span>
                        <span>Kembali ke Pesanan</span>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h1 className="text-2xl font-bold text-gray-800">💳 Upload Bukti Pembayaran</h1>
                        <p className="text-gray-600 mt-1">Order #{orderId}</p>
                    </div>

                    {/* Order Summary */}
                    {order && (
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-800 mb-3">Ringkasan Pesanan</h2>
                            <div className="space-y-2">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.perfume?.name} x{item.quantity}
                                        </span>
                                        <span className="font-medium">
                                            Rp{(item.quantity * item.price).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-indigo-600">
                                        Rp{Number(order.total_amount).toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bank Info */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800 mb-3">Transfer ke Rekening</h2>
                        <div className="bg-indigo-50 p-4 rounded-xl">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                                    🏦
                                </div>
                                <div>
                                    <p className="font-bold text-indigo-700">Bank BCA</p>
                                    <p className="text-lg font-mono text-gray-800">1234567890</p>
                                    <p className="text-sm text-gray-600">a.n. Jamal Fragrance</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                                ❌ {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                                ✅ {success}
                            </div>
                        )}

                        {order?.payment_status === "pending" && !success && (
                            <>
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                                    onClick={() => document.getElementById("fileInput").click()}
                                >
                                    {previewUrl ? (
                                        <div className="space-y-4">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                                            />
                                            <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                    setPreviewUrl("");
                                                }}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Hapus & Pilih Ulang
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-6xl mb-4">📁</div>
                                            <p className="text-gray-600 mb-2">
                                                Drag & drop bukti transfer di sini
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                atau klik untuk memilih file
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Format: JPEG, PNG, JPG. Max 2MB
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploading}
                                    className={`w-full mt-6 py-4 rounded-xl font-semibold text-white transition-colors ${!selectedFile || uploading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-indigo-600 hover:bg-indigo-700"
                                        }`}
                                >
                                    {uploading ? "Mengupload..." : "Upload Bukti Pembayaran"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
