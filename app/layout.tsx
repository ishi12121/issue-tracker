"use client";

import "@radix-ui/themes/styles.css";
import "./theme-config.css";
import "./globals.css";

import { Inter } from "next/font/google";
import { Container, Theme } from "@radix-ui/themes";
import NavBar from "./NavBar";
import AuthProvider from "./auth/Provider";
import QueryClientProvider from "./QueryClientProvider";
import { useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);

  const handleTouchStart = (event: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(event.touches[0].clientY);
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (startY !== null && window.scrollY === 0) {
      const currentY = event.touches[0].clientY;
      if (currentY - startY > 50) {
        // Threshold of 50px for downward drag
        setIsRefreshing(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isRefreshing) {
      // Refresh logic here
      setTimeout(() => {
        window.location.reload();
      }, 1000); // 1-second delay to simulate refresh
    }
    setIsRefreshing(false);
    setStartY(null);
  };

  return (
    <html lang="en">
      <body
        className={inter.variable}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <QueryClientProvider>
          <AuthProvider>
            <Theme accentColor="violet">
              <NavBar />
              <main className="p-5">
                <Container>{children}</Container>
              </main>
            </Theme>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
