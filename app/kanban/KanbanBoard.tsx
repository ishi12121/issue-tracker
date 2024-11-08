"use client";
import { Box, Card, Flex, Text } from "@radix-ui/themes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useWindowSize } from "../hooks/useWindowSize";

import { KanbanColumn } from "../components/KanbanColumn";
import { Issue, IssueStatus } from "../types/kanban";
import KanbanBoardSkeleton from "./ KanbanBoardSkeleton";

const KanbanBoard = () => {
  const [mounted, setMounted] = React.useState(false);
  const { isMobile } = useWindowSize();
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: issues,
    isLoading,
    isError,
    error,
  } = useQuery<Issue[]>(["issues"], async () => {
    const response = await axios.get("/api/issues");
    return response.data;
  });

  const { mutate: updateIssueStatus } = useMutation(
    async (payload: { issueId: string; newStatus: IssueStatus }) => {
      await axios.patch(`/api/issues/${payload.issueId}`, {
        status: payload.newStatus,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["issues"]);
        toast.success("Issue status updated", {
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        });
      },
      onError: (error) => {
        toast.error(
          `Error: ${
            error instanceof Error
              ? error.message
              : "Could not update issue status"
          }`,
          {
            duration: 4000,
          }
        );
      },
    }
  );

  const {
    draggedIssue,
    draggedOver,
    isDragging,
    dragPosition,
    handleDragStart,
  } = useDragAndDrop(updateIssueStatus);

  if (!mounted) return null;
  if (isLoading) return <KanbanBoardSkeleton />;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  const columns: Record<IssueStatus, Issue[]> = {
    OPEN: issues?.filter((issue) => issue.status === "OPEN") || [],
    IN_PROGRESS:
      issues?.filter((issue) => issue.status === "IN_PROGRESS") || [],
    CLOSED: issues?.filter((issue) => issue.status === "CLOSED") || [],
  };

  return (
    <>
      <Toaster />
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
          {(Object.keys(columns) as IssueStatus[]).map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              issues={columns[status]}
              onDragStart={handleDragStart}
              isDraggedOver={draggedOver === status}
              draggedIssue={draggedIssue}
              isMobile={isMobile}
            />
          ))}
        </Flex>

        {isDragging && draggedIssue && (
          <div
            style={{
              position: "fixed",
              left: dragPosition.x - 100,
              top: dragPosition.y - 50,
              width: "200px",
              zIndex: 1000,
              transform: "rotate(4deg)",
              opacity: 0.9,
              pointerEvents: "none",
            }}
          >
            <Card>
              <Text size="2" weight="bold">
                {draggedIssue.title}
              </Text>
            </Card>
          </div>
        )}
      </Box>
    </>
  );
};

export default KanbanBoard;
