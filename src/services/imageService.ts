import { ContentType } from '../types/generation/content';
import { taskService } from './taskService';
import { SHOWCASE_IMAGES } from '../_mock/images';

export interface CreateImageParams {
    prompt: string;
    imageUrl: string | null;
}

export interface GenerateImageOptions {
    userId?: number | string;
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const imageService = {
    async generateImage(
        params: CreateImageParams,
        options?: GenerateImageOptions
    ): Promise<string> {
        await delay(4000);
        const resultUrl = SHOWCASE_IMAGES[0];
        if (options?.userId != null) {
            taskService.addTask(options.userId, ContentType.Image, resultUrl);
        }
        return resultUrl;
    },
};