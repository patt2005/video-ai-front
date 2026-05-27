import { useContext, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { ApiContext } from '../contexts/apiContext';
import { useAuth } from '../contexts/authContext';
import { supportService, SupportMessageSender, type SupportTicketWithMessages } from '../services/supportService';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionPlan, SubscriptionStatus } from '../types/subscription/subscription';
import '../styles/SupportFab.css';

type PlanLabel = 'Pro' | 'Ultra' | null;

export default function SupportFab() {
    const { api } = useContext(ApiContext)!;
    const { user, isLoggedIn } = useAuth();
    const [open, setOpen] = useState(false);
    const [planLabel, setPlanLabel] = useState<PlanLabel>(null);

    // Pro form state
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Ultra chat state
    const [conversation, setConversation] = useState<SupportTicketWithMessages | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isLoggedIn) { setPlanLabel(null); return; }
        subscriptionService.getMine(api)
            .then((sub) => {
                if (!sub || sub.status !== SubscriptionStatus.Active) { setPlanLabel(null); return; }
                if (sub.plan === SubscriptionPlan.Pro) setPlanLabel('Pro');
                else if (sub.plan === SubscriptionPlan.Ultra) setPlanLabel('Ultra');
                else setPlanLabel(null);
            })
            .catch(() => setPlanLabel(null));
    }, [api, isLoggedIn, user?.id]);

    useEffect(() => {
        if (open && user?.email && !email) setEmail(user.email);
    }, [open, user?.email, email]);

    useEffect(() => {
        if (!open || planLabel !== 'Ultra') return;
        let cancelled = false;
        const load = async () => {
            try {
                const data = await supportService.getMyConversation(api);
                if (!cancelled) setConversation(data);
            } catch {
                if (!cancelled) setConversation(null);
            }
        };
        load();
        const id = setInterval(load, 3000);
        return () => { cancelled = true; clearInterval(id); };
    }, [open, planLabel, api]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversation?.messages?.length]);

    if (!isLoggedIn || !planLabel) return null;

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !message.trim()) {
            toast.error('Email and message are required');
            return;
        }
        try {
            setSubmitting(true);
            await supportService.createTicket(api, {
                email: email.trim(),
                subject: subject.trim() || 'Support request',
                message: message.trim(),
            });
            toast.success('You will get an email in 1-2 business days.');
            setSubject('');
            setMessage('');
            setOpen(false);
        } catch (err) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 403) toast.error('Support is only for Pro and Ultra subscribers.');
            else toast.error('Failed to send support request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || sending) return;
        const text = chatInput.trim();
        setChatInput('');
        try {
            setSending(true);
            const msg = await supportService.sendMyMessage(api, text);
            setConversation((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
        } catch {
            toast.error('Failed to send message');
            setChatInput(text);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button
                    type="button"
                    className="support-fab"
                    aria-label={planLabel === 'Ultra' ? 'Live chat support' : 'Contact support'}
                    title={planLabel === 'Ultra' ? 'Live chat with our team' : 'Contact support'}
                >
                    <Icon icon={planLabel === 'Ultra' ? 'mdi:message-text' : 'mdi:headset'} width={24} />
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="support-modal-overlay" />
                <Dialog.Content className={`support-modal-content ${planLabel === 'Ultra' ? 'support-modal-content--chat' : ''}`}>
                    <Dialog.Title className="support-modal-title">
                        {planLabel === 'Ultra' ? 'Live support chat' : 'Contact support'}
                    </Dialog.Title>
                    <Dialog.Description className="support-modal-desc">
                        {planLabel === 'Ultra'
                            ? 'Chat in real time with our team. We are usually online during business hours.'
                            : 'Tell us how we can help. You will get an email reply in 1-2 business days.'}
                    </Dialog.Description>

                    {planLabel === 'Pro' && (
                        <form className="support-form" onSubmit={handleSubmitTicket}>
                            <label className="support-field">
                                <span>Email</span>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                            </label>
                            <label className="support-field">
                                <span>Subject (optional)</span>
                                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary" maxLength={200} />
                            </label>
                            <label className="support-field">
                                <span>Message</span>
                                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue..." rows={5} required maxLength={2000} />
                            </label>
                            <div className="support-actions">
                                <button type="button" onClick={() => setOpen(false)} className="support-btn support-btn--ghost" disabled={submitting}>Cancel</button>
                                <button type="submit" className="support-btn support-btn--primary" disabled={submitting}>
                                    {submitting ? 'Sending…' : 'Send'}
                                </button>
                            </div>
                        </form>
                    )}

                    {planLabel === 'Ultra' && (
                        <div className="support-chat">
                            <div className="support-chat-messages" ref={scrollRef}>
                                {!conversation || conversation.messages.length === 0 ? (
                                    <p className="support-chat-empty">No messages yet. Say hi to start a conversation.</p>
                                ) : (
                                    conversation.messages.map((m) => (
                                        <div
                                            key={m.id}
                                            className={`support-chat-msg support-chat-msg--${m.sender === SupportMessageSender.User ? 'me' : 'them'}`}
                                        >
                                            {m.sender === SupportMessageSender.Admin && (
                                                <span className="support-chat-msg-author">Support team</span>
                                            )}
                                            <div className="support-chat-msg-bubble">{m.text}</div>
                                            <span className="support-chat-msg-time">{formatTime(m.createdAt)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form className="support-chat-input" onSubmit={handleSendChat}>
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type a message..."
                                    maxLength={1000}
                                    autoFocus
                                />
                                <button type="submit" disabled={!chatInput.trim() || sending} aria-label="Send">
                                    <Icon icon="mdi:send" width={20} />
                                </button>
                            </form>
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
