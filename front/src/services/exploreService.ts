import axios from 'axios';
import type { ExploreVideo } from '../types/video/exploreVideo';

const BASE_URL = 'https://video-ai-front-production.up.railway.app';

interface ExploreVideoDto {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  prompt: string | null;
  model: string | null;
  contentType: 'video' | 'image';
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
}

function mapDto(dto: ExploreVideoDto): ExploreVideo {
  return {
    videoUrl: dto.videoUrl,
    title: dto.title || dto.prompt || '',
    description: dto.description || '',
    prompt: dto.prompt || dto.description,
    model: dto.model ?? undefined,
    contentType: dto.contentType ?? 'video',
    userId: dto.userId ?? undefined,
    userName: dto.userName ?? undefined,
    userEmail: dto.userEmail ?? undefined,
    userAvatar: dto.userAvatar ?? undefined,
  };
}

async function getAll(): Promise<ExploreVideo[]> {
  const { data } = await axios.get<ExploreVideoDto[]>(`${BASE_URL}/api/explorevideo`);
  return data.map(mapDto);
}

export const exploreService = {
  getAll,
};
