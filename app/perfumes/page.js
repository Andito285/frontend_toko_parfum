"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated, getAuthUser, getAuthToken } from "@/lib/auth";

export default function PerfumesPage() {
    const [perfumes, setPerfumes] = useState([]);
    const [filteredPerfumes, setFilteredPerfumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);

    const router = useRouter();
    const user = getAuthUser();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const API_URL = `${baseURL}/api/perfumes`;
    const isLoggedIn = isAuthenticated();

    // Get unique brands from perfumes
    const brands = [...new Set(perfumes.map(p => p.brand).filter(Boolean))].sort();

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

    // Apply filters
    useEffect(() => {
        let results = [...perfumes];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            results = results.filter(
                (p) =>
                    p.name?.toLowerCase().includes(search) ||
                    p.brand?.toLowerCase().includes(search) ||
                    p.description?.toLowerCase().includes(search)
            );
        }

        // Brand filter
        if (selectedBrand) {
            results = results.filter((p) => p.brand === selectedBrand);
        }

        // Price range filter
        if (priceRange.min) {
            results = results.filter((p) => Number(p.price) >= Number(priceRange.min));
        }
        if (priceRange.max) {
            results = results.filter((p) => Number(p.price) <= Number(priceRange.max));
        }

        // Sorting
        switch (sortBy) {
            case "price-low":
                results.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case "price-high":
                results.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            case "name-az":
                results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            case "name-za":
                results.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
                break;
            case "newest":
            default:
                results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        setFilteredPerfumes(results);
    }, [searchTerm, selectedBrand, priceRange, sortBy, perfumes]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedBrand("");
        setPriceRange({ min: "", max: "" });
        setSortBy("newest");
    };

    const activeFilterCount = [
        searchTerm,
        selectedBrand,
        priceRange.min,
        priceRange.max,
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
                        Koleksi Parfum
                    </h1>
                    <p className="text-center text-white/80 max-w-2xl mx-auto">
                        Temukan parfum premium dari berbagai brand ternama
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <svg
                                className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari parfum, brand..."
                                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                        >
                            <option value="newest">Terbaru</option>
                            <option value="price-low">Harga: Rendah ke Tinggi</option>
                            <option value="price-high">Harga: Tinggi ke Rendah</option>
                            <option value="name-az">Nama: A-Z</option>
                            <option value="name-za">Nama: Z-A</option>
                        </select>

                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${showFilters
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filter
                            {activeFilterCount > 0 && (
                                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Brand Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand
                                    </label>
                                    <select
                                        value={selectedBrand}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                                    >
                                        <option value="">Semua Brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand} value={brand}>
                                                {brand}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Harga Minimum (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={priceRange.min}
                                        onChange={(e) =>
                                            setPriceRange({ ...priceRange, min: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Harga Maksimum (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Tidak terbatas"
                                        value={priceRange.max}
                                        onChange={(e) =>
                                            setPriceRange({ ...priceRange, max: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                        Menampilkan <span className="font-semibold">{filteredPerfumes.length}</span> parfum
                        {activeFilterCount > 0 && (
                            <span className="text-indigo-600"> (difilter)</span>
                        )}
                    </p>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Hapus semua filter
                        </button>
                    )}
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
                    <div className="text-center py-16 bg-white rounded-xl shadow-md">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🔍</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Tidak ada parfum ditemukan
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Coba ubah kriteria pencarian atau filter Anda
                        </p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}

                {/* Perfume Grid */}
                {!loading && !error && filteredPerfumes.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredPerfumes.map((perfume) => (
                            <div
                                key={perfume.id || perfume._id}
                                className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
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
                                            <span className="text-5xl">🌸</span>
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
                                    {perfume.brand && (
                                        <p className="text-xs text-indigo-600 font-medium mb-1 uppercase tracking-wide">
                                            {perfume.brand}
                                        </p>
                                    )}
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
                                    {!isLoggedIn && (
                                        <Link
                                            href="/login"
                                            className="block w-full py-2.5 rounded-lg font-medium text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                        >
                                            Masuk untuk Membeli
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
