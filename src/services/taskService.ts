import type { Task } from '../types/generation/task';
import { TaskStatus } from '../types/generation/task';
import type { Content } from '../types/generation/content';
import { ContentType } from '../types/generation/content';
import { mockGenerationTasks, mockContentList } from '../_mock/tasks';

function toNumericUserId(userId: number | string): number {
    if (typeof userId === 'number') return userId;
    const n = parseInt(userId, 10);
    return Number.isNaN(n) ? 1 : n;
}

export const taskService = {
    getTasks(userId: number | string, search?: string | null): Task[] {
        const uid = toNumericUserId(userId);
        const userTasks = mockGenerationTasks.filter((task) => task.userId === uid);

        if (search == null || search.trim() === '') {
            return userTasks;
        }

        const term = search.trim().toLowerCase();
        return userTasks.filter((task) => String(task.id).toLowerCase().includes(term));
    },

    getContent(contentId: number | null): Content | null {
        if (contentId == null) return null;
        return mockContentList.find((c) => c.id === contentId) ?? null;
    },

    addTask(userId: number | string, type: ContentType, url: string): Task {
        const uid = toNumericUserId(userId);
        const nextContentId =
            mockContentList.length > 0
                ? Math.max(...mockContentList.map((c) => c.id)) + 1
                : 1;
        const nextTaskId =
            mockGenerationTasks.length > 0
                ? Math.max(...mockGenerationTasks.map((t) => t.id)) + 1
                : 1;
        const content: Content = { id: nextContentId, type, url };
        mockContentList.push(content);
        const task: Task = {
            id: nextTaskId,
            userId: uid,
            creationDate: new Date().toISOString(),
            contentId: nextContentId,
            status: TaskStatus.Success,
        };
        mockGenerationTasks.push(task);
        return task;
    },
};
