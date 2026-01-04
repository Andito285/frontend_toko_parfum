import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sistem Manajemen Parfum",
  description: "Dashboard untuk mengelola data produk parfum",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Navbar />
        {children}
        <footer className="bg-black border-t border-yellow-600/30 py-6 text-center text-gray-400 text-sm">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-yellow-500/80">
              © {new Date().getFullYear()} Sistem Manajemen Parfum • Data
              diambil dari API lokal
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
