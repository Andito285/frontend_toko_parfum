"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated, getAuthUser, getAuthToken } from "@/lib/auth";

export default function HomePage() {
  const [perfumes, setPerfumes] = useState([]);
  const [filteredPerfumes, setFilteredPerfumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const router = useRouter();
  const user = getAuthUser();

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const API_URL = `${baseURL}/api/perfumes`;
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    fetchPerfumes();
    if (isLoggedIn) {
      loadCart();
    }
  }, []);

  const fetchPerfumes = async () => {
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setPerfumes(data);
      setFilteredPerfumes(data);
    } catch (err) {
      console.error("Gagal mengambil data parfum:", err);
      setError("Gagal memuat data parfum.");
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (perfume) => {
    const existingItem = cart.find((item) => item.id === perfume.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === perfume.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...perfume, quantity: 1 }];
    }

    saveCart(newCart);
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

    try {
      const token = getAuthToken();
      const items = cart.map((item) => ({
        perfume_id: item.id,
        quantity: item.quantity,
      }));

      await axios.post(
        `${baseURL}/api/orders`,
        { items },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      saveCart([]);
      setShowCart(false);
      alert("Pesanan berhasil dibuat! Terima kasih telah berbelanja.");
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err.response?.data?.error || "Gagal membuat pesanan.");
    }
  };

  useEffect(() => {
    const results = perfumes.filter(
      (perfume) =>
        perfume.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfume.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPerfumes(results);
  }, [searchTerm, perfumes]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {isLoggedIn ? (
              <p className="text-white/80 mb-2">Selamat datang kembali, {user?.name}! 👋</p>
            ) : (
              <p className="text-white/80 mb-2">Selamat datang di JamalParfum! ✨</p>
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Temukan <span className="text-yellow-300">Aroma</span> yang Mendefinisikan Dirimu
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Koleksi parfum premium pilihan terbaik dari berbagai brand ternama.
              {isLoggedIn ? " Tambahkan ke keranjang dan checkout dengan mudah." : " Login untuk mulai berbelanja."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#produk"
                className="px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Jelajahi Koleksi
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={() => setShowCart(true)}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  🛒 Keranjang ({getTotalItems()})
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  Masuk / Daftar
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">100% Original</h3>
              <p className="text-gray-600 text-sm">Semua produk kami dijamin asli dan berkualitas tinggi</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Pengiriman Cepat</h3>
              <p className="text-gray-600 text-sm">Pesanan diproses dalam 24 jam dan dikirim dengan aman</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💝</span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Hadiah Spesial</h3>
              <p className="text-gray-600 text-sm">Dapatkan sample gratis untuk setiap pembelian</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produk" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Koleksi Parfum Terbaru
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan parfum yang sesuai dengan kepribadian dan gaya hidupmu
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-10 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari parfum, brand, atau aroma..."
                className="w-full px-6 py-4 pl-12 border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Memuat parfum...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">😔</span>
              </div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPerfumes.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-gray-600">Tidak ada parfum ditemukan.</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-indigo-600 hover:underline"
                >
                  Hapus pencarian
                </button>
              )}
            </div>
          )}

          {/* Perfume Grid */}
          {!loading && !error && filteredPerfumes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPerfumes.map((perfume) => (
                <div
                  key={perfume.id || perfume._id}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer"
                >
                  <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {perfume.primary_image?.url ? (
                      <img
                        src={perfume.primary_image.url}
                        alt={perfume.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-5xl"></span>
                        <p className="text-gray-400 text-sm mt-2">No image</p>
                      </div>
                    )}
                    {perfume.stock === 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                        Habis
                      </div>
                    )}
                    {perfume.stock > 0 && perfume.stock <= 5 && (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                        Stok Terbatas
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-indigo-600 font-medium mb-1 uppercase tracking-wide">
                      {perfume.brand || "Brand"}
                    </p>
                    <h3 className="font-bold text-lg text-gray-800 truncate mb-2 group-hover:text-indigo-600 transition-colors">
                      {perfume.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[2.5rem]">
                      {perfume.description || "Deskripsi tidak tersedia"}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-xl text-indigo-700">
                        {perfume.price
                          ? `Rp${Number(perfume.price).toLocaleString("id-ID")}`
                          : "–"}
                      </span>
                      <span className="text-xs text-gray-500">Stok: {perfume.stock}</span>
                    </div>
                    {isLoggedIn && (
                      <button
                        onClick={() => addToCart(perfume)}
                        disabled={perfume.stock === 0}
                        className={`w-full py-2.5 rounded-lg font-medium transition-colors ${perfume.stock === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                      >
                        {perfume.stock === 0 ? "Stok Habis" : "🛒 Tambah ke Keranjang"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart Button - Only for logged in users */}
      {isLoggedIn && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-40"
        >
          <span className="text-2xl">🛒</span>
          {getTotalItems() > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {getTotalItems()}
            </span>
          )}
        </button>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCart(false)}
          ></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                🛒 Keranjang ({getTotalItems()})
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <span className="text-6xl">🛒</span>
                  <p className="mt-4 text-lg">Keranjang kosong</p>
                  <p className="text-sm">Tambahkan parfum favoritmu!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.primary_image?.url ? (
                          <img
                            src={item.primary_image.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-indigo-600 font-medium">
                          Rp{Number(item.price).toLocaleString("id-ID")}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-xl"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    Rp{getTotalPrice().toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-lg"
                >
                  Checkout Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
