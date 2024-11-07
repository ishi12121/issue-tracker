"use client";

import "@radix-ui/themes/styles.css";
import "./theme-config.css";
import "./globals.css";

import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import PullToRefresh from "react-pull-to-refresh";
import AuthProvider from "./auth/Provider";
import "./globals.css";
import NavBar from "./NavBar";
import QueryClientProvider from "./QueryClientProvider";
import { useCallback, useState } from "react";

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

  const handleRefresh = useCallback(() => {
    if (window.scrollY === 0) {
      setIsRefreshing(true);
      // Add your logic for refreshing the page or data here
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Simulating a 1-second refresh
    }
  }, []);

  return (
    <html lang="en">
      <body
        className={inter.variable}
        onTouchStart={handleRefresh}
        onTouchEnd={() => setIsRefreshing(false)}
      >
        <QueryClientProvider>
          <AuthProvider>
            <Theme accentColor="violet">
              <PullToRefresh onRefresh={onRefresh}>
                <NavBar />
                <main className="p-5">
                  <Container>{children}</Container>
                </main>
              </PullToRefresh>
            </Theme>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
