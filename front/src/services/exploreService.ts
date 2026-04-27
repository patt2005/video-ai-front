import axios from 'axios';
import type { ExploreVideo } from '../types/video/exploreVideo';

const BASE_URL = 'http://localhost:5014';

interface ExploreVideoDto {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

function mapDto(dto: ExploreVideoDto): ExploreVideo {
  return {
    videoUrl: dto.videoUrl,
    title: dto.title,
    description: dto.description,
    prompt: dto.description,
  };
}

async function getAll(): Promise<ExploreVideo[]> {
  const { data } = await axios.get<ExploreVideoDto[]>(`${BASE_URL}/api/explorevideo`);
  return data.map(mapDto);
}

export const exploreService = {
  getAll,
};
