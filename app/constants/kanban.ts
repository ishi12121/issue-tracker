import {
  CheckCircledIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
export const STATUS_COLORS = {
  OPEN: {
    icon: ClockIcon,
    color: "yellow",
    bg: "var(--yellow-3)",
  },
  IN_PROGRESS: {
    icon: ExclamationTriangleIcon,
    color: "blue",
    bg: "var(--blue-3)",
  },
  CLOSED: {
    icon: CheckCircledIcon,
    color: "green",
    bg: "var(--green-3)",
  },
} as const;
