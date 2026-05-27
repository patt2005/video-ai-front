import axios from 'axios';

const BASE_URL = 'http://localhost:5014';

export type VideoModel = 'Veo31Fast' | 'Veo31Lite' | 'Veo31Quality';
export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export interface CreateVideoTaskParams {
    userId: string;
    prompt: string;
    aspectRatio: VideoAspectRatio;
    model: VideoModel;
    imageUrls: string[];
}

interface GenerateVideoResponse {
    taskId: string;
    poyoTaskId: string;
    status: string;
}

interface VideoStatusResponse {
    taskId: string;
    poyoTaskId: string;
    status: 'not_started' | 'running' | 'finished' | 'failed';
    progress: number;
    videoUrls: string[];
    errorMessage: string | null;
}

export interface CreateVideoTaskResult {
    taskId: string;
}

async function createTask(params: CreateVideoTaskParams): Promise<CreateVideoTaskResult> {
    const { data } = await axios.post<GenerateVideoResponse>(`${BASE_URL}/api/video/generate`, {
        userId: params.userId,
        prompt: params.prompt,
        aspectRatio: params.aspectRatio,
        model: params.model,
        imageUrls: params.imageUrls,
    });
    return { taskId: data.taskId };
}

async function pollStatus(taskId: string): Promise<VideoStatusResponse> {
    const { data } = await axios.get<VideoStatusResponse>(
        `${BASE_URL}/api/video/status/${taskId}`
    );
    return data;
}

async function generateVideoAndPoll(
    params: CreateVideoTaskParams,
    onProgress?: (progress: number) => void,
    intervalMs = 5000,
    maxWaitMs = 360000
): Promise<string> {
    const { taskId } = await createTask(params);
    const start = Date.now();

    return new Promise<string>((resolve, reject) => {
        const interval = setInterval(async () => {
            try {
                const result = await pollStatus(taskId);

                if (onProgress) {
                    onProgress(result.progress ?? 0);
                }

                if (result.status === 'finished') {
                    clearInterval(interval);
                    const url = result.videoUrls?.[0];
                    if (url) {
                        resolve(url);
                    } else {
                        reject(new Error('Generation finished but no video URL returned.'));
                    }
                } else if (result.status === 'failed') {
                    clearInterval(interval);
                    reject(new Error(result.errorMessage ?? 'Video generation failed.'));
                } else if (Date.now() - start >= maxWaitMs) {
                    clearInterval(interval);
                    reject(new Error('Video generation timed out.'));
                }
            } catch (err) {
                clearInterval(interval);
                reject(err);
            }
        }, intervalMs);
    });
}

export const videoService = {
    createTask,
    pollStatus,
    generateVideoAndPoll,
};
