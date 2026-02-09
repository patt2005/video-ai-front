const BASE_URL = typeof window !== 'undefined' ? '/api/vidu' : 'https://api.vidu.com';

export type ViduModel =
  | 'viduq2-pro'
  | 'viduq2-turbo'
  | 'viduq1'
  | 'viduq1-classic'
  | 'vidu2.0'
  | 'vidu1.5';

export type ViduStyle = 'general' | 'anime';
export type ViduAspectRatio = '16:9' | '9:16' | '1:1';
export type ViduResolution = '360p' | '720p' | '1080p';
export type ViduMovementAmplitude = 'auto' | 'small' | 'medium' | 'large';

export interface ViduTaskResponse {
  task_id: string;
}

export interface ViduVideoResolution {
  width?: number;
  height?: number;
}

export interface ViduVideoInfo {
  duration?: number;
  fps?: number;
  resolution?: ViduVideoResolution;
}

export interface ViduCreation {
  id: string;
  url: string;
  cover_url?: string;
  watermarked_url?: string;
  moderation_url?: string[];
  video?: ViduVideoInfo;
}

export interface ViduTaskStatus {
  state: string;
  err_code?: string;
  creations?: ViduCreation[];
  id?: string;
  credits?: number;
  bgm?: boolean;
  payload?: string;
  cus_priority?: number;
  off_peak?: boolean;
}

export class ViduError extends Error {
  constructor(
    message: string,
    public code?:
      | 'invalid_image'
      | 'invalid_response'
      | 'server_error'
      | 'task_failed'
      | 'task_not_found'
      | 'timeout'
      | 'missing_api_key'
  ) {
    super(message);
    this.name = 'ViduError';
  }
}

function getApiKey(): string | undefined {
  return "vda_853129498265128960_6UkoPczufjl06EIQabbvUD80Ruh0AWyp";
}

function createRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: unknown
): Request {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ViduError('Vidu API key is missing. Set VITE_VIDU_API_KEY in .env.', 'missing_api_key');
  }

  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    Authorization: `Token ${apiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const options: RequestInit = { method, headers };
  if (body != null && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  return new Request(url, options);
}

export async function text2video(
  prompt: string,
  options: {
    model?: ViduModel;
    style?: ViduStyle;
    duration?: number;
    aspectRatio?: ViduAspectRatio;
    resolution?: ViduResolution;
    movementAmplitude?: ViduMovementAmplitude;
    bgm?: boolean;
    offPeak?: boolean;
    seed?: number;
  } = {}
): Promise<string> {
  const {
    model = 'viduq2',
    style = 'general',
    duration = 4,
    aspectRatio = '16:9',
    resolution,
    movementAmplitude = 'auto',
    bgm = false,
    offPeak = false,
    seed,
  } = options;

  const body: Record<string, unknown> = {
    prompt: prompt.slice(0, 2000),
    model,
    style,
    duration,
    aspect_ratio: aspectRatio,
    movement_amplitude: movementAmplitude,
    bgm,
    off_peak: offPeak,
  };

  console.log('Response body:');
  console.log(body);
  if (resolution != null) body.resolution = resolution;
  if (seed != null) body.seed = seed;

  const request = createRequest('/ent/v2/text2video', 'POST', body);
  const response = await fetch(request);

  const data = (await response.json()) as ViduTaskResponse & { error?: string };

  if (!response.ok) {
    throw new ViduError(
      data?.error ?? `Request failed with status ${response.status}`,
      'server_error'
    );
  }

  return data.task_id;
}

export async function image2video(
  imageDataUrl: string,
  prompt?: string,
  options: { model?: ViduModel; audio?: boolean } = {}
): Promise<string> {
  const { model = 'vidu2.0', audio = false } = options;

  let base64WithPrefix: string;
  if (imageDataUrl.startsWith('data:')) {
    base64WithPrefix = imageDataUrl;
  } else {
    base64WithPrefix = `data:image/jpeg;base64,${imageDataUrl}`;
  }

  const body: Record<string, unknown> = {
    model,
    images: [base64WithPrefix],
    audio,
  };
  if (prompt != null && prompt.trim()) {
    body.prompt = prompt.trim().slice(0, 2000);
  }

  const request = createRequest('/ent/v2/img2video', 'POST', body);
  const response = await fetch(request);

  const data = (await response.json()) as ViduTaskResponse & { error?: string };

  if (!response.ok) {
    throw new ViduError(
      data?.error ?? `Request failed with status ${response.status}`,
      'server_error'
    );
  }

  return data.task_id;
}

export async function getTaskStatus(taskId: string): Promise<ViduTaskStatus> {
  const request = createRequest(`/ent/v2/tasks/${taskId}/creations`, 'GET');
  const response = await fetch(request);

  if (response.status === 404) {
    throw new ViduError('Task not found or was deleted', 'task_not_found');
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({})) as { error?: string };
    throw new ViduError(
      errBody?.error ?? `Request failed with status ${response.status}`,
      'server_error'
    );
  }

  return (await response.json()) as ViduTaskStatus;
}

export async function pollTaskUntilComplete(
  taskId: string,
  options: {
    pollIntervalMs?: number;
    timeoutMs?: number;
    progressHandler?: (progress: number | null) => void;
  } = {}
): Promise<ViduTaskStatus> {
  const {
    pollIntervalMs = 3000,
    timeoutMs = 300_000,
    progressHandler,
  } = options;

  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const status = await getTaskStatus(taskId);

    const progress: number | null =
      status.state === 'created' || status.state === 'queueing'
        ? 0.1
        : status.state === 'processing'
          ? 0.5
          : status.state === 'success'
            ? 1
            : status.state === 'failed'
              ? null
              : 0.1;
    progressHandler?.(progress);

    switch (status.state) {
      case 'success':
        if (!status.creations?.length) {
          throw new ViduError('Invalid response: no creations', 'invalid_response');
        }
        return status;
      case 'failed':
        throw new ViduError(
          status.err_code ?? 'Task failed without specific reason',
          'task_failed'
        );
      default:
        break;
    }

    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  throw new ViduError('Request timed out', 'timeout');
}
