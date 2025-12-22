"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { isAuthenticated, isAdmin, getAuthToken } from "@/lib/auth";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
    const [saving, setSaving] = useState(false);
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
        fetchUsers();
    }, [router]);

    const fetchUsers = async () => {
        try {
            const token = getAuthToken();
            const res = await axios.get(`${baseURL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search, per_page: 50 },
            });
            setUsers(res.data.data || res.data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Gagal memuat data pengguna.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setDeleteLoading(userToDelete.id);
        try {
            const token = getAuthToken();
            await axios.delete(`${baseURL}/api/admin/users/${userToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.filter((u) => u.id !== userToDelete.id));
            setShowDeleteModal(false);
            setUserToDelete(null);
            setSuccess("Pengguna berhasil dihapus!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Error deleting user:", err);
            setError(err.response?.data?.message || "Gagal menghapus pengguna.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleEditClick = (user) => {
        setEditForm({ name: user.name, email: user.email, role: user.role });
        setEditModal(user);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = getAuthToken();
            await axios.put(`${baseURL}/api/admin/users/${editModal.id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.map((u) => (u.id === editModal.id ? { ...u, ...editForm } : u)));
            setEditModal(null);
            setSuccess("Pengguna berhasil diperbarui!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Error updating user:", err);
            setError(err.response?.data?.message || "Gagal memperbarui pengguna.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
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
                        <h1 className="text-3xl font-bold text-gray-800">Kelola Pengguna</h1>
                        <p className="text-gray-600 mt-1">Total {users.length} pengguna terdaftar</p>
                    </div>
                    <Link
                        href="/admin/dashboard"
                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        ← Kembali ke Dashboard
                    </Link>
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

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Pengguna</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Terdaftar</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="text-indigo-600 font-semibold">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-800">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {user.role === "admin" ? "👑 Admin" : "👤 User"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user)}
                                                    disabled={deleteLoading === user.id}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Hapus"
                                                >
                                                    {deleteLoading === user.id ? "⏳" : "🗑️"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Pengguna?</h3>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin menghapus <strong>{userToDelete?.name}</strong>?
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setUserToDelete(null);
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

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Pengguna</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditModal(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                                >
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
