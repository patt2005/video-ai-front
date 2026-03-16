export const ContentType = {
    Image: "Image",
    Video: "Video",
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export interface Content {
    id: number;
    type: ContentType;
    url: string | null;
}