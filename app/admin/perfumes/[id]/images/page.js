"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { isAuthenticated, isAdmin } from "@/lib/auth";

export default function PerfumeImagesPage() {
    const [perfume, setPerfume] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef(null);
    const router = useRouter();
    const params = useParams();
    const perfumeId = params.id;
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
    }, [router, perfumeId]);

    const fetchData = async () => {
        try {
            // Fetch perfume details
            const perfumeRes = await api.get(`/api/perfumes/${perfumeId}`);
            setPerfume(perfumeRes.data.data || perfumeRes.data);

            // Fetch perfume images
            const imagesRes = await api.get(`/api/admin/perfumes/${perfumeId}/images`);
            setImages(imagesRes.data.data || imagesRes.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            if (err.response?.status !== 401) {
                setError("Gagal memuat data.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();

            if (files.length === 1) {
                // Single image upload
                formData.append("image", files[0]);
                await api.post(`/api/admin/perfumes/${perfumeId}/images`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                // Multiple images upload
                for (let i = 0; i < files.length; i++) {
                    formData.append("images", files[i]);
                }
                await api.post(`/api/admin/perfumes/${perfumeId}/images/batch`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            setSuccess("Gambar berhasil diunggah!");
            fetchData(); // Refresh images
        } catch (err) {
            console.error("Error uploading:", err);
            if (err.response?.status !== 401) {
                setError("Gagal mengunggah gambar. " + (err.response?.data?.message || ""));
            }
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSetPrimary = async (imageId) => {
        try {
            await api.put(
                `/api/admin/perfumes/${perfumeId}/images/${imageId}/primary`,
                {}
            );
            setSuccess("Gambar utama berhasil diubah!");
            fetchData();
        } catch (err) {
            console.error("Error setting primary:", err);
            if (err.response?.status !== 401) {
                setError("Gagal mengatur gambar utama.");
            }
        }
    };

    const handleDelete = async (imageId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus gambar ini?")) return;

        try {
            await api.delete(`/api/admin/perfumes/${perfumeId}/images/${imageId}`);
            setSuccess("Gambar berhasil dihapus!");
            setImages(images.filter((img) => img.id !== imageId));
        } catch (err) {
            console.error("Error deleting:", err);
            if (err.response?.status !== 401) {
                setError("Gagal menghapus gambar.");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm text-gray-600">
                        <li>
                            <Link href="/admin/dashboard" className="hover:text-indigo-600">
                                Dashboard
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link href="/admin/perfumes" className="hover:text-indigo-600">
                                Parfum
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-gray-800 font-medium">Kelola Gambar</li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Kelola Gambar: {perfume?.name}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {images.length} gambar tersimpan
                            </p>
                        </div>
                        <Link
                            href={`/admin/perfumes/${perfumeId}/edit`}
                            className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            ← Kembali ke Edit
                        </Link>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        ❌ {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                        ✅ {success}
                    </div>
                )}

                {/* Upload Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Unggah Gambar Baru
                    </h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleUpload}
                            className="hidden"
                            id="image-upload"
                            disabled={uploading}
                        />
                        <label
                            htmlFor="image-upload"
                            className={`cursor-pointer ${uploading ? "opacity-50" : ""}`}
                        >
                            <div className="text-5xl mb-4">📷</div>
                            <p className="text-gray-700 font-medium">
                                {uploading ? "Mengunggah..." : "Klik untuk memilih gambar"}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Atau drag & drop gambar di sini (mendukung multiple upload)
                            </p>
                        </label>
                    </div>
                </div>

                {/* Image Grid */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Gambar Tersimpan
                    </h2>

                    {images.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-5xl">🖼️</span>
                            <p className="text-gray-600 mt-4">Belum ada gambar.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image) => (
                                <div
                                    key={image.id}
                                    className="relative group rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                                >
                                    <div className="aspect-square bg-gray-100">
                                        <img
                                            src={
                                                image.url
                                                    ? image.url
                                                    : `${baseURL}/storage/${image.path}`
                                            }
                                            alt={image.alt_text || "Perfume"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Primary Badge */}
                                    {image.is_primary && (
                                        <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                            <span>⭐</span>
                                            <span>Utama</span>
                                        </div>
                                    )}

                                    {/* Action Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                        {!image.is_primary && (
                                            <button
                                                onClick={() => handleSetPrimary(image.id)}
                                                className="p-2 bg-yellow-400 hover:bg-yellow-500 rounded-full transition-colors"
                                                title="Jadikan Gambar Utama"
                                            >
                                                ⭐
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(image.id)}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                            title="Hapus Gambar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
