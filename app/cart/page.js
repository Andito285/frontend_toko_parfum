"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { isAuthenticated, getAuthUser } from "@/lib/auth";

export default function CartPage() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const user = getAuthUser();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }
        loadCart();
    }, [router]);

    const loadCart = () => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
        setLoading(false);
    };

    const saveCart = (newCart) => {
        localStorage.setItem("cart", JSON.stringify(newCart));
        setCart(newCart);
    };

    const removeFromCart = (perfumeId) => {
        const newCart = cart.filter((item) => item.id !== perfumeId);
        saveCart(newCart);
    };

    const updateQuantity = (perfumeId, quantity) => {
        if (quantity < 1) {
            removeFromCart(perfumeId);
            return;
        }
        const newCart = cart.map((item) =>
            item.id === perfumeId ? { ...item, quantity } : item
        );
        saveCart(newCart);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setCheckoutLoading(true);
        setError("");

        try {
            const items = cart.map((item) => ({
                perfume_id: item.id,
                quantity: item.quantity,
            }));

            await api.post("/api/orders", { items });

            saveCart([]);
            setSuccess("🎉 Pesanan berhasil dibuat! Terima kasih telah berbelanja.");
        } catch (err) {
            console.error("Checkout error:", err);
            if (err.response?.status !== 401) {
                setError(err.response?.data?.error || "Gagal membuat pesanan. Silakan coba lagi.");
            }
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Memuat keranjang...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-2">🛒 Keranjang <span className="text-yellow-400">Belanja</span></h1>
                <p className="text-gray-400 mb-8">
                    {cart.length > 0
                        ? `Halo ${user?.name}, kamu memiliki ${getTotalItems()} item di keranjang`
                        : "Keranjang kamu kosong"}
                </p>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/50 text-red-400 rounded-xl border border-red-600/30">
                        ❌ {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-900/50 text-green-400 rounded-xl border border-green-600/30">
                        {success}
                        <div className="mt-3">
                            <Link
                                href="/"
                                className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-colors font-medium"
                            >
                                Lanjut Belanja
                            </Link>
                        </div>
                    </div>
                )}

                {cart.length === 0 && !success ? (
                    <div className="bg-gray-900 rounded-2xl shadow-md border border-yellow-600/30 p-12 text-center">
                        <span className="text-8xl block mb-6">🛒</span>
                        <h2 className="text-2xl font-bold text-white mb-2">Keranjang Kosong</h2>
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
                ) : cart.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-gray-900 rounded-2xl shadow-md border border-yellow-600/20 p-4 flex items-center space-x-4"
                                >
                                    <div className="w-24 h-24 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {item.primary_image?.url || item.image ? (
                                            <img
                                                src={item.primary_image?.url || item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<span class="text-4xl">🧴</span>';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-4xl">🧴</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-white truncate">
                                            {item.name}
                                        </h3>
                                        <p className="text-yellow-400 font-semibold">
                                            Rp{Number(item.price).toLocaleString("id-ID")}
                                        </p>
                                        <div className="flex items-center space-x-3 mt-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full font-bold text-lg transition-colors text-white"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-semibold text-lg text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full font-bold text-lg transition-colors text-white"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-white">
                                            Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center justify-end space-x-1"
                                        >
                                            <span>🗑️</span>
                                            <span>Hapus</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900 rounded-2xl shadow-md border border-yellow-600/30 p-6 sticky top-6">
                                <h2 className="text-xl font-bold text-white mb-6">
                                    Ringkasan Pesanan
                                </h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Subtotal ({getTotalItems()} item)</span>
                                        <span className="text-white">Rp{getTotalPrice().toLocaleString("id-ID")}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Ongkos Kirim</span>
                                        <span className="text-green-400">Gratis</span>
                                    </div>
                                    <hr className="border-yellow-600/30" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-white">Total</span>
                                        <span className="text-yellow-400">
                                            Rp{getTotalPrice().toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading || cart.length === 0}
                                    className={`w-full py-4 rounded-xl font-semibold transition-colors ${checkoutLoading
                                        ? "bg-yellow-600/50 text-black/50 cursor-not-allowed"
                                        : "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500"
                                        }`}
                                >
                                    {checkoutLoading ? "Memproses..." : "Checkout Sekarang"}
                                </button>

                                <p className="text-center text-xs text-gray-500 mt-4">
                                    Dengan checkout, kamu setuju dengan syarat & ketentuan kami
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
