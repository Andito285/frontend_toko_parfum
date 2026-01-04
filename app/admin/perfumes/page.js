"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { isAuthenticated, isAdmin } from "@/lib/auth";

export default function PerfumeListPage() {
    const [perfumes, setPerfumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [perfumeToDelete, setPerfumeToDelete] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
            return;
        }
        if (!isAdmin()) {
            router.push("/");
            return;
        }
        fetchPerfumes();
    }, [router]);

    const fetchPerfumes = async () => {
        try {
            const res = await api.get("/api/perfumes");
            const data = Array.isArray(res.data) ? res.data : res.data.data || [];
            setPerfumes(data);
        } catch (err) {
            console.error("Error fetching perfumes:", err);
            if (err.response?.status !== 401) {
                setError("Gagal memuat data parfum.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (perfume) => {
        setPerfumeToDelete(perfume);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!perfumeToDelete) return;

        setDeleteLoading(perfumeToDelete.id);
        try {
            await api.delete(`/api/admin/perfumes/${perfumeToDelete.id}`);
            setPerfumes(perfumes.filter((p) => p.id !== perfumeToDelete.id));
            setShowDeleteModal(false);
            setPerfumeToDelete(null);
        } catch (err) {
            console.error("Error deleting perfume:", err);
            if (err.response?.status !== 401) {
                alert("Gagal menghapus parfum. " + (err.response?.data?.message || ""));
            }
        } finally {
            setDeleteLoading(null);
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Kelola Parfum</h1>
                        <p className="text-gray-600 mt-1">
                            Total {perfumes.length} parfum terdaftar
                        </p>
                    </div>
                    <Link
                        href="/admin/perfumes/create"
                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <span className="mr-2">➕</span>
                        Tambah Parfum
                    </Link>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {perfumes.length === 0 && !error && (
                    <div className="text-center py-16 bg-white rounded-xl shadow-md">
                        <span className="text-6xl">📦</span>
                        <h3 className="mt-4 text-xl font-semibold text-gray-800">
                            Belum ada parfum
                        </h3>
                        <p className="text-gray-600 mt-2">
                            Mulai dengan menambahkan parfum pertama Anda.
                        </p>
                        <Link
                            href="/admin/perfumes/create"
                            className="mt-6 inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Tambah Parfum Pertama
                        </Link>
                    </div>
                )}

                {/* Perfume Table */}
                {perfumes.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Parfum
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Brand
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Harga
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Stok
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {perfumes.map((perfume) => (
                                        <tr key={perfume.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                        {perfume.primary_image?.url ? (
                                                            <img
                                                                src={perfume.primary_image.url}
                                                                alt={perfume.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl">🌸</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {perfume.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate max-w-xs">
                                                            {perfume.description || "Tidak ada deskripsi"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-600">
                                                    {perfume.brand || "-"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-800">
                                                    Rp{Number(perfume.price || 0).toLocaleString("id-ID")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-800">{perfume.stock || 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {perfume.stock === 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Habis
                                                    </span>
                                                ) : perfume.stock <= 5 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Stok Rendah
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Tersedia
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={`/admin/perfumes/${perfume.id}/edit`}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <Link
                                                        href={`/admin/perfumes/${perfume.id}/images`}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Kelola Gambar"
                                                    >
                                                        🖼️
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteClick(perfume)}
                                                        disabled={deleteLoading === perfume.id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Hapus"
                                                    >
                                                        {deleteLoading === perfume.id ? "⏳" : "🗑️"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Hapus Parfum?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin menghapus{" "}
                                <strong>{perfumeToDelete?.name}</strong>? Tindakan ini tidak
                                dapat dibatalkan.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setPerfumeToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                                >
                                    {deleteLoading ? "Menghapus..." : "Hapus"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
