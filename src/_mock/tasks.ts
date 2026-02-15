import type { Task } from '../types/generation/task';
import type { Content } from '../types/generation/content';

export const mockContentList: Content[] = [
    { id: 101, type: 'image', url: 'https://api.movyai.app/sample/image-101.jpg' },
    { id: 102, type: 'video', url: 'https://api.movyai.app/sample/video-102.mp4' },
    { id: 103, type: 'image', url: 'https://api.movyai.app/sample/image-103.jpg' },
    { id: 104, type: 'video', url: 'https://api.movyai.app/sample/video-104.mp4' },
    { id: 105, type: 'image', url: 'https://api.movyai.app/sample/image-105.jpg' },
    { id: 106, type: 'video', url: 'https://api.movyai.app/sample/video-106.mp4' },
];

export const mockGenerationTasks: Task[] = [
    { id: 1, userId: 2, creationDate: '2025-05-01T10:30:00Z', contentId: 101, status: 'success' },
    { id: 2, userId: 2, creationDate: '2025-05-03T14:20:00Z', contentId: null, status: 'pending' },
    { id: 3, userId: 3, creationDate: '2025-05-05T09:15:00Z', contentId: 102, status: 'success' },
    { id: 4, userId: 3, creationDate: '2025-05-07T16:45:00Z', contentId: null, status: 'failed' },
    { id: 5, userId: 4, creationDate: '2025-05-10T11:00:00Z', contentId: 103, status: 'success' },
    { id: 6, userId: 4, creationDate: '2025-05-12T08:30:00Z', contentId: 104, status: 'pending' },
    { id: 7, userId: 5, creationDate: '2025-05-15T13:22:00Z', contentId: null, status: 'failed' },
    { id: 8, userId: 5, creationDate: '2025-05-18T17:10:00Z', contentId: 105, status: 'success' },
    { id: 9, userId: 2, creationDate: '2025-05-20T12:00:00Z', contentId: 106, status: 'success' },
    { id: 10, userId: 3, creationDate: '2025-05-22T10:05:00Z', contentId: null, status: 'pending' },
];
