import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { ApiContext } from '../../contexts/apiContext';
import { useAuth } from '../../contexts/authContext';
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

const CREDIT_PACKS = [
  { credits: '500',    price: '$8',   ratio: '$0.016 / credit', best: false },
  { credits: '2,000',  price: '$28',  ratio: '$0.014 / credit', best: false },
  { credits: '5,000',  price: '$60',  ratio: '$0.012 / credit', best: true  },
  { credits: '10,000', price: '$110', ratio: '$0.011 / credit', best: false },
];

const FAQ_ITEMS = [
  {
    q: "What's a credit, exactly?",
    a: "One credit buys one 1K image render. 2K costs 2 credits, 4K costs 5. A second of video costs 8 credits. Your dashboard shows the price before you generate, and unused credits roll over for 90 days.",
  },
  {
    q: 'Can I switch plans or cancel any time?',
    a: "Yes. Upgrade or downgrade instantly — we prorate the difference. Cancel any time from the billing page and you'll keep access until the end of your paid period.",
  },
  {
    q: 'Do I own what I generate?',
    a: 'On Pro and Ultra, yes — full commercial license, no watermark, no royalty. On Starter, generations are for personal and evaluation use.',
  },
  {
    q: 'What happens to leftover credits?',
    a: 'Plan credits roll over for 90 days. Top-up pack credits never expire and are spent after plan credits.',
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
  { label: 'Monthly credits',       starter: '30',    pro: '1,000',     ultra: '5,000 / seat' },
  { label: 'Max export resolution', starter: '720p',  pro: '4K',        ultra: '4K' },
  { label: 'Max video length',      starter: '4s',    pro: '12s',       ultra: '20s' },
  { label: 'Concurrent renders',    starter: '1',     pro: '4',         ultra: '8' },
  { label: 'Priority queue',        starter: '—',     pro: '✓',         ultra: '✓' },
  { section: 'Editing' },
  { label: 'Outpaint & expand',         starter: '—',     pro: '✓',         ultra: '✓' },
  { label: 'Personal model training',   starter: '—',     pro: '2 / month', ultra: 'Unlimited' },
  { label: 'Batch renders',             starter: '—',     pro: 'Up to 50',  ultra: 'Up to 200' },
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
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null);
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (!isLoggedIn) return;
    subscriptionService.getMine(api).then(setCurrentSub).catch(() => setCurrentSub(null));
  }, [api, isLoggedIn]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!isLoggedIn) { navigate(paths.login); return; }
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

  const ctaLabel = (plan: SubscriptionPlan, defaultLabel: string) => {
    if (isCurrent(plan)) return 'Current plan';
    if (loading === plan) return 'Starting…';
    return defaultLabel;
  };

  return (
    <div className="pr-page">

      {/* ── PAGE HEAD ── */}
      <div className="pr-container">
        <div className="pr-page-head">
          <div className="pr-eyebrow">
            <span className="pr-eyebrow-tag">Pricing</span>
            <span>3 free renders a day, forever</span>
          </div>
          <h1 className="pr-page-title">One price. <em>Endless ideas.</em></h1>
          <p className="pr-page-sub">
            Start free. Upgrade only when you're shipping work. Every plan includes 4K renders, commercial license, and zero watermarks.
          </p>

          {/* Billing toggle */}
          <div className="pr-billing">
            <div className={`pr-billing-switch${billing === 'annual' ? ' pr-billing-switch--annual' : ''}`}>
              <span className="pr-billing-pill" aria-hidden />
              <button
                type="button"
                className={billing === 'monthly' ? 'pr-billing-btn--active' : ''}
                onClick={() => setBilling('monthly')}
              >Monthly</button>
              <button
                type="button"
                className={billing === 'annual' ? 'pr-billing-btn--active' : ''}
                onClick={() => setBilling('annual')}
              >Annual</button>
            </div>
            <span className="pr-save-badge">SAVE 20%</span>
          </div>
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
            <button
              type="button"
              className="pr-tier-cta"
              onClick={() => handleSubscribe(SubscriptionPlan.Starter)}
              disabled={loading !== null || isCurrent(SubscriptionPlan.Starter)}
            >
              {ctaLabel(SubscriptionPlan.Starter, 'Get started')}
            </button>
            <div className="pr-tier-divider" />
            <div className="pr-tier-features-title">Includes</div>
            <ul className="pr-tier-features">
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span><b>30</b> credits / month</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>720p exports</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Image + 4s video</span></li>
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
            <button
              type="button"
              className="pr-tier-cta pr-tier-cta--primary"
              onClick={() => handleSubscribe(SubscriptionPlan.Pro)}
              disabled={loading !== null || isCurrent(SubscriptionPlan.Pro)}
            >
              {ctaLabel(SubscriptionPlan.Pro, 'Start Pro')}
              {!isCurrent(SubscriptionPlan.Pro) && loading !== SubscriptionPlan.Pro && (
                <Icon icon="mdi:arrow-right" width={12} />
              )}
            </button>
            <div className="pr-tier-divider" />
            <div className="pr-tier-features-title">Everything in Starter, plus</div>
            <ul className="pr-tier-features">
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span><b>1,000</b> credits / month</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span><b>4K</b> exports, no watermark</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Up to <b>12s</b> video clips</span></li>
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
            <button
              type="button"
              className="pr-tier-cta"
              onClick={() => handleSubscribe(SubscriptionPlan.Ultra)}
              disabled={loading !== null || isCurrent(SubscriptionPlan.Ultra)}
            >
              {ctaLabel(SubscriptionPlan.Ultra, 'Start Ultra')}
            </button>
            <div className="pr-tier-divider" />
            <div className="pr-tier-features-title">Everything in Pro, plus</div>
            <ul className="pr-tier-features">
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span><b>5,000</b> credits / seat / month</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Team workspaces &amp; roles</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Shared asset &amp; prompt library</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Client review links</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Brand kit lock-in</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>SAML SSO &amp; audit logs</span></li>
              <li><span className="pr-feat-check"><Icon icon="mdi:check" width={10} style={{ color: '#A78BFA' }} /></span><span>Dedicated support</span></li>
            </ul>
          </article>

        </div>

        {/* ── CREDIT PACKS ── */}
        <section className="pr-packs">
          <div className="pr-packs-head">
            <div>
              <div className="pr-section-tag">Top-ups</div>
              <h2 className="pr-packs-title">Need a few more <em>renders?</em></h2>
              <p className="pr-packs-sub">One-time credit packs that never expire. Stack them on any plan.</p>
            </div>
          </div>
          <div className="pr-pack-grid">
            {CREDIT_PACKS.map((pack) => (
              <button key={pack.credits} type="button" className="pr-pack">
                {pack.best && <span className="pr-pack-best">Best value</span>}
                <div className="pr-pack-credits">
                  {pack.credits}<span className="pr-pack-credits-sm">credits</span>
                </div>
                <div className="pr-pack-price"><b>{pack.price}</b></div>
                <div className="pr-pack-ratio">{pack.ratio}</div>
              </button>
            ))}
          </div>
        </section>

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
            <button type="button" className="pr-ent-btn">Read enterprise docs</button>
            <button type="button" className="pr-ent-btn pr-ent-btn--primary">
              Talk to sales
              <Icon icon="mdi:arrow-right" width={12} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
