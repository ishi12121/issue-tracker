// KanbanSkeleton.tsx
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Box, Flex } from "@radix-ui/themes";
import { useWindowSize } from "../hooks/useWindowSize";

const KanbanBoardSkeleton = () => {
  const [mounted, setMounted] = React.useState(false);
  const { isMobile } = useWindowSize();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const columns = ["OPEN", "IN_PROGRESS", "CLOSED"];
  const cardsPerColumn = 3;

  return (
    <Box
      style={{
        touchAction: "none",
        userSelect: "none",
        overflowX: "auto",
        paddingBottom: "20px",
        minWidth: "300px",
      }}
    >
      <Flex gap="4" width="100%" direction={isMobile ? "column" : "row"}>
        {columns.map((status) => (
          <Box
            key={status}
            style={{
              flex: isMobile ? "none" : 1,
              minWidth: "300px",
            }}
          >
            {/* Column Header */}
            <Flex justify="between" align="center" mb="3">
              <Flex align="center" gap="2">
                <Skeleton circle width={16} height={16} />
                <Skeleton width={100} />
              </Flex>
              <Skeleton width={24} height={20} borderRadius={8} />
            </Flex>

            {/* Column Content */}
            <Box
              style={{
                padding: "var(--space-3)",
                backgroundColor: "var(--gray-3)",
                borderRadius: "var(--radius-3)",
                minHeight: isMobile ? "auto" : "70vh",
              }}
            >
              <Flex direction="column" gap="2">
                {Array(cardsPerColumn)
                  .fill(0)
                  .map((_, index) => (
                    <Box
                      key={index}
                      style={{
                        backgroundColor: "white",
                        padding: "12px",
                        borderRadius: "6px",
                      }}
                    >
                      <Flex justify="between" align="center" gap="3" mb="2">
                        <Flex align="center" gap="2">
                          <Skeleton width={16} height={16} />
                          <Skeleton width={140} />
                        </Flex>
                        <Skeleton width={60} height={20} borderRadius={8} />
                      </Flex>
                      <Box mb="2">
                        <Skeleton count={2} />
                      </Box>
                      <Flex align="center" gap="2">
                        <Skeleton width={70} />
                        <Skeleton circle width={20} height={20} />
                      </Flex>
                    </Box>
                  ))}
              </Flex>
            </Box>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default KanbanBoardSkeleton;
