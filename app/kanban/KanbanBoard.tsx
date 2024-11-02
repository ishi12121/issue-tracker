"use client";
import React, { useState, useEffect } from "react";
import { Card, Flex, Text, Avatar, Box, Badge } from "@radix-ui/themes";
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
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

const KanbanBoard = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      const response = await axios.get("/api/issues");
      setIssues(response.data);
    } catch (error) {
      toast.error("Could not fetch issues");
    }
  };

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    issueId: string
  ) => {
    e.dataTransfer.setData("issueId", issueId);
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    newStatus: "OPEN" | "IN_PROGRESS" | "CLOSED"
  ) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData("issueId");
    setDraggedOver(null);

    try {
      await axios.patch(`/api/issues/${issueId}`, { status: newStatus });
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === issueId ? { ...issue, status: newStatus } : issue
        )
      );
      fetchIssues();
      toast.success("Issue status updated");
    } catch (error) {
      toast.error("Could not update issue status");
    }
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    status: string
  ) => {
    e.preventDefault();
    setDraggedOver(status);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
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

  const columns = {
    OPEN: issues.filter((issue) => issue.status === "OPEN"),
    IN_PROGRESS: issues.filter((issue) => issue.status === "IN_PROGRESS"),
    CLOSED: issues.filter((issue) => issue.status === "CLOSED"),
  };

  return (
    <Box px="4">
      <Flex gap="4" width="100%">
        {Object.entries(columns).map(([status, statusIssues]) => {
          const { icon, color, bg } = getStatusColor(
            status as "OPEN" | "IN_PROGRESS" | "CLOSED"
          );
          return (
            <Box
              key={status}
              style={{
                flex: 1,
                borderRadius: "var(--radius-3)",
                border:
                  draggedOver === status
                    ? "2px solid var(--blue-7)"
                    : "2px solid transparent",
              }}
              onDrop={(e) =>
                handleDrop(e, status as "OPEN" | "IN_PROGRESS" | "CLOSED")
              }
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
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
                style={{
                  minHeight: "70vh",
                  padding: "var(--space-3)",
                  backgroundColor: bg,
                  borderRadius: "var(--radius-3)",
                }}
              >
                <Flex direction="column" gap="2">
                  {statusIssues.map((issue) => (
                    <Card
                      key={issue.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, issue.id)}
                      className="draggable-card"
                      style={{
                        cursor: "move",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <Flex direction="column" gap="2">
                        <Flex justify="between" gap="3">
                          <Text size="2" weight="bold">
                            {issue.title}
                          </Text>
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
                        Assigned to{" "}
                        <Avatar
                          size="1"
                          src={issue.image || ""}
                          fallback="?"
                          radius="full"
                        />
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default KanbanBoard;
