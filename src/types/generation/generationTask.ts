export type ContentType = 'image' | 'video';

export interface GenerationTask {
    id: number;
    userId: number;
    creationDate: string;
    contentId: number | null;
    contentType: ContentType;
}
