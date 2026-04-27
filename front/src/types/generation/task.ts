export const TaskStatus = {
    Pending: "Pending",
    Success: "Success",
    Failed: "Failed"
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export interface Task {
    id: number;
    userId: number;
    creationDate: string;
    contentId: number | null;
    status: TaskStatus;
}
