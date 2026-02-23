import type { ExploreVideo } from '../types/video/exploreVideo';
import type { PreviewVideo } from '../types/video/previewVideo';

export const exploreVideos: ExploreVideo[] = [
  {
    videoUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/aa11261a-a6de-4f73-8b98-8d720f387ef2.mp4",
    title: 'Feel the Time',
    subtitle: 'Explore impressive features fast and secure.',
  },
  {
    videoUrl: "https://dqv0cqkoy5oj7.cloudfront.net/user_32EcRyiEXuuaRsd6l97gBl9bCTU/e8e1a66b-b4ba-4454-8b53-acf324e8e629.mp4",
    title: "Nature's Beauty",
    subtitle: 'Immerse yourself in serene landscapes and natural wonders.',
  },
  {
    videoUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/3cf95ae2-1c86-4986-a477-220f3d33d8f9.mp4",
    title: 'Artistic Vision',
    subtitle: 'Transform everyday moments into extraordinary visual experiences.',
  },
  {
    videoUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_2vV68Ukpv101mL5Dprsk6JvfLMI/3cf95ae2-1c86-4986-a477-220f3d33d8f9.mp4",
    title: 'Creative Flow',
    subtitle: 'Unleash your creativity with artistic effects and unique compositions.',
  },
];

export const previewVideos: PreviewVideo[] = [
  ...exploreVideos,
  ...exploreVideos,
  ...exploreVideos,
].map((v) => ({ videoUrl: v.videoUrl }));

