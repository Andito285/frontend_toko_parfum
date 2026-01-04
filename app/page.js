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
        perfume.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfume.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPerfumes(results);
  }, [searchTerm, perfumes]);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {isLoggedIn ? (
              <p className="text-yellow-400/80 mb-2">Selamat datang kembali, {user?.name}! 👋</p>
            ) : (
              <p className="text-yellow-400/80 mb-2">Selamat datang di JamalParfum! ✨</p>
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Temukan <span className="text-yellow-400">Aroma</span> yang Mendefinisikan Dirimu
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Koleksi parfum premium pilihan terbaik dari berbagai brand ternama.
              {isLoggedIn ? " Tambahkan ke keranjang dan checkout dengan mudah." : " Login untuk mulai berbelanja."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#produk"
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-full font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/30"
              >
                Jelajahi Koleksi
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={() => setShowCart(true)}
                  className="px-8 py-4 bg-transparent border-2 border-yellow-500 text-yellow-400 rounded-full font-semibold hover:bg-yellow-500/10 transition-all flex items-center justify-center gap-2"
                >
                  🛒 Keranjang ({getTotalItems()})
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-8 py-4 bg-transparent border-2 border-yellow-500 text-yellow-400 rounded-full font-semibold hover:bg-yellow-500/10 transition-all flex items-center justify-center gap-2"
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
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#0a0a0a" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-900/50 border border-yellow-600/20 p-6 rounded-2xl text-center hover:border-yellow-500/40 transition-all hover:shadow-lg hover:shadow-yellow-500/10">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-bold text-lg text-yellow-400 mb-2">100% Original</h3>
              <p className="text-gray-400 text-sm">Semua produk kami dijamin asli dan berkualitas tinggi</p>
            </div>
            <div className="bg-gray-900/50 border border-yellow-600/20 p-6 rounded-2xl text-center hover:border-yellow-500/40 transition-all hover:shadow-lg hover:shadow-yellow-500/10">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-bold text-lg text-yellow-400 mb-2">Pengiriman Cepat</h3>
              <p className="text-gray-400 text-sm">Pesanan diproses dalam 24 jam dan dikirim dengan aman</p>
            </div>
            <div className="bg-gray-900/50 border border-yellow-600/20 p-6 rounded-2xl text-center hover:border-yellow-500/40 transition-all hover:shadow-lg hover:shadow-yellow-500/10">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💝</span>
              </div>
              <h3 className="font-bold text-lg text-yellow-400 mb-2">Hadiah Spesial</h3>
              <p className="text-gray-400 text-sm">Dapatkan sample gratis untuk setiap pembelian</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produk" className="py-16 bg-black">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Koleksi Parfum <span className="text-yellow-400">Terbaru</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Temukan parfum yang sesuai dengan kepribadian dan gaya hidupmu
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-10 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari parfum, brand, atau aroma..."
                className="w-full px-6 py-4 pl-12 bg-gray-900 border border-yellow-600/30 text-white rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none shadow-sm placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 text-yellow-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Memuat parfum...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">😔</span>
              </div>
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-medium"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPerfumes.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-gray-400">Tidak ada parfum ditemukan.</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-yellow-400 hover:underline"
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
                  className="group bg-gray-900 rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 transform hover:-translate-y-1 border border-yellow-600/20 cursor-pointer"
                >
                  <div className="relative h-52 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                    {perfume.primary_image?.url || perfume.image ? (
                      <img
                        src={perfume.primary_image?.url || perfume.image}
                        alt={perfume.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="text-center"><span class="text-6xl">🧴</span><p class="text-gray-500 text-sm mt-2">Gambar tidak tersedia</p></div>';
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-6xl">🧴</span>
                        <p className="text-gray-500 text-sm mt-2">Tidak ada gambar</p>
                      </div>
                    )}
                    {perfume.stock === 0 && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-medium">
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
                    <p className="text-xs text-yellow-500 font-medium mb-1 uppercase tracking-wide">
                      {perfume.brand || "Brand"}
                    </p>
                    <h3 className="font-bold text-lg text-white truncate mb-2 group-hover:text-yellow-400 transition-colors">
                      {perfume.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
                      {perfume.description || "Deskripsi tidak tersedia"}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-xl text-yellow-400">
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
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500"
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
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-full shadow-lg shadow-yellow-500/30 flex items-center justify-center hover:from-yellow-400 hover:to-yellow-500 transition-colors z-40"
        >
          <span className="text-2xl">🛒</span>
          {getTotalItems() > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {getTotalItems()}
            </span>
          )}
        </button>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowCart(false)}
          ></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl flex flex-col border-l border-yellow-600/30">
            <div className="p-6 border-b border-yellow-600/30 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                🛒 Keranjang ({getTotalItems()})
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <span className="text-6xl">🛒</span>
                  <p className="mt-4 text-lg">Keranjang kosong</p>
                  <p className="text-sm">Tambahkan parfum favoritmu!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 bg-gray-800 p-4 rounded-xl border border-yellow-600/20"
                    >
                      <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.primary_image?.url || item.image ? (
                          <img
                            src={item.primary_image?.url || item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span class="text-3xl">🧴</span>';
                            }}
                          />
                        ) : (
                          <span className="text-3xl">🧴</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-yellow-400 font-medium">
                          Rp{Number(item.price).toLocaleString("id-ID")}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors font-bold text-white"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium text-white">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors font-bold text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-400 text-xl"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-yellow-600/30 bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    Rp{getTotalPrice().toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-colors text-lg"
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
