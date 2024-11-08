// KanbanBoard.tsx
"use client";
import {
  CheckCircledIcon,
  ClockIcon,
  DragHandleDots2Icon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Avatar, Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useWindowSize } from "../hooks/useWindowSize";
import KanbanSkeleton from "./ KanbanSkeleton";

interface Issue {
  image: string;
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  assignedToUser?: {
    image?: string;
  };
}

interface Position {
  x: number;
  y: number;
}

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
    async (payload: {
      issueId: string;
      newStatus: "OPEN" | "IN_PROGRESS" | "CLOSED";
    }) => {
      await axios.patch(`/api/issues/${payload.issueId}`, {
        status: payload.newStatus,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["issues"]);
        toast.success("Issue status updated");
      },
      onError: () => {
        toast.error("Could not update issue status");
      },
    }
  );

  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<Position>({ x: 0, y: 0 });
  const dragElementRef = useRef<HTMLDivElement>(null);
  const dragTargetRef = useRef<string | null>(null);

  const handleDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    issue: Issue
  ) => {
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setDragPosition({ x: clientX, y: clientY });
    setDraggedIssue(issue);
    setIsDragging(true);
  };

  const handleDragMove = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (!isDragging) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      setDragPosition({ x: clientX, y: clientY });

      const elements = document.elementsFromPoint(clientX, clientY);
      const columnElement = elements.find(
        (el) => el.getAttribute("data-column-type") !== null
      );

      if (columnElement) {
        const columnType = columnElement.getAttribute("data-column-type");
        setDraggedOver(columnType);
        dragTargetRef.current = columnType;
      } else {
        setDraggedOver(null);
        dragTargetRef.current = null;
      }
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (!isDragging || !draggedIssue) {
        return;
      }

      const finalX =
        "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
      const finalY =
        "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;

      const elements = document.elementsFromPoint(finalX, finalY);
      const columnElement = elements.find(
        (el) => el.getAttribute("data-column-type") !== null
      );

      const finalColumnType =
        columnElement?.getAttribute("data-column-type") ||
        dragTargetRef.current;

      if (
        finalColumnType &&
        draggedIssue &&
        finalColumnType !== draggedIssue.status
      ) {
        updateIssueStatus({
          issueId: draggedIssue.id,
          newStatus: finalColumnType as "OPEN" | "IN_PROGRESS" | "CLOSED",
        });
      }

      setIsDragging(false);
      setDraggedIssue(null);
      setDraggedOver(null);
      dragTargetRef.current = null;
    },
    [isDragging, draggedIssue, updateIssueStatus]
  );

  useEffect(() => {
    const handleMove = (e: TouchEvent | MouseEvent) => handleDragMove(e);
    const handleEnd = (e: TouchEvent | MouseEvent) => handleDragEnd(e);

    if (isDragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, draggedIssue, handleDragEnd, handleDragMove]);

  const columns = {
    OPEN: issues?.filter((issue) => issue.status === "OPEN") || [],
    IN_PROGRESS:
      issues?.filter((issue) => issue.status === "IN_PROGRESS") || [],
    CLOSED: issues?.filter((issue) => issue.status === "CLOSED") || [],
  };

  const getStatusColor = (status: "OPEN" | "IN_PROGRESS" | "CLOSED") => {
    switch (status) {
      case "OPEN":
        return {
          icon: <ClockIcon className="h-4 w-4" />,
          color: "yellow",
          bg: "var(--yellow-3)",
        };
      case "IN_PROGRESS":
        return {
          icon: <ExclamationTriangleIcon className="h-4 w-4" />,
          color: "blue",
          bg: "var(--blue-3)",
        };
      case "CLOSED":
        return {
          icon: <CheckCircledIcon className="h-4 w-4" />,
          color: "green",
          bg: "var(--green-3)",
        };
      default:
        return { icon: null, color: "gray" as const, bg: "var(--gray-3)" };
    }
  };

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return <KanbanSkeleton />;
  }

  if (isError) {
    return <div>Error: {(error as Error).message}</div>;
  }

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
        {Object.entries(columns).map(([status, statusIssues]) => {
          const { icon, color, bg } = getStatusColor(
            status as "OPEN" | "IN_PROGRESS" | "CLOSED"
          );
          return (
            <Box
              key={status}
              data-column-type={status}
              style={{
                flex: isMobile ? "none" : 1,
                borderRadius: "var(--radius-3)",
                border:
                  draggedOver === status
                    ? "2px solid var(--blue-7)"
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                minHeight: isMobile ? "auto" : "200px",
                maxHeight: isMobile ? "70vh" : "none",
                overflow: isMobile ? "auto" : "hidden",
              }}
            >
              <Flex justify="between" align="center" mb="3">
                <Flex align="center" gap="2">
                  <Box style={{ color: `var(--${color}-9)` }}>{icon}</Box>
                  <Text size="2" weight="bold">
                    {status.replace("_", " ")}
                  </Text>
                </Flex>
                <Badge size="1" variant="soft">
                  {statusIssues.length}
                </Badge>
              </Flex>

              <Box
                data-column-type={status}
                style={{
                  padding: "var(--space-3)",
                  backgroundColor: bg,
                  borderRadius: "var(--radius-3)",
                  minHeight: isMobile ? "auto" : "70vh",
                  minWidth: "300px",
                }}
              >
                <Flex direction="column" gap="2">
                  {statusIssues.map((issue) => (
                    <Card
                      key={issue.id}
                      onMouseDown={(e) => handleDragStart(e, issue)}
                      onTouchStart={(e) => handleDragStart(e, issue)}
                      style={{
                        opacity: draggedIssue?.id === issue.id ? 0.5 : 1,
                        cursor: "move",
                        touchAction: "none",
                      }}
                    >
                      <Flex direction="column" gap="2">
                        <Flex justify="between" align="center" gap="3">
                          <Flex align="center" gap="2">
                            <DragHandleDots2Icon />
                            <Text size="2" weight="bold">
                              {issue.title}
                            </Text>
                          </Flex>
                          <Badge
                            size="1"
                            variant="soft"
                            color={
                              color as "yellow" | "blue" | "green" | "gray"
                            }
                          >
                            {status.replace("_", " ")}
                          </Badge>
                        </Flex>
                        <Text
                          size="1"
                          color="gray"
                          style={{
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {issue.description}
                        </Text>
                        <Flex align="center" gap="2">
                          <Text size="1">Assigned to</Text>
                          <Avatar
                            size="1"
                            src={issue.image || ""}
                            fallback="?"
                            radius="full"
                          />
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Box>
            </Box>
          );
        })}
      </Flex>

      {isDragging && draggedIssue && (
        <div
          ref={dragElementRef}
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
  );
};

export default KanbanBoard;
