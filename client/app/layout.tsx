import type { Metadata } from "next";
import { Sen, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Favicon from "@/components/Favicon";
import DynamicMeta from "@/components/DynamicMeta";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

const sen = Sen({
  subsets: ["latin"],
  variable: "--font-sen",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tobo Digital - Modern E-commerce Store",
  description: "Discover amazing products at Tobo Digital",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sen.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Favicon />
        <DynamicMeta />
        <CartProvider>
          <WishlistProvider>
            <Header />
            <main className="min-w-0 overflow-x-clip">{children}</main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
