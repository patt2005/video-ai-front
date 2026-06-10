import axios from 'axios';

const BASE_URL = 'https://video-ai-front-production.up.railway.app';

function authHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface CreateImageParams {
    prompt: string;
    size: string;
    resolution: string;
    imageUrls?: string[];
}

interface GenerateImageResponse {
    taskId: string;
    poyoTaskId: string;
    status: string;
}

interface ImageStatusResponse {
    taskId: string;
    poyoTaskId: string;
    status: 'not_started' | 'running' | 'finished' | 'failed';
    progress: number;
    imageUrls: string[];
    errorMessage: string | null;
}

export interface ImagePollResult {
    status: 'not_started' | 'running' | 'finished' | 'failed';
    progress: number;
    imageUrls: string[];
    errorMessage: string | null;
}

async function generateImage(params: CreateImageParams): Promise<string> {
    const { data: task } = await axios.post<GenerateImageResponse>(
        `${BASE_URL}/api/image/generate`,
        {
            prompt: params.prompt,
            size: params.size,
            resolution: params.resolution,
            imageUrls: params.imageUrls ?? [],
        },
        { headers: authHeaders() }
    );

    return task.taskId;
}

async function pollStatus(taskId: string): Promise<ImageStatusResponse> {
    const { data } = await axios.get<ImageStatusResponse>(
        `${BASE_URL}/api/image/status/${taskId}`,
        { headers: authHeaders() }
    );
    return data;
}

function pollUntilDone(
    taskId: string,
    onProgress?: (progress: number) => void,
    intervalMs = 3000,
    maxWaitMs = 600000
): Promise<string> {
    const start = Date.now();
    return new Promise<string>((resolve, reject) => {
        const interval = setInterval(async () => {
            try {
                const result = await pollStatus(taskId);
                if (onProgress) onProgress(result.progress ?? 0);

                if (result.status === 'finished') {
                    clearInterval(interval);
                    const url = result.imageUrls?.[0];
                    if (url) resolve(url);
                    else reject(new Error('Generation finished but no image URL returned.'));
                } else if (result.status === 'failed') {
                    clearInterval(interval);
                    reject(new Error(result.errorMessage ?? 'Image generation failed.'));
                } else if (Date.now() - start >= maxWaitMs) {
                    clearInterval(interval);
                    reject(new Error('Image generation timed out.'));
                }
            } catch (err) {
                clearInterval(interval);
                reject(err);
            }
        }, intervalMs);
    });
}

async function generateImageAndPoll(
    params: CreateImageParams,
    onProgress?: (progress: number) => void,
    intervalMs = 3000,
    maxWaitMs = 300000
): Promise<string> {
    const taskId = await generateImage(params);
    return pollUntilDone(taskId, onProgress, intervalMs, maxWaitMs);
}

export const imageService = {
    generateImage,
    pollStatus,
    pollUntilDone,
    generateImageAndPoll,
};
