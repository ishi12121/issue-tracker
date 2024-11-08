import { useCallback, useEffect, useRef, useState } from "react";
import { Issue, IssueStatus, Position } from "../types/kanban";

export const useDragAndDrop = (
  updateIssueStatus: (payload: {
    issueId: string;
    newStatus: IssueStatus;
  }) => void
) => {
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<Position>({ x: 0, y: 0 });
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
      if (!isDragging || !draggedIssue) return;

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
          newStatus: finalColumnType as IssueStatus,
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
  }, [isDragging, handleDragEnd, handleDragMove]);

  return {
    draggedIssue,
    draggedOver,
    isDragging,
    dragPosition,
    handleDragStart,
  };
};
