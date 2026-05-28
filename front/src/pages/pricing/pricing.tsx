import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { ApiContext } from '../../contexts/apiContext';
import { useAuth } from '../../contexts/authContext';
import { usePaddle } from '../../contexts/paddleContext';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionPlan, type Subscription } from '../../types/subscription/subscription';
import { paths } from '../../routes/paths';
import '../../styles/pricing.css';

type BillingCycle = 'monthly' | 'annual';

const PRICES = {
  Starter: { monthly: 0, annual: 0 },
  Pro:     { monthly: 19, annual: 15 },
  Ultra:   { monthly: 49, annual: 39 },
};

const BILLED = {
  Starter: { monthly: 'Free forever', annual: 'Free forever' },
  Pro:     { monthly: 'Billed monthly', annual: '$180 billed yearly · save $48' },
  Ultra:   { monthly: 'Per seat, billed monthly', annual: '$468/seat yearly · save $120' },
};

const FAQ_ITEMS = [
  {
    q: 'Can I switch plans or cancel any time?',
    a: "Yes. Upgrade or downgrade instantly — we prorate the difference. Cancel any time from the billing page and you'll keep access until the end of your paid period.",
  },
  {
    q: 'Do I own what I generate?',
    a: 'On Pro and Ultra, yes — full commercial license, no watermark, no royalty. On Starter, generations are for personal and evaluation use.',
  },
  {
    q: 'How are charges handled for teams?',
    a: "Ultra is billed per seat. You can add or remove seats at any time and we'll prorate the change on your next invoice. Pay by card or invoice.",
  },
  {
    q: 'Is there a discount for students or nonprofits?',
    a: 'Yes — students get 50% off Pro with a verified .edu address. Registered nonprofits get 40% off Ultra. Contact support with proof of status.',
  },
];

const COMPARE_ROWS: { section?: string; label?: string; starter?: string; pro?: string; ultra?: string }[] = [
  { section: 'Generation' },
  { label: 'Max export resolution', starter: '720p',  pro: '4K',        ultra: '4K' },
  { label: 'Priority queue',        starter: '—',     pro: '✓',         ultra: '✓' },
  { section: 'Editing' },
  { label: 'Outpaint & expand',         starter: '—',     pro: '✓',         ultra: '✓' },
  { section: 'Collaboration' },
  { label: 'Team workspaces',     starter: '—', pro: '—', ultra: '✓' },
  { label: 'Client review links', starter: '—', pro: '—', ultra: '✓' },
  { label: 'Shared prompt library', starter: '—', pro: '—', ultra: '✓' },
  { section: 'Licensing & security' },
  { label: 'Commercial license', starter: '—', pro: '✓', ultra: '✓' },
  { label: 'SAML SSO & SCIM',    starter: '—', pro: '—', ultra: '✓' },
  { label: 'Audit logs',         starter: '—', pro: '—', ultra: '✓' },
  { section: 'Support' },
  { label: 'Community',          starter: '✓', pro: '✓',  ultra: '✓' },
  { label: 'Email response time',starter: '—', pro: '48h', ultra: '4h SLA' },
  { label: 'Dedicated CSM',      starter: '—', pro: '—',  ultra: '✓' },
];

function CellValue({ val }: { val?: string }) {
  if (val === '✓') return (
    <span className="pr-check-cell">
      <Icon icon="mdi:check" width={14} style={{ color: '#A78BFA' }} />
    </span>
  );
  if (val === '—') return <span className="pr-dash-cell">—</span>;
  return <>{val}</>;
}

export default function Pricing() {
  const { api } = useContext(ApiContext)!;
  const { isLoggedIn, user } = useAuth();
  const { config: paddleConfig, ready: paddleReady, openCheckout } = usePaddle();
  const navigate = useNavigate();
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<SubscriptionPlan | 'cancel' | 'upgrade' | null>(null);
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
          onCompleted: async ({ paddleSubscriptionId, paddleCustomerId }) => {
            try {
              const sub = await subscriptionService.syncFromPaddle(api, {
                paddleSubscriptionId: paddleSubscriptionId || undefined,
                paddleCustomerId: paddleCustomerId || undefined,
              });
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

  const handleUpgradeToUltra = async () => {
    if (!currentSub || currentSub.plan !== SubscriptionPlan.Pro) return;
    if (!currentSub.paddleSubscriptionId) {
      toast.error('Your Pro plan is not linked to Paddle. Cancel and subscribe again via checkout.');
      return;
    }
    if (!window.confirm('Upgrade to Ultra now? You will be charged the prorated difference (~$30) immediately and renewed at $49/month.')) return;
    try {
      setLoading('upgrade');
      const updated = await subscriptionService.changeMyPlan(api, SubscriptionPlan.Ultra);
      setCurrentSub(updated);
      toast.success('Upgraded to Ultra');
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to upgrade';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const isCurrent = (plan: SubscriptionPlan) =>
    currentSub?.status === 'Active' && currentSub?.plan === plan;

  const hasPaidActive = currentSub?.status === 'Active' &&
    (currentSub.plan === SubscriptionPlan.Pro || currentSub.plan === SubscriptionPlan.Ultra);

  const isOnUltra = isCurrent(SubscriptionPlan.Ultra);

  const ctaLabel = (plan: SubscriptionPlan, defaultLabel: string) => {
    if (isCurrent(plan)) return 'Current plan';
    if (loading === plan) return 'Opening checkout…';
    return defaultLabel;
  };

  return (
    <div className="pr-page">

      {/* ── PAGE HEAD ── */}
      <div className="pr-container">
        <div className="pr-page-head">
          <h1 className="pr-page-title">One price. <em>Endless ideas.</em></h1>
          <p className="pr-page-sub">
            Start free. Upgrade only when you're shipping work. Every plan includes 4K renders, commercial license, and zero watermarks.
          </p>
        </div>
      </div>

      {/* ── PRICING GRID ── */}
      <div className="pr-container">
        <div className="pr-grid">

          {/* Starter */}
          <article className="pr-tier">
            <div className="pr-tier-head">
              <h2 className="pr-tier-name">Starter</h2>
            </div>
            <p className="pr-tier-desc">For trying MovyAI and exploring what's possible.</p>
            <div className="pr-tier-price">
              <span className="pr-currency">$</span>
              <span className="pr-amount">{PRICES.Starter[billing]}</span>
              <span className="pr-period">/ month</span>
            </div>
            <div className={`pr-tier-billed${billing === 'annual' && BILLED.Starter.annual.includes('save') ? ' pr-tier-billed--savings' : ''}`}>
              {BILLED.Starter[billing]}
            </div>
            {isCurrent(SubscriptionPlan.Starter) ? (
              <button
                type="button"
                className="pr-tier-cta"
                onClick={handleCancel}
                disabled={loading !== null}
              >
                {loading === 'cancel' ? 'Cancelling…' : 'Cancel Free plan'}
              </button>
            ) : isOnUltra ? (
              <button type="button" className="pr-tier-cta" disabled>
                You are already on Ultra
              </button>
            ) : (
              <button
                type="button"
                className="pr-tier-cta"
                onClick={() => handleSubscribe(SubscriptionPlan.Starter)}
                disabled={loading !== null || hasPaidActive}
                title={hasPaidActive ? `Cancel your ${currentSub?.plan} plan first` : undefined}
              >
                {hasPaidActive
                  ? `Cancel ${currentSub?.plan} plan first`
                  : loading === SubscriptionPlan.Starter
                    ? 'Starting…'
                    : 'Get started'}
              </button>
            )}
            <div className="pr-tier-divider" />
            <div className="pr-tier-features-title">Includes</div>
            <ul className="pr-tier-features">
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span><b>10</b> credits / month</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>720p exports</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Image &amp; video generation</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Basic edits &amp; presets</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span className="pr-muted">Community support</span></li>
            </ul>
          </article>

          {/* Pro (featured) */}
          <article className="pr-tier pr-tier--featured">
            <div className="pr-tier-head">
              <h2 className="pr-tier-name">Pro</h2>
              <span className="pr-tier-badge">Most popular</span>
            </div>
            <p className="pr-tier-desc">For creators and freelancers shipping work weekly.</p>
            <div className="pr-tier-price">
              <span className="pr-currency">$</span>
              <span className="pr-amount">{PRICES.Pro[billing]}</span>
              <span className="pr-period">/ month</span>
            </div>
            <div className={`pr-tier-billed${billing === 'annual' ? ' pr-tier-billed--savings' : ''}`}>
              {BILLED.Pro[billing]}
            </div>
            {isCurrent(SubscriptionPlan.Pro) ? (
              <button
                type="button"
                className="pr-tier-cta pr-tier-cta--primary"
                onClick={handleCancel}
                disabled={loading !== null}
              >
                {loading === 'cancel' ? 'Cancelling…' : 'Cancel Pro plan'}
              </button>
            ) : isOnUltra ? (
              <button type="button" className="pr-tier-cta pr-tier-cta--primary" disabled>
                You are already on Ultra
              </button>
            ) : (
              <button
                type="button"
                className="pr-tier-cta pr-tier-cta--primary"
                onClick={() => handleSubscribe(SubscriptionPlan.Pro)}
                disabled={loading !== null}
              >
                {ctaLabel(SubscriptionPlan.Pro, 'Start Pro')}
                {!isCurrent(SubscriptionPlan.Pro) && loading !== SubscriptionPlan.Pro && (
                  <Icon icon="mdi:arrow-right" width={12} />
                )}
              </button>
            )}
            <div className="pr-tier-divider" />
            <div className="pr-tier-features-title">Everything in Starter</div>
            <ul className="pr-tier-features">
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span><b>500</b> credits / month</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span><b>4K</b> exports, no watermark</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Advanced timeline + outpaint</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Priority renders (queue-skip)</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Commercial license</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Email support</span></li>
            </ul>
          </article>

          {/* Ultra */}
          <article className="pr-tier">
            <div className="pr-tier-head">
              <h2 className="pr-tier-name">Ultra</h2>
            </div>
            <p className="pr-tier-desc">For teams, agencies and production workflows.</p>
            <div className="pr-tier-price">
              <span className="pr-currency">$</span>
              <span className="pr-amount">{PRICES.Ultra[billing]}</span>
              <span className="pr-period">/ month</span>
            </div>
            <div className={`pr-tier-billed${billing === 'annual' ? ' pr-tier-billed--savings' : ''}`}>
              {BILLED.Ultra[billing]}
            </div>
            {isCurrent(SubscriptionPlan.Ultra) ? (
              <button
                type="button"
                className="pr-tier-cta"
                onClick={handleCancel}
                disabled={loading !== null}
              >
                {loading === 'cancel' ? 'Cancelling…' : 'Cancel Ultra plan'}
              </button>
            ) : isCurrent(SubscriptionPlan.Pro) ? (
              <button
                type="button"
                className="pr-tier-cta"
                onClick={handleUpgradeToUltra}
                disabled={loading !== null}
                title="Upgrade now and pay the prorated difference"
              >
                {loading === 'upgrade' ? 'Upgrading…' : 'Upgrade to Ultra (+$30)'}
              </button>
            ) : (
              <button
                type="button"
                className="pr-tier-cta"
                onClick={() => handleSubscribe(SubscriptionPlan.Ultra)}
                disabled={loading !== null}
              >
                {ctaLabel(SubscriptionPlan.Ultra, 'Start Ultra')}
              </button>
            )}
            <div className="pr-tier-divider" />
            <div className="pr-tier-features-title">Everything in Pro</div>
            <ul className="pr-tier-features">
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span><b>2,000</b> credits / month</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Team workspaces &amp; roles</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Shared asset &amp; prompt library</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Client review links</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Brand kit lock-in</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>SAML SSO &amp; audit logs</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Dedicated support</span></li>
            </ul>
          </article>

        </div>

        {/* ── COMPARISON TABLE ── */}
        <section className="pr-compare">
          <div className="pr-compare-head">
            <h2>Compare every <em>feature.</em></h2>
            <p>Hover-free, no asterisks. What you see is what you get.</p>
          </div>
          <table className="pr-compare-table">
            <colgroup>
              <col style={{ width: '38%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr>
                <th></th>
                <th>Starter</th>
                <th className="pr-pro-col">Pro</th>
                <th>Ultra</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, i) =>
                row.section ? (
                  <tr key={i} className="pr-section-row">
                    <td colSpan={4}>{row.section}</td>
                  </tr>
                ) : (
                  <tr key={i}>
                    <td>{row.label}</td>
                    <td><CellValue val={row.starter} /></td>
                    <td className="pr-pro-col"><CellValue val={row.pro} /></td>
                    <td><CellValue val={row.ultra} /></td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </section>

        {/* ── FAQ ── */}
        <section className="pr-faq">
          <div className="pr-faq-head">
            <div className="pr-section-tag">Questions</div>
            <h2>The <em>short</em> answers.</h2>
            <p>Anything we missed? Our team usually replies within a few hours.</p>
            <a href="mailto:support@movyai.com" className="pr-contact-link">Contact support →</a>
          </div>
          <div className="pr-faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={`pr-faq-item${openFaq === i ? ' pr-faq-item--open' : ''}`}>
                <button
                  type="button"
                  className="pr-faq-summary"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <span className="pr-faq-toggle">
                    <Icon icon="mdi:plus" width={14} />
                  </span>
                </button>
                {openFaq === i && (
                  <p className="pr-faq-answer">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── ENTERPRISE CTA ── */}
        <section className="pr-enterprise">
          <div>
            <h3>Need <em>custom volume</em> or on-prem?</h3>
            <p>Dedicated GPU pools, custom retention, BYO-key, and procurement-friendly billing. We'll build a plan around your workflow.</p>
          </div>
          <div className="pr-ent-actions">
            <button
              type="button"
              className="pr-ent-btn pr-ent-btn--primary"
              onClick={() => {
                if (!hasPaidActive) {
                  toast.error('Talk to sales is available on Pro and Ultra plans');
                  return;
                }
                window.dispatchEvent(new CustomEvent('movyai:open-support'));
              }}
            >
              Talk to sales
              <Icon icon="mdi:arrow-right" width={12} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
