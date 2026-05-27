import { useContext, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { ApiContext } from '../../contexts/apiContext';
import { supportService, SupportMessageSender, type SupportTicketWithMessages } from '../../services/supportService';
import '../../styles/SupportInbox.css';

function formatTime(iso: string) {
    try {
        const d = new Date(iso);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
}

function formatDate(iso: string) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
}

export default function SupportInbox() {
    const { api } = useContext(ApiContext)!;
    const [tickets, setTickets] = useState<SupportTicketWithMessages[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const refresh = async () => {
        try {
            const data = await supportService.getAllForAdmin(api);
            setTickets(data);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, 5000);
        return () => clearInterval(id);
    }, []);

    const selected = tickets.find((t) => t.id === selectedId) ?? null;

    useEffect(() => {
        if (selectedId) {
            supportService.getByIdForAdmin(api, selectedId).catch(() => null);
        }
    }, [selectedId, api]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selected?.messages?.length]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId || !reply.trim() || sending) return;
        const text = reply.trim();
        setReply('');
        try {
            setSending(true);
            await supportService.adminReply(api, selectedId, text);
            await refresh();
        } catch {
            toast.error('Failed to send reply');
            setReply(text);
        } finally {
            setSending(false);
        }
    };

    const unreadCount = (t: SupportTicketWithMessages) =>
        t.messages.filter((m) => m.sender === SupportMessageSender.User && !m.isRead).length;

    return (
        <div className="support-inbox">
            <aside className="support-inbox-list">
                <header>
                    <h2>Support inbox</h2>
                    <span className="support-inbox-count">{tickets.length}</span>
                </header>
                {tickets.length === 0 ? (
                    <p className="support-inbox-empty">No tickets yet.</p>
                ) : (
                    <ul>
                        {tickets.map((t) => {
                            const unread = unreadCount(t);
                            const lastMessage = t.messages[t.messages.length - 1];
                            return (
                                <li
                                    key={t.id}
                                    className={`support-inbox-item ${selectedId === t.id ? 'is-active' : ''}`}
                                    onClick={() => setSelectedId(t.id)}
                                >
                                    <div className="support-inbox-item-row">
                                        <span className="support-inbox-item-email">{t.email}</span>
                                        {unread > 0 && <span className="support-inbox-unread">{unread}</span>}
                                    </div>
                                    <span className="support-inbox-item-preview">
                                        {lastMessage ? lastMessage.text.slice(0, 60) : '(no messages)'}
                                    </span>
                                    <span className="support-inbox-item-date">{formatDate(t.createdAt)}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </aside>

            <section className="support-inbox-conversation">
                {!selected ? (
                    <div className="support-inbox-placeholder">
                        <Icon icon="mdi:message-text-outline" width={48} />
                        <p>Select a conversation to view messages</p>
                    </div>
                ) : (
                    <>
                        <header className="support-inbox-header">
                            <div>
                                <h3>{selected.email}</h3>
                                <span className="support-inbox-header-sub">{selected.subject || 'No subject'}</span>
                            </div>
                            <span className="support-inbox-header-date">Opened {formatDate(selected.createdAt)}</span>
                        </header>

                        <div className="support-inbox-messages" ref={scrollRef}>
                            {selected.messages.length === 0 ? (
                                <p className="support-inbox-empty">No messages.</p>
                            ) : (
                                selected.messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`support-inbox-msg support-inbox-msg--${m.sender === SupportMessageSender.Admin ? 'me' : 'them'}`}
                                    >
                                        {m.sender === SupportMessageSender.User && (
                                            <span className="support-inbox-msg-author">{selected.email}</span>
                                        )}
                                        <div className="support-inbox-msg-bubble">{m.text}</div>
                                        <span className="support-inbox-msg-time">{formatTime(m.createdAt)}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <form className="support-inbox-input" onSubmit={handleSendReply}>
                            <input
                                type="text"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Reply as Support team..."
                                maxLength={1000}
                            />
                            <button type="submit" disabled={!reply.trim() || sending} aria-label="Send reply">
                                <Icon icon="mdi:send" width={20} />
                            </button>
                        </form>
                    </>
                )}
            </section>
        </div>
    );
}
