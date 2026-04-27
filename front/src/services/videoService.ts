import axios from 'axios';
import { TaskStatus } from '../types/generation/task';

const BASE_URL = 'http://localhost:5014';

export interface VideoTaskPollResult {
  status: TaskStatus;
  url?: string;
  error?: string;
}

export interface CreateVideoTaskParams {
  prompt: string;
  imageUrl: string | null;
}

export interface CreateVideoTaskResult {
  taskId: string;
}

export async function createTask(
  params: CreateVideoTaskParams,
): Promise<CreateVideoTaskResult> {
  const { data } = await axios.post<{ taskId: string }>(`${BASE_URL}/api/video/generate`, {
    prompt: params.prompt,
    imageUrl: params.imageUrl,
  });
  return { taskId: data.taskId };
}

async function pollTask(taskId: string): Promise<VideoTaskPollResult> {
  // TODO: wire up to GET /api/task/{taskId} when the endpoint is ready
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log(taskId);
  return { status: TaskStatus.Pending };
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
