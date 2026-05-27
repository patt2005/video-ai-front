export const SubscriptionPlan = {
    Starter: 'Starter',
    Pro: 'Pro',
    Ultra: 'Ultra',
} as const;

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const SubscriptionStatus = {
    Active: 'Active',
    Cancelled: 'Cancelled',
    Expired: 'Expired',
} as const;

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export interface Subscription {
    id: string;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string | null;
    cancelledAt: string | null;
}
