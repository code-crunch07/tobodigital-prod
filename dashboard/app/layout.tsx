import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const dmSans = DM_Sans({ 
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tobo Admin Dashboard",
  description: "E-commerce Admin Dashboard",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={`${dmSans.className} font-sans`}>
        <ErrorBoundary>
          <DashboardLayout>{children}</DashboardLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
