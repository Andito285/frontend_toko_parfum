"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { isAuthenticated, isAdmin } from "@/lib/auth";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated()) {
            if (isAdmin()) {
                router.push("/admin/dashboard");
            } else {
                router.push("/");
            }
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validasi password confirmation
        if (password !== passwordConfirmation) {
            setError("Konfirmasi kata sandi tidak cocok.");
            return;
        }

        // Validasi panjang password
        if (password.length < 6) {
            setError("Kata sandi minimal 6 karakter.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`${baseURL}/api/register`, {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            console.log("Register response:", res.data);

            setSuccess("Pendaftaran berhasil! Mengalihkan ke halaman login...");

            // Redirect ke login setelah 2 detik
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            console.error("Register error:", err);
            const message =
                err.response?.data?.message ||
                err.response?.data?.errors?.email?.[0] ||
                err.response?.data?.errors?.password?.[0] ||
                err.response?.data?.errors?.name?.[0] ||
                "Gagal mendaftar. Silakan coba lagi.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative bg-gray-900 rounded-2xl shadow-xl border border-yellow-600/30 w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        Buat <span className="text-yellow-400">Akun</span> Baru
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Bergabung dan temukan parfum impianmu
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-900/50 text-red-400 rounded-lg text-sm border border-red-600/30">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-3 bg-green-900/50 text-green-400 rounded-lg text-sm border border-green-600/30">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Nama Lengkap
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-yellow-600/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition placeholder-gray-500"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-yellow-600/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition placeholder-gray-500"
                            placeholder="contoh@email.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Kata Sandi
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-yellow-600/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition placeholder-gray-500"
                            placeholder="Minimal 6 karakter"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="passwordConfirmation"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Konfirmasi Kata Sandi
                        </label>
                        <input
                            id="passwordConfirmation"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-yellow-600/30 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition placeholder-gray-500"
                            placeholder="Ulangi kata sandi"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition ${loading
                            ? "bg-yellow-600/50 text-black/50 cursor-not-allowed"
                            : "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500"
                            }`}
                    >
                        {loading ? "Memproses..." : "Daftar"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Sudah punya akun?{" "}
                    <button
                        onClick={() => router.push("/login")}
                        className="text-yellow-400 font-medium hover:text-yellow-300"
                    >
                        Masuk di sini
                    </button>
                </div>
            </div>
        </div>
    );
}
