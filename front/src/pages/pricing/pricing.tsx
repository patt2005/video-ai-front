import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiContext } from '../../contexts/apiContext';
import { useAuth } from '../../contexts/authContext';
import { usePaddle } from '../../contexts/paddleContext';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionPlan, type Subscription } from '../../types/subscription/subscription';
import { paths } from '../../routes/paths';
import '../../styles/pricing.css';

export default function Pricing() {
    const { api } = useContext(ApiContext)!;
    const { isLoggedIn, user } = useAuth();
    const { config: paddleConfig, ready: paddleReady, openCheckout } = usePaddle();
    const navigate = useNavigate();
    const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState<SubscriptionPlan | 'cancel' | null>(null);

    useEffect(() => {
        if (!isLoggedIn) return;
        subscriptionService.getMine(api).then(setCurrentSub).catch(() => setCurrentSub(null));
    }, [api, isLoggedIn]);

    const priceIdFor = (plan: SubscriptionPlan): string | null => {
        if (!paddleConfig) return null;
        if (plan === SubscriptionPlan.Pro) return paddleConfig.priceProId || null;
        if (plan === SubscriptionPlan.Ultra) return paddleConfig.priceUltraId || null;
        return null;
    };

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        if (!isLoggedIn || !user) {
            navigate(paths.login);
            return;
        }

        if (plan === SubscriptionPlan.Starter) {
            try {
                setLoading(plan);
                const sub = await subscriptionService.subscribe(api, plan);
                setCurrentSub(sub);
                toast.success('Now on Starter plan');
            } catch {
                toast.error('Failed to subscribe');
            } finally {
                setLoading(null);
            }
            return;
        }

        const priceId = priceIdFor(plan);
        if (!priceId) {
            toast.error('Paddle price not configured for this plan');
            return;
        }
        if (!paddleReady) {
            toast.error('Checkout not ready yet, please try again');
            return;
        }

        try {
            setLoading(plan);
            await openCheckout({
                priceId,
                email: user.email,
                userId: user.id,
                handlers: {
                    onCompleted: async (paddleSubscriptionId) => {
                        try {
                            const sub = await subscriptionService.syncFromPaddle(api, paddleSubscriptionId);
                            setCurrentSub(sub);
                            toast.success(`Now on ${plan} plan`);
                        } catch {
                            toast.error('Payment succeeded but sync failed. Refresh in a moment.');
                        } finally {
                            setLoading(null);
                        }
                    },
                    onClosed: () => setLoading(null),
                },
            });
        } catch {
            toast.error('Could not open checkout');
            setLoading(null);
        }
    };

    const handleCancel = async () => {
        if (!currentSub) return;
        try {
            setLoading('cancel');
            await subscriptionService.cancelMine(api);
            const fresh = await subscriptionService.getMine(api);
            setCurrentSub(fresh);
            toast.success('Subscription cancelled');
        } catch {
            toast.error('Failed to cancel subscription');
        } finally {
            setLoading(null);
        }
    };

    const isCurrent = (plan: SubscriptionPlan) =>
        currentSub?.status === 'Active' && currentSub?.plan === plan;

    const hasPaidActive = currentSub?.status === 'Active' &&
        (currentSub.plan === SubscriptionPlan.Pro || currentSub.plan === SubscriptionPlan.Ultra);

    const ctaLabel = (plan: SubscriptionPlan, defaultLabel: string) => {
        if (isCurrent(plan)) return 'Current plan';
        if (loading === plan) return 'Opening checkout…';
        return defaultLabel;
    };

    return (
        <main className="login-page">
            <div className="login-blobs" aria-hidden="true">
                <div className="blob blob-purple" />
                <div className="blob blob-cyan" />
                <div className="blob-wash" />
            </div>
            <div className="login-container">
                <div className="pricing-wrap">
                    <header className="pricing-header">
                        <h1 className="login-title">
                            Pricing <span className="login-title-muted">for MovyAI</span>
                        </h1>
                        <p className="login-subtitle">
                            Choose a plan that fits your workflow. Upgrade or cancel anytime.
                        </p>
                        {hasPaidActive && (
                            <button
                                type="button"
                                className="pricing-cta"
                                style={{ maxWidth: 260, margin: '16px auto 0' }}
                                onClick={handleCancel}
                                disabled={loading !== null}
                            >
                                {loading === 'cancel' ? 'Cancelling…' : 'Cancel subscription'}
                            </button>
                        )}
                    </header>
                    <section className="pricing-grid">
                        <div className="pricing-card">
                            <div className="pricing-head">
                                <h3 className="pricing-name">Starter</h3>
                                <p className="pricing-desc">For trying MovyAI.</p>
                            </div>

                            <div className="pricing-price">
                                <span className="pricing-amount">$0</span>
                                <span className="pricing-period">/ month</span>
                            </div>

                            <button
                                className="pricing-cta"
                                type="button"
                                onClick={() => handleSubscribe(SubscriptionPlan.Starter)}
                                disabled={loading !== null || isCurrent(SubscriptionPlan.Starter)}
                            >
                                {isCurrent(SubscriptionPlan.Starter) ? 'Current plan' : loading === SubscriptionPlan.Starter ? 'Starting…' : 'Get started'}
                            </button>

                            <ul className="pricing-features">
                                <li>✓ 720p exports</li>
                                <li>✓ Basic edits</li>
                                <li>✓ Community support</li>
                            </ul>
                        </div>

                        <div className="pricing-card pricing-card--featured">
                            <div className="pricing-head">
                                <div className="pricing-top">
                                    <h3 className="pricing-name">Pro</h3>
                                    <span className="pricing-badge">Most popular</span>
                                </div>
                                <p className="pricing-desc">Best for creators and freelancers.</p>
                            </div>

                            <div className="pricing-price">
                                <span className="pricing-amount">$19</span>
                                <span className="pricing-period">/ month</span>
                            </div>

                            <button
                                className="pricing-cta pricing-cta--featured"
                                type="button"
                                onClick={() => handleSubscribe(SubscriptionPlan.Pro)}
                                disabled={loading !== null || isCurrent(SubscriptionPlan.Pro)}
                            >
                                {ctaLabel(SubscriptionPlan.Pro, 'Start Pro')}
                            </button>

                            <ul className="pricing-features">
                                <li>✓ 4K exports</li>
                                <li>✓ Advanced timeline tools</li>
                                <li>✓ Priority renders</li>
                                <li>✓ Email support</li>
                            </ul>
                        </div>

                        <div className="pricing-card">
                            <div className="pricing-head">
                                <h3 className="pricing-name">Ultra</h3>
                                <p className="pricing-desc">For teams and production workflows.</p>
                            </div>

                            <div className="pricing-price">
                                <span className="pricing-amount">$49</span>
                                <span className="pricing-period">/ month</span>
                            </div>

                            <button
                                className="pricing-cta"
                                type="button"
                                onClick={() => handleSubscribe(SubscriptionPlan.Ultra)}
                                disabled={loading !== null || isCurrent(SubscriptionPlan.Ultra)}
                            >
                                {ctaLabel(SubscriptionPlan.Ultra, 'Start Ultra')}
                            </button>

                            <ul className="pricing-features">
                                <li>✓ Team workspaces</li>
                                <li>✓ Shared assets</li>
                                <li>✓ Cloud collaboration</li>
                                <li>✓ Dedicated support</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
