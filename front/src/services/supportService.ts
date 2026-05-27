import type { AxiosInstance } from 'axios';

export const SupportMessageSender = {
    User: 'User',
    Admin: 'Admin',
} as const;
export type SupportMessageSender = (typeof SupportMessageSender)[keyof typeof SupportMessageSender];

export interface SupportMessage {
    id: string;
    ticketId: string;
    sender: SupportMessageSender;
    text: string;
    createdAt: string;
    isRead: boolean;
}

export interface SupportTicketWithMessages {
    id: string;
    userId: string | null;
    email: string;
    subject: string;
    createdAt: string;
    isResolved: boolean;
    messages: SupportMessage[];
}

export interface CreateSupportTicketRequest {
    email: string;
    subject: string;
    message: string;
}

export const supportService = {
    async createTicket(api: AxiosInstance, request: CreateSupportTicketRequest): Promise<void> {
        await api.post('/api/Support', request);
    },

    async getMyConversation(api: AxiosInstance): Promise<SupportTicketWithMessages> {
        const response = await api.get<SupportTicketWithMessages>('/api/Support/me');
        return response.data;
    },

    async sendMyMessage(api: AxiosInstance, text: string): Promise<SupportMessage> {
        const response = await api.post<SupportMessage>('/api/Support/me/messages', { text });
        return response.data;
    },

    async getAllForAdmin(api: AxiosInstance): Promise<SupportTicketWithMessages[]> {
        const response = await api.get<SupportTicketWithMessages[]>('/api/Support');
        return response.data;
    },

    async getByIdForAdmin(api: AxiosInstance, id: string): Promise<SupportTicketWithMessages> {
        const response = await api.get<SupportTicketWithMessages>(`/api/Support/${id}`);
        return response.data;
    },

    async adminReply(api: AxiosInstance, ticketId: string, text: string): Promise<SupportMessage> {
        const response = await api.post<SupportMessage>(`/api/Support/${ticketId}/messages`, { text });
        return response.data;
    },
};
