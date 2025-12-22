"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { getAuthToken } from "@/lib/auth";

export default function CreatePerfumePage() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef(null);
    const router = useRouter();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const token = getAuthToken();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Add new files to selected images
        setSelectedImages((prev) => [...prev, ...files]);

        // Create previews for new files
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, { file, preview: reader.result }]);
            };
            reader.readAsDataURL(file);
        });

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!formData.name || !formData.price || !formData.stock) {
                throw new Error("Nama, harga, dan stok wajib diisi.");
            }

            // Step 1: Create the perfume
            const perfumeRes = await axios.post(`${baseURL}/api/admin/perfumes`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const perfumeId = perfumeRes.data.id;

            // Step 2: Upload images if any selected
            if (selectedImages.length > 0) {
                const imageFormData = new FormData();

                if (selectedImages.length === 1) {
                    // Single image upload
                    imageFormData.append("image", selectedImages[0]);
                    await axios.post(`${baseURL}/api/admin/perfumes/${perfumeId}/images`, imageFormData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    });
                } else {
                    // Multiple images upload
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
            }

            setSuccess("Parfum berhasil ditambahkan!");
            setTimeout(() => {
                router.push("/admin/perfumes");
            }, 1500);
        } catch (err) {
            console.error("Error creating perfume:", err);
            const message =
                err.response?.data?.message ||
                err.response?.data?.errors?.[0] ||
                err.message ||
                "Gagal menambahkan parfum.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

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
                        <li className="text-gray-800 font-medium">Tambah Baru</li>
                    </ol>
                </nav>

                <div className="bg-white rounded-xl shadow-md p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Tambah Parfum Baru
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Isi form di bawah untuk menambahkan parfum ke marketplace.
                    </p>

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
                                placeholder="Contoh: Chanel No.5"
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
                                placeholder="Deskripsi parfum..."
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
                                    placeholder="150000"
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
                                    placeholder="20"
                                />
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gambar Parfum
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer"
                                >
                                    <div className="text-4xl mb-2">📷</div>
                                    <p className="text-gray-700 font-medium">
                                        Klik untuk memilih gambar
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Mendukung multiple upload (JPEG, PNG, GIF, WebP)
                                    </p>
                                </label>
                            </div>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        {imagePreviews.length} gambar dipilih:
                                    </p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {imagePreviews.map((item, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={item.preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {index === 0 && (
                                                    <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                                        Utama
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
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
                                disabled={loading}
                                className={`px-6 py-2 rounded-lg font-medium text-white transition ${loading
                                    ? "bg-indigo-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                    }`}
                            >
                                {loading ? "Menyimpan..." : "Simpan Parfum"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
