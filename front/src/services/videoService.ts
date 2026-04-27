import { TaskStatus } from '../types/generation/task';
import { ContentType } from '../types/generation/content';
import { taskService } from './taskService';
import { exploreVideos } from '../_mock/videos';

export interface VideoTaskPollResult {
  status: TaskStatus;
  url?: string;
  error?: string;
}

export interface CreateVideoTaskParams {
  prompt: string;
  imageUrl: string | null;
}

export interface CreateVideoTaskOptions {
  userId?: number | string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateTaskId(): string {
  return `vid_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface CreateVideoTaskResult {
  taskId: string;
  url: string;
}

export async function createTask(
  params: CreateVideoTaskParams,
  options?: CreateVideoTaskOptions
): Promise<CreateVideoTaskResult> {
  const taskId = generateTaskId();
  await delay(4000);
  const url = exploreVideos[0].videoUrl;
  if (options?.userId != null) {
    taskService.addTask(options.userId, ContentType.Video, url);
  }
  return { taskId, url };
}

async function pollTask(taskId: string): Promise<VideoTaskPollResult> {
  // TODO: Call the backend

  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log(taskId);

  return Promise.resolve({
    status: TaskStatus.Success,
    url: exploreVideos[0].videoUrl,
  });
}

export async function pollTaskUntilComplete(
  taskId: string,
  options: { intervalMs?: number; maxWaitMs?: number } = {}
): Promise<VideoTaskPollResult> {
  const { intervalMs = 1500, maxWaitMs = 120000 } = options;
  const start = Date.now();

  while (true) {
    const result = await pollTask(taskId);
    if (result.status !== TaskStatus.Pending) {
      return result;
    }
    
    if (Date.now() - start >= maxWaitMs) {
      return { status: TaskStatus.Failed, error: 'Polling timeout' };
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

export const videoService = {
  createTask,
  pollTaskUntilComplete,
};
