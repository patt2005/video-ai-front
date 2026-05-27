import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiContext } from '../../contexts/apiContext';
import { useAuth } from '../../contexts/authContext';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionPlan, type Subscription } from '../../types/subscription/subscription';
import { paths } from '../../routes/paths';
import '../../styles/pricing.css';

export default function Pricing() {
    const { api } = useContext(ApiContext)!;
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState<SubscriptionPlan | null>(null);

    useEffect(() => {
        if (!isLoggedIn) return;
        subscriptionService.getMine(api).then(setCurrentSub).catch(() => setCurrentSub(null));
    }, [api, isLoggedIn]);

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        if (!isLoggedIn) {
            navigate(paths.login);
            return;
        }
        try {
            setLoading(plan);
            const sub = await subscriptionService.subscribe(api, plan);
            setCurrentSub(sub);
            toast.success(`Now on ${plan} plan`);
        } catch {
            toast.error('Failed to subscribe');
        } finally {
            setLoading(null);
        }
    };

    const isCurrent = (plan: SubscriptionPlan) =>
        currentSub?.status === 'Active' && currentSub?.plan === plan;

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
                                {isCurrent(SubscriptionPlan.Pro) ? 'Current plan' : loading === SubscriptionPlan.Pro ? 'Starting…' : 'Start Pro'}
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
                                <h3 className="pricing-name">Studio</h3>
                                <p className="pricing-desc">For teams and production workflows.</p>
                            </div>

                            <div className="pricing-price">
                                <span className="pricing-amount">$49</span>
                                <span className="pricing-period">/ month</span>
                            </div>

                            <button
                                className="pricing-cta"
                                type="button"
                                onClick={() => handleSubscribe(SubscriptionPlan.Studio)}
                                disabled={loading !== null || isCurrent(SubscriptionPlan.Studio)}
                            >
                                {isCurrent(SubscriptionPlan.Studio) ? 'Current plan' : loading === SubscriptionPlan.Studio ? 'Starting…' : 'Start Studio'}
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
