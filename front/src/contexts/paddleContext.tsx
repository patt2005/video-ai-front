import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import { useApi } from '../hooks/useApi';
import { subscriptionService } from '../services/subscriptionService';
import type { PaddleConfig } from '../types/subscription/subscription';

type CheckoutCompletion = {
    paddleSubscriptionId: string;
    paddleCustomerId: string;
};

type CheckoutHandlers = {
    onCompleted?: (result: CheckoutCompletion) => void;
    onClosed?: () => void;
};

type PaddleContextValue = {
    config: PaddleConfig | null;
    ready: boolean;
    openCheckout: (params: {
        priceId: string;
        email: string;
        userId: string;
        handlers?: CheckoutHandlers;
    }) => Promise<void>;
};

const PaddleContext = createContext<PaddleContextValue | null>(null);

export function PaddleProvider({ children }: { children: ReactNode }) {
    const api = useApi();
    const [config, setConfig] = useState<PaddleConfig | null>(null);
    const [paddle, setPaddle] = useState<Paddle | null>(null);
    const handlersRef = useRef<CheckoutHandlers | null>(null);

    useEffect(() => {
        let cancelled = false;
        subscriptionService.getPaddleConfig(api)
            .then((cfg) => { if (!cancelled) setConfig(cfg); })
            .catch(() => { if (!cancelled) setConfig(null); });
        return () => { cancelled = true; };
    }, [api]);

    useEffect(() => {
        if (!config?.clientToken) return;
        let cancelled = false;
        initializePaddle({
            environment: (config.environment as 'sandbox' | 'production') || 'sandbox',
            token: config.clientToken,
            eventCallback: (event) => {
                const name = event?.name;
                if (name === 'checkout.completed') {
                    const data = event?.data as Record<string, unknown> | undefined;
                    const customer = data?.customer as { id?: string } | undefined;
                    const subId = (data?.subscription_id as string | undefined) ?? '';
                    const customerId = customer?.id ?? '';
                    handlersRef.current?.onCompleted?.({
                        paddleSubscriptionId: String(subId),
                        paddleCustomerId: String(customerId),
                    });
                } else if (name === 'checkout.closed') {
                    handlersRef.current?.onClosed?.();
                }
            },
        }).then((instance) => {
            if (!cancelled && instance) setPaddle(instance);
        });
        return () => { cancelled = true; };
    }, [config?.clientToken, config?.environment]);

    const openCheckout = useCallback(async ({ priceId, email, userId, handlers }: {
        priceId: string;
        email: string;
        userId: string;
        handlers?: CheckoutHandlers;
    }) => {
        if (!paddle) throw new Error('Paddle not ready');
        if (!priceId) throw new Error('Missing price id');
        handlersRef.current = handlers ?? null;
        paddle.Checkout.open({
            items: [{ priceId, quantity: 1 }],
            customer: { email },
            customData: { userId },
            settings: {
                displayMode: 'overlay',
                theme: 'dark',
            },
        });
    }, [paddle]);

    const value = useMemo<PaddleContextValue>(() => ({
        config,
        ready: paddle !== null,
        openCheckout,
    }), [config, paddle, openCheckout]);

    return <PaddleContext.Provider value={value}>{children}</PaddleContext.Provider>;
}

export function usePaddle() {
    const ctx = useContext(PaddleContext);
    if (!ctx) throw new Error('usePaddle must be used inside PaddleProvider');
    return ctx;
}
