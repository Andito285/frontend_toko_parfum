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
        <footer className="bg-white border-t py-6 text-center text-gray-600 text-sm">
          <div className="max-w-7xl mx-auto px-4">
            <p>
              © {new Date().getFullYear()} Sistem Manajemen Parfum • Data
              diambil dari API lokal
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
