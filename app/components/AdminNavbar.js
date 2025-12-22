"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminNavbar({ user, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Daftar Parfum", href: "/admin/perfumes" },
        { name: "Tambah Parfum", href: "/admin/perfumes/create" },
    ];

    const handleLogout = () => {
        onLogout();
        router.push("/");
    };

    return (
        <nav className="bg-gradient-to-r from-indigo-700 to-purple-700 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/admin/dashboard"
                        className="text-2xl font-bold text-white hover:text-indigo-200 transition-colors flex items-center space-x-2"
                    >
                        <span className="text-2xl">🛡️</span>
                        <span>Admin<span className="text-yellow-300">Panel</span></span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium transition-all"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-700 font-bold text-sm">
                                        {user?.name?.charAt(0).toUpperCase() || "A"}
                                    </span>
                                </div>
                                <div className="text-white">
                                    <p className="font-medium text-sm">{user?.name || "Admin"}</p>
                                    <p className="text-xs text-white/70">Administrator</p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/"
                            className="text-white/80 hover:text-white px-3 py-2 rounded-lg transition-colors text-sm"
                        >
                            Lihat Toko
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            Keluar
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white focus:outline-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/20">
                        <div className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="flex flex-col space-y-3 pt-3 border-t border-white/20 px-4">
                                <div className="flex items-center space-x-2 py-2">
                                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <span className="text-indigo-700 font-bold text-sm">
                                            {user?.name?.charAt(0).toUpperCase() || "A"}
                                        </span>
                                    </div>
                                    <div className="text-white">
                                        <p className="font-medium text-sm">{user?.name || "Admin"}</p>
                                        <p className="text-xs text-white/70">Administrator</p>
                                    </div>
                                </div>
                                <Link
                                    href="/"
                                    className="text-white/80 hover:text-white px-4 py-2 rounded-lg transition-colors text-center border border-white/30"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Lihat Toko
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
