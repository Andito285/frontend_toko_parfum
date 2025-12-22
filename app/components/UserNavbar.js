"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function UserNavbar({ user, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const isCartPage = pathname === "/cart";

    const navItems = [
        { name: "Beranda", href: "/" },
        { name: "Parfum", href: "/perfumes" },
        { name: "Tentang", href: "/about" },
    ];

    const handleLogout = () => {
        onLogout();
        router.push("/");
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-2xl font-bold text-indigo-700 hover:text-indigo-500 transition-colors"
                    >
                        Jamal<span className="text-purple-600">Parfum</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-600 font-medium text-sm">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </span>
                                </div>
                                <span className="text-gray-700 font-medium">
                                    {user?.name || "User"}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                            >
                                Keluar
                            </button>
                        </div>
                        {isCartPage ? (
                            <Link
                                href="/"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                            >
                                <span>←</span>
                                <span>Lanjut Belanja</span>
                            </Link>
                        ) : (
                            <button
                                onClick={() => router.push("/cart")}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Keranjang</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-700 focus:outline-none"
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
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="flex flex-col space-y-3 pt-2 border-t border-gray-200 px-4">
                                <div className="flex items-center space-x-2 py-2">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <span className="text-indigo-600 font-medium text-sm">
                                            {user?.name?.charAt(0).toUpperCase() || "U"}
                                        </span>
                                    </div>
                                    <span className="text-gray-700 font-medium">
                                        {user?.name || "User"}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        router.push("/cart");
                                        setIsMenuOpen(false);
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Keranjang
                                </button>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="text-left text-red-600 hover:bg-gray-100 px-4 py-2 rounded-lg"
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
