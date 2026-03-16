import type { Task } from '../types/generation/task';
import { TaskStatus } from '../types/generation/task';
import {type Content, ContentType} from '../types/generation/content';

export const mockContentList: Content[] = [
    { id: 101, type: ContentType.Image, url: 'https://deepseekimagegenerator.in/public/gallery/girl.png' },
    { id: 102, type: ContentType.Video, url: 'https://storage.googleapis.com/files-for-apps/6.mp4' },
    { id: 103, type: ContentType.Image, url: 'https://deepseekimagegenerator.in/public/gallery/girl.png' },
    { id: 104, type: ContentType.Video, url: 'https://storage.googleapis.com/files-for-apps/6.mp4' },
    { id: 105, type: ContentType.Image, url: 'https://deepseekimagegenerator.in/public/gallery/girl.png' },
    { id: 106, type: ContentType.Video, url: 'https://storage.googleapis.com/files-for-apps/6.mp4' },
];

export const mockGenerationTasks: Task[] = [
    { id: 1, userId: 1, creationDate: '2025-05-01T10:30:00Z', contentId: 101, status: TaskStatus.Success },
    { id: 11, userId: 2, creationDate: '2025-05-02T10:30:00Z', contentId: null, status: TaskStatus.Pending },
    { id: 2, userId: 2, creationDate: '2025-05-03T14:20:00Z', contentId: null, status: TaskStatus.Pending },
    { id: 3, userId: 3, creationDate: '2025-05-05T09:15:00Z', contentId: 102, status: TaskStatus.Success },
    { id: 4, userId: 3, creationDate: '2025-05-07T16:45:00Z', contentId: null, status: TaskStatus.Failed },
    { id: 5, userId: 4, creationDate: '2025-05-10T11:00:00Z', contentId: 103, status: TaskStatus.Success },
    { id: 6, userId: 4, creationDate: '2025-05-12T08:30:00Z', contentId: 104, status: TaskStatus.Pending },
    { id: 7, userId: 5, creationDate: '2025-05-15T13:22:00Z', contentId: null, status: TaskStatus.Failed },
    { id: 8, userId: 5, creationDate: '2025-05-18T17:10:00Z', contentId: 105, status: TaskStatus.Success },
    { id: 9, userId: 2, creationDate: '2025-05-20T12:00:00Z', contentId: 106, status: TaskStatus.Success },
    { id: 10, userId: 3, creationDate: '2025-05-22T10:05:00Z', contentId: null, status: TaskStatus.Pending },
];
