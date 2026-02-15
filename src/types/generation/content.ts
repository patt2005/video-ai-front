export type ContentType = 'image' | 'video';

export interface Content {
    id: number;
    type: ContentType;
    url: string | null;
}