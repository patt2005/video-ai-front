export interface ExploreVideo {
  videoUrl: string;
  title: string;
  description: string;
  prompt?: string;
  model?: string;
  contentType: 'video' | 'image';
  userId?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  aspectRatio?: string;
  duration?: string;
  fileType?: string;
}
