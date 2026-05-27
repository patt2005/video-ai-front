import type { Content } from './content';

export const TaskStatus = {
    Pending: "Pending",
    Success: "Success",
    Failed: "Failed"
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export interface Task {
    id: string;
    userId: string;
    prompt?: string | null;
    creationDate: string;
    contentId: string | null;
    status: TaskStatus;
    content?: Content | null;
}
