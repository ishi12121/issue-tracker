"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Flex, Text, Avatar, Box, Badge } from "@radix-ui/themes";
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  DragHandleDots2Icon,
} from "@radix-ui/react-icons";
import axios from "axios";
import toast from "react-hot-toast";

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
  const queryClient = useQueryClient();
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

      // Find which column we're over
      const elements = document.elementsFromPoint(clientX, clientY);
      const columnElement = elements.find(
        (el) => el.getAttribute("data-column-type") !== null
      );

      if (columnElement) {
        const columnType = columnElement.getAttribute("data-column-type");
        setDraggedOver(columnType);
        dragTargetRef.current = columnType; // Store the current target
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

      // Get final position
      const finalX =
        "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
      const finalY =
        "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;

      // Find the column at release position
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

      // Reset all states
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

  if (isLoading) {
    return <div>Loading...</div>;
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
      <Flex
        gap="4"
        width="100%"
        direction={
          window.innerWidth < 768 ? "column" : "row" // Switch to vertical layout on small screens
        }
      >
        {Object.entries(columns).map(([status, statusIssues]) => {
          const { icon, color, bg } = getStatusColor(
            status as "OPEN" | "IN_PROGRESS" | "CLOSED"
          );
          return (
            <Box
              key={status}
              data-column-type={status}
              style={{
                flex: window.innerWidth < 768 ? "none" : 1, // Set flex-grow to 0 on small screens
                borderRadius: "var(--radius-3)",
                border:
                  draggedOver === status
                    ? "2px solid var(--blue-7)"
                    : "2px solid transparent",
                transition: "all 0.2s ease",
                minHeight: window.innerWidth < 768 ? "auto" : "200px", // Set fixed height on small screens
                maxHeight: window.innerWidth < 768 ? "70vh" : "none", // Set max-height on small screens
                overflow: window.innerWidth < 768 ? "auto" : "hidden", // Enable vertical scrolling on small screens
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
                  minHeight: window.innerWidth < 768 ? "auto" : "70vh", // Set min-height on small screens
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

      {/* Dragged Element Clone */}
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