import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import { Issue, IssueStatus } from "../types/kanban";
import { IssueCard } from "./IssueCard";
import { getStatusColor } from "../utils/statusHelpers";

interface KanbanColumnProps {
  status: IssueStatus;
  issues: Issue[];
  onDragStart: (e: React.MouseEvent | React.TouchEvent, issue: Issue) => void;
  isDraggedOver: boolean;
  draggedIssue: Issue | null;
  isMobile: boolean;
}

export const KanbanColumn = ({
  status,
  issues,
  onDragStart,
  isDraggedOver,
  draggedIssue,
  isMobile,
}: KanbanColumnProps) => {
  const { icon, color, bg } = getStatusColor(status);

  return (
    <Box
      data-column-type={status}
      style={{
        flex: isMobile ? "none" : 1,
        borderRadius: "var(--radius-3)",
        border: isDraggedOver
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
          {issues.length}
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
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onDragStart={onDragStart}
              isDragged={draggedIssue?.id === issue.id}
              statusColor={color}
              status={status}
            />
          ))}
        </Flex>
      </Box>
    </Box>
  );
};
