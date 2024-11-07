"use client";
import { Container, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import PullToRefresh from "react-pull-to-refresh";
import AuthProvider from "./auth/Provider";
import "./globals.css";
import NavBar from "./NavBar";
import QueryClientProvider from "./QueryClientProvider";
import "./theme-config.css";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const onRefresh = async () => {
    router.refresh();
  };
  return (
    <html lang="en">
      <body className={inter.variable}>
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
