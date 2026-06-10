const IMAGE_KEY = 'movyai:active-image-task';
const VIDEO_KEY = 'movyai:active-video-task';

export type ActiveImageTask = {
    taskId: string;
    prompt: string;
    size: string;
    resolution: string;
    startedAt: number;
};

export type ActiveVideoTask = {
    taskId: string;
    prompt: string;
    ratio: string;
    model: string;
    startedAt: number;
};

function read<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export const activeImageTask = {
    set: (t: ActiveImageTask) => localStorage.setItem(IMAGE_KEY, JSON.stringify(t)),
    get: () => read<ActiveImageTask>(IMAGE_KEY),
    clear: () => localStorage.removeItem(IMAGE_KEY),
};

export const activeVideoTask = {
    set: (t: ActiveVideoTask) => localStorage.setItem(VIDEO_KEY, JSON.stringify(t)),
    get: () => read<ActiveVideoTask>(VIDEO_KEY),
    clear: () => localStorage.removeItem(VIDEO_KEY),
};
