"use client";

import "@radix-ui/themes/styles.css";
import "./theme-config.css";
import "./globals.css";
import { Inter } from "next/font/google";
import { Container, Theme } from "@radix-ui/themes";
import NavBar from "./NavBar";
import AuthProvider from "./auth/Provider";
import QueryClientProvider from "./QueryClientProvider";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const MAX_PULL_DISTANCE = 150;
const REFRESH_THRESHOLD = 100;
const HAPTIC_THRESHOLD = 80;
const TOP_AREA_THRESHOLD = 150; // Area from top where pull-to-refresh can be initiated

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const [isPullToRefreshEnabled, setIsPullToRefreshEnabled] = useState(false);
  const [isDraggingElement, setIsDraggingElement] = useState(false);

  const triggerHapticFeedback = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const getOverscrollAmount = useCallback((distance: number) => {
    const excess = Math.max(0, distance - REFRESH_THRESHOLD);
    return REFRESH_THRESHOLD + excess * 0.1;
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await router.refresh();
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsLoading(false);
      setPullDistance(0);
      setIsRefreshing(false);
      setProgress(0);
      setHasTriggeredHaptic(false);
      setIsPullToRefreshEnabled(false);
    }
  }, [router]);

  const isInteractingWithDraggable = useCallback(
    (target: EventTarget | null): boolean => {
      if (!target) return false;
      const element = target as HTMLElement;

      return Boolean(
        element.closest('[draggable="true"]') ||
          element.closest('[role="button"]') ||
          element.closest(".draggable") ||
          element.closest(".sortable") ||
          element.getAttribute("draggable") === "true" ||
          element.classList.contains("draggable") ||
          element.classList.contains("sortable")
      );
    },
    []
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };

      if (
        window.scrollY === 0 &&
        !isInteractingWithDraggable(event.target) &&
        touch.clientY < TOP_AREA_THRESHOLD &&
        !isDraggingElement
      ) {
        setIsPullToRefreshEnabled(true);
      }
    },
    [isInteractingWithDraggable, isDraggingElement]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!isPullToRefreshEnabled || isLoading || !touchStartRef.current)
        return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Disable pull-to-refresh if horizontal movement is significant
      if (Math.abs(deltaX) > Math.abs(deltaY) || Math.abs(deltaX) > 10) {
        setIsPullToRefreshEnabled(false);
        setPullDistance(0);
        return;
      }

      // Check if we're dragging downward
      if (deltaY < 0) {
        setPullDistance(0);
        return;
      }

      const newPullDistance = Math.min(
        Math.pow(Math.max(deltaY, 0), 0.8),
        getOverscrollAmount(MAX_PULL_DISTANCE)
      );

      setPullDistance(newPullDistance);
      const newProgress = (newPullDistance / REFRESH_THRESHOLD) * 100;
      setProgress(Math.min(newProgress, 100));

      if (!hasTriggeredHaptic && newPullDistance > HAPTIC_THRESHOLD) {
        triggerHapticFeedback();
        setHasTriggeredHaptic(true);
      }

      if (newPullDistance > REFRESH_THRESHOLD) {
        setIsRefreshing(true);
      } else {
        setIsRefreshing(false);
      }

      event.preventDefault();
    },
    [
      isPullToRefreshEnabled,
      isLoading,
      hasTriggeredHaptic,
      getOverscrollAmount,
      triggerHapticFeedback,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    setIsPullToRefreshEnabled(false);

    if (isRefreshing && !isLoading) {
      refresh();
    } else {
      setPullDistance(0);
      setProgress(0);
    }
  }, [isRefreshing, isLoading, refresh]);

  const handleDragStart = useCallback((event: React.DragEvent) => {
    setIsDraggingElement(true);
    setIsPullToRefreshEnabled(false);
    setPullDistance(0);

    // Optional: Add drag image and effects
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      const dragImage = new Image();
      dragImage.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      event.dataTransfer.setDragImage(dragImage, 0, 0);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDraggingElement(false);
  }, []);

  useEffect(() => {
    return () => {
      setIsRefreshing(false);
      setIsLoading(false);
      setPullDistance(0);
      setProgress(0);
      setHasTriggeredHaptic(false);
      setIsPullToRefreshEnabled(false);
      setIsDraggingElement(false);
    };
  }, []);

  return (
    <html lang="en">
      <body className={inter.variable}>
        <QueryClientProvider>
          <AuthProvider>
            <Theme accentColor="violet">
              {isPullToRefreshEnabled &&
                pullDistance > 0 &&
                !isDraggingElement && (
                  <div
                    className="refresh-indicator"
                    style={{
                      transform: `translate(-50%, ${pullDistance * 0.5}px)`,
                      opacity: progress / 100,
                    }}
                  >
                    <div
                      className="pull-progress"
                      style={{
                        transform: `rotate(${progress * 3.6}deg)`,
                      }}
                    />
                    {isRefreshing ? (
                      <svg
                        className="refresh-icon refresh-spinner"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="refresh-icon"
                        viewBox="0 0 24 24"
                        style={{
                          transform: `rotate(${progress * 3.6}deg)`,
                        }}
                      >
                        <path
                          fill="currentColor"
                          d="M12 4V1L8 5l4 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"
                        />
                      </svg>
                    )}
                  </div>
                )}

              <div
                className={`content-wrapper ${
                  isDraggingElement ? "dragging" : ""
                } ${isRefreshing ? "refreshing" : ""}`}
                style={{
                  transform:
                    isPullToRefreshEnabled && !isDraggingElement
                      ? `translateY(${pullDistance}px)`
                      : "none",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <NavBar />
                <main className="p-5">
                  <Container>
                    {isLoading && (
                      <div className="loading-overlay">
                        <div className="loading-spinner" />
                      </div>
                    )}
                    {children}
                  </Container>
                </main>
              </div>
            </Theme>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
