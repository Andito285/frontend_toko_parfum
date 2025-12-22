"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { isAuthenticated, isAdmin, getAuthToken } from "@/lib/auth";

export default function EditPerfumePage() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
    });
    const [existingImages, setExistingImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        fetchPerfume();
    }, [router, perfumeId]);

    const fetchPerfume = async () => {
        try {
            const token = getAuthToken();
            const res = await axios.get(`${baseURL}/api/perfumes/${perfumeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const perfume = res.data.data || res.data;
            setFormData({
                name: perfume.name || "",
                description: perfume.description || "",
                price: perfume.price || "",
                stock: perfume.stock || "",
            });
            setExistingImages(perfume.images || []);
        } catch (err) {
            console.error("Error fetching perfume:", err);
            setError("Gagal memuat data parfum.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setSelectedImages((prev) => [...prev, ...files]);

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, { file, preview: reader.result }]);
            };
            reader.readAsDataURL(file);
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeNewImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingImage = async (imageId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus gambar ini?")) return;

        try {
            const token = getAuthToken();
            await axios.delete(`${baseURL}/api/admin/perfumes/${perfumeId}/images/${imageId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
            setSuccess("Gambar berhasil dihapus!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Error deleting image:", err);
            setError("Gagal menghapus gambar.");
        }
    };

    const handleSetPrimary = async (imageId) => {
        try {
            const token = getAuthToken();
            await axios.put(
                `${baseURL}/api/admin/perfumes/${perfumeId}/images/${imageId}/primary`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Update local state
            setExistingImages((prev) =>
                prev.map((img) => ({
                    ...img,
                    is_primary: img.id === imageId,
                }))
            );
            setSuccess("Gambar utama berhasil diubah!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Error setting primary:", err);
            setError("Gagal mengatur gambar utama.");
        }
    };

    const handleUploadNewImages = async () => {
        if (selectedImages.length === 0) return;

        setUploading(true);
        setError("");

        try {
            const token = getAuthToken();
            const imageFormData = new FormData();

            if (selectedImages.length === 1) {
                imageFormData.append("image", selectedImages[0]);
                await axios.post(`${baseURL}/api/admin/perfumes/${perfumeId}/images`, imageFormData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                selectedImages.forEach((file) => {
                    imageFormData.append("images", file);
                });
                await axios.post(`${baseURL}/api/admin/perfumes/${perfumeId}/images/batch`, imageFormData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            setSuccess("Gambar berhasil diunggah!");
            setSelectedImages([]);
            setImagePreviews([]);
            fetchPerfume(); // Refresh images
        } catch (err) {
            console.error("Error uploading images:", err);
            setError("Gagal mengunggah gambar. " + (err.response?.data?.message || ""));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            if (!formData.name || !formData.price || !formData.stock) {
                throw new Error("Nama, harga, dan stok wajib diisi.");
            }

            const token = getAuthToken();
            await axios.put(`${baseURL}/api/admin/perfumes/${perfumeId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setSuccess("Parfum berhasil diperbarui!");
            setTimeout(() => {
                router.push("/admin/perfumes");
            }, 1500);
        } catch (err) {
            console.error("Error updating perfume:", err);
            const message =
                err.response?.data?.message ||
                err.response?.data?.errors?.[0] ||
                err.message ||
                "Gagal memperbarui parfum.";
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat data parfum...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
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
                        <li className="text-gray-800 font-medium">Edit</li>
                    </ol>
                </nav>

                <div className="bg-white rounded-xl shadow-md p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Edit Parfum</h1>
                            <p className="text-gray-600 mt-1">Perbarui informasi parfum.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            ❌ {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                            ✅ {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Parfum *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Harga (Rp) *
                                </label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                                    Stok *
                                </label>
                                <input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Existing Images Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gambar Tersimpan ({existingImages.length})
                            </label>
                            {existingImages.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {existingImages.map((image) => (
                                        <div key={image.id} className="relative group">
                                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                <img
                                                    src={image.url || `${baseURL}/storage/${image.path}`}
                                                    alt={image.alt_text || "Perfume"}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {image.is_primary && (
                                                <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                                    ⭐
                                                </span>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-1">
                                                {!image.is_primary && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimary(image.id)}
                                                        className="p-1.5 bg-yellow-400 hover:bg-yellow-500 rounded-full transition-colors text-xs"
                                                        title="Jadikan Utama"
                                                    >
                                                        ⭐
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExistingImage(image.id)}
                                                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors text-xs"
                                                    title="Hapus"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Belum ada gambar.</p>
                            )}
                        </div>

                        {/* Upload New Images Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tambah Gambar Baru
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <div className="text-3xl mb-1">📷</div>
                                    <p className="text-gray-700 font-medium text-sm">Klik untuk memilih gambar</p>
                                    <p className="text-xs text-gray-500">JPEG, PNG, GIF, WebP</p>
                                </label>
                            </div>

                            {/* New Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-gray-600">{imagePreviews.length} gambar baru:</p>
                                        <button
                                            type="button"
                                            onClick={handleUploadNewImages}
                                            disabled={uploading}
                                            className={`px-3 py-1 text-sm rounded-lg font-medium text-white transition ${uploading
                                                ? "bg-purple-400 cursor-not-allowed"
                                                : "bg-purple-600 hover:bg-purple-700"
                                                }`}
                                        >
                                            {uploading ? "Mengunggah..." : "Upload Sekarang"}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                        {imagePreviews.map((item, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={item.preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <Link
                                href="/admin/perfumes"
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className={`px-6 py-2 rounded-lg font-medium text-white transition ${saving
                                    ? "bg-indigo-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                    }`}
                            >
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
