import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Providers from "./provider";
import { ThemeProvider } from "next-themes";
import AppToaster from "@/components/layout/AppToaster";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearnHub - Online Learning Platform",
  description: "Discover and learn from top-quality courses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} pt-12`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Providers>
            <Navbar />
            <Suspense>{children}</Suspense>
          </Providers>
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
