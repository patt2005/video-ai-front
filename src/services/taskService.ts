import type { Task } from '../types/generation/task';
import type { Content } from '../types/generation/content';
import { mockGenerationTasks, mockContentList } from '../_mock/tasks';

export const taskService = {
    getTasks(userId: number, search?: string | null): Task[] {
        const userTasks = mockGenerationTasks.filter((task) => task.userId === userId);

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
};
