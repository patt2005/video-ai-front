import axios from 'axios';

const BASE_URL = 'http://localhost:5014';

export interface UploadResult {
    url: string;
    key: string;
}

interface PrepareUploadResponse {
    url: string;
    key: string;
}

async function uploadFile(file: File): Promise<UploadResult> {
    // 1. Get pre-signed upload URL from backend
    const { data } = await axios.post<PrepareUploadResponse>(
        `${BASE_URL}/api/file/prepare-upload`,
        {
            fileName: file.name,
            contentType: file.type,
            uploadPrefix: 'uploads/',
        }
    );

    // 2. PUT the raw file directly to S3
    await fetch(data.url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
    });

    return { url: data.url, key: data.key };
}

function getPreviewUrl(key: string): string {
    return `${BASE_URL}/api/file/preview?key=${encodeURIComponent(key)}`;
}

async function uploadFiles(files: File[]): Promise<UploadResult[]> {
    return Promise.all(files.map((file) => uploadFile(file)));
}

export const fileService = {
    uploadFile,
    uploadFiles,
    getPreviewUrl,
};
