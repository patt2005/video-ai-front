import type { ExploreVideo } from '../types/video/exploreVideo';
import type { PreviewVideo } from '../types/video/previewVideo';

export const exploreVideos: ExploreVideo[] = [
  {
    videoUrl:"https://videos.openai.com/az/files/00000000-e530-7280-816c-d49fb88f7785%2Fraw?se=2026-05-12T00%3A00%3A00Z&sp=r&sv=2026-02-06&sr=b&skoid=5e5fc900-07cf-43e7-ab5b-314c0d877bb0&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-02-09T06%3A24%3A43Z&ske=2026-02-16T06%3A29%3A43Z&sks=b&skv=2026-02-06&sig=Hxc4nzVYkhkTnOA5cgw4OgsDbGcy3hCe2foVk/c3r54%3D&ac=oaisdsorprsouthcentralus",
    title: 'Feel the Time',
    subtitle: 'Explore impressive features fast and secure.',
  },
  {
    videoUrl:"https://sora.chatgpt.com/p/s_6984b084f2848191a022906a3d0acb81" ,
    title: "Nature's Beauty",
    subtitle: 'Immerse yourself in serene landscapes and natural wonders.',
  },
  {
    videoUrl:"https://videos.openai.com/az/files/00000000-0ac4-7285-b70e-cfb805ae5400%2Fraw?se=2026-02-12T00%3A00%3A00Z&sp=r&sv=2026-02-06&sr=b&skoid=5e5fc900-07cf-43e7-ab5b-314c0d877bb0&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-02-09T06%3A25%3A46Z&ske=2026-02-16T06%3A30%3A46Z&sks=b&skv=2026-02-06&sig=gIPFhxBl3Twt/tm9XVSYzzYRJgzp110MCq7jsjm/86k%3D&ac=oaisdsorprnorthcentralus",
    title: 'Artistic Vision',
    subtitle: 'Transform everyday moments into extraordinary visual experiences.',
  },
  {
    videoUrl: "https://sora.chatgpt.com/p/s_6981c984d2a0819188ed15d0c4597d8e",
    title: 'Creative Flow',
    subtitle: 'Unleash your creativity with artistic effects and unique compositions.',
  },
  {
    videoUrl:"https://sora.chatgpt.com/p/s_6981e14fe20c8191855523d18d83ab99",
    title: 'Motion Graphics',
    subtitle: 'Dynamic animations that bring your stories to life with style.',
  },
  {
    videoUrl: "https://sora.chatgpt.com/p/s_698125c01c188191b82e279f2b9e7d50",
    title: 'Epic Moments',
    subtitle: 'Capture unforgettable scenes with cinematic quality and impact.',
  },
  {
    videoUrl: "https://sora.chatgpt.com/p/s_698084c80d0c8191b3c465f11fdef9c6",
    title: 'Lifestyle Stories',
    subtitle: 'Capture viral characters',
  },
  {
    videoUrl: "https://sora.chatgpt.com/p/s_697fda12906c8191ad9ab7b151fb60ca",
    title: 'Abstract Art',
    subtitle: 'Experiment with colors, shapes, and mesmerizing visual pattern.',
  },
];

export const previewVideos: PreviewVideo[] = [
  ...exploreVideos,
  ...exploreVideos,
  ...exploreVideos,
].map((v) => ({ videoUrl: v.videoUrl }));

