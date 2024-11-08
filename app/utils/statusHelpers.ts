import {
  CheckCircledIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import React from "react";
import { IssueStatus } from "../types/kanban";

export const getStatusColor = (status: IssueStatus) => {
  switch (status) {
    case "OPEN":
      return {
        icon: React.createElement(ClockIcon, { className: "h-4 w-4" }),
        color: "yellow",
        bg: "var(--yellow-3)",
      };
    case "IN_PROGRESS":
      return {
        icon: React.createElement(ExclamationTriangleIcon, {
          className: "h-4 w-4",
        }),
        color: "blue",
        bg: "var(--blue-3)",
      };
    case "CLOSED":
      return {
        icon: React.createElement(CheckCircledIcon, { className: "h-4 w-4" }),
        color: "green",
        bg: "var(--green-3)",
      };
    default:
      return {
        icon: null,
        color: "gray" as const,
        bg: "var(--gray-3)",
      };
  }
};
