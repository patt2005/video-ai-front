export interface UploadResult {
  url: string;
  fileId: string;
}

const MOCK_UPLOAD_DELAY_MS = 800;

const MOCK_UPLOAD_URLS = {
  image: [
    'https://deepseekimagegenerator.in/public/gallery/girl.png',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    'https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=800',
  ],
  video: [
    'https://storage.googleapis.com/files-for-apps/6.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  ],
  other: ['https://example.com/uploads/file'],
} as const;

function getMockUrl(file: File): string {
  const type = file.type;
  if (type.startsWith('image/')) {
    const urls = MOCK_UPLOAD_URLS.image;
    return urls[Math.floor(Math.random() * urls.length)];
  }
  if (type.startsWith('video/')) {
    const urls = MOCK_UPLOAD_URLS.video;
    return urls[Math.floor(Math.random() * urls.length)];
  }
  return MOCK_UPLOAD_URLS.other[0];
}

function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function uploadFile(file: File): Promise<UploadResult | null> {
  if (!file || !file.name) {
    return Promise.resolve(null);
  }

  const url = getMockUrl(file);
  const fileId = generateFileId();
  

  return new Promise((resolve) => {

    setTimeout(() => {

      resolve({ url, fileId });
    }, MOCK_UPLOAD_DELAY_MS);
  });
}

export function uploadFiles(files: File[]): Promise<(UploadResult | null)[]> {
  return Promise.all(files.map((file) => uploadFile(file)));
}

export const fileService = {
  uploadFile,
  uploadFiles,
};
