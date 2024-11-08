export type IssueStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

export interface Issue {
  image: string;
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  assignedToUser?: {
    image?: string;
  };
}

export interface Position {
  x: number;
  y: number;
}
