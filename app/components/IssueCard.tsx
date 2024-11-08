import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Avatar, Badge, Card, Flex, Text } from "@radix-ui/themes";
import { Issue } from "../types/kanban";

interface IssueCardProps {
  issue: Issue;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, issue: Issue) => void;
  isDragged: boolean;
  statusColor: string;
  status: string;
}

export const IssueCard = ({
  issue,
  onDragStart,
  isDragged,
  statusColor,
  status,
}: IssueCardProps) => (
  <Card
    style={{
      opacity: isDragged ? 0.5 : 1,
      cursor: "pointer",
      touchAction: "none",
    }}
  >
    <Flex direction="column" gap="2">
      <Flex justify="between" align="center" gap="3">
        <Flex align="center" gap="2">
          <DragHandleDots2Icon
            style={{
              cursor: isDragged ? "move" : "pointer",
              touchAction: "none",
            }}
            onMouseDown={(e) => onDragStart(e, issue)}
            onTouchStart={(e) => onDragStart(e, issue)}
          />
          <Text size="2" weight="bold">
            {issue.title}
          </Text>
        </Flex>
        <Badge
          size="1"
          variant="soft"
          color={statusColor as "yellow" | "blue" | "green" | "gray"}
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
        <Avatar size="1" src={issue.image || ""} fallback="?" radius="full" />
      </Flex>
    </Flex>
  </Card>
);
