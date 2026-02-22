export type ContentType = 'image' | 'video';
export type TaskStatus = 'pending' | 'success' | 'failed';

export interface Task {
    id: number;
    userId: number;
    creationDate: string;
    contentId: number | null;
    status: TaskStatus;
}
