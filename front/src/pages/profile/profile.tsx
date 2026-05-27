import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { ApiContext } from '../../contexts/apiContext';
import { useAuth } from '../../contexts/authContext';
import { taskService } from '../../services/taskService';
import { subscriptionService } from '../../services/subscriptionService';
import { userService } from '../../services/userService';
import type { Task } from '../../types/generation/task';
import type { Subscription } from '../../types/subscription/subscription';
import { ContentType } from '../../types/generation/content';
import { ImageResultModal } from '../../components/modals/imageResultModal';
import { VideoResultModal } from '../../components/modals/videoResultModal';
import { paths } from '../../routes/paths';
import '../../styles/Profile.css';

const API_BASE_URL = 'http://localhost:5014';

function resolveAvatarUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
}

function formatRole(role: string) {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function formatRegisterDate(isoDate: string | undefined) {
    if (!isoDate) return null;
    try {
        const d = new Date(isoDate);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return isoDate;
    }
}

function formatTaskDate(isoDate: string) {
    try {
        const d = new Date(isoDate);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return isoDate;
    }
}

function formatTaskStatus(status: Task['status']) {
    const labels: Record<Task['status'], string> = {
        Pending: 'Pending',
        Success: 'Completed',
        Failed: 'Failed',
    };
    return labels[status];
}

export default function Profile() {
    const { api } = useContext(ApiContext)!;
    const { user, updateUser } = useAuth();
    const [preview, setPreview] = useState<{ type: ContentType; url: string } | null>(null);
    const [taskSearch, setTaskSearch] = useState<string>('');
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        taskService.getByUserId(api, user.id).then(setAllTasks).catch(() => setAllTasks([]));
        subscriptionService.getMine(api).then(setSubscription).catch(() => setSubscription(null));
    }, [api, user?.id]);

    const userTasks = useMemo(() => {
        if (!taskSearch.trim()) return allTasks;
        const term = taskSearch.trim().toLowerCase();
        return allTasks.filter((t) => t.id.toLowerCase().includes(term));
    }, [allTasks, taskSearch]);

    const stats = useMemo(() => ({
        total: allTasks.length,
        completed: allTasks.filter((t) => t.status === 'Success').length,
        pending: allTasks.filter((t) => t.status === 'Pending').length,
    }), [allTasks]);

    if (!user) {
        return null;
    }

    const displayName = user.username || user.email?.split('@')[0] || 'User';
    const displayEmail = user.email || `${user.username}@movyai.app`;
    const registerDateFormatted = formatRegisterDate(user.registerDate);
    const plan = subscription?.plan ?? 'Starter';
    const initial = displayName.charAt(0).toUpperCase();
    const avatarSrc = resolveAvatarUrl(user.avatarUrl);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image too large (max 2MB)');
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Only JPEG, PNG, WEBP allowed');
            return;
        }

        try {
            setUploadingAvatar(true);
            const updated = await userService.uploadAvatar(api, file);
            updateUser({ avatarUrl: updated.avatarUrl });
            toast.success('Avatar updated');
        } catch {
            toast.error('Upload failed');
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <div className="page-wrapper profile-wrapper">
            <h1 className="page-title profile-title">My Profile</h1>

            <div className="profile-card profile-card--hero">
                <button
                    type="button"
                    className="profile-avatar profile-avatar--clickable"
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    aria-label="Change profile photo"
                    title="Click to change photo"
                >
                    {avatarSrc ? (
                        <img src={avatarSrc} alt="" className="profile-avatar-img" />
                    ) : (
                        <span>{initial}</span>
                    )}
                    <span className="profile-avatar-overlay" aria-hidden>
                        <Icon icon={uploadingAvatar ? 'mdi:loading' : 'mdi:camera-outline'} width={26} className={uploadingAvatar ? 'profile-avatar-spinner' : ''} />
                    </span>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                />
                <div className="profile-info">
                    <h2 className="profile-name">{displayName}</h2>
                    <p className="profile-email">
                        <Icon icon="mdi:email-outline" width={16} />
                        {displayEmail}
                    </p>
                    <div className="profile-badges">
                        <span className={`profile-badge profile-badge--role-${user.role.toLowerCase()}`}>
                            {formatRole(user.role)}
                        </span>
                        <span className={`profile-badge profile-badge--plan-${plan.toLowerCase()}`}>
                            {plan}
                        </span>
                        {user.isEmailVerified ? (
                            <span className="profile-badge profile-badge--verified">
                                <Icon icon="mdi:check-circle" width={14} /> Verified
                            </span>
                        ) : (
                            <Link to={paths.verifyEmail} className="profile-badge profile-badge--unverified profile-badge--clickable" title="Click to verify your email">
                                <Icon icon="mdi:alert-circle-outline" width={14} /> Unverified
                            </Link>
                        )}
                    </div>
                    {registerDateFormatted && (
                        <p className="profile-register-date">
                            <Icon icon="mdi:calendar-outline" width={14} />
                            Member since {registerDateFormatted}
                        </p>
                    )}
                </div>
            </div>

            <div className="profile-stats">
                <div className="profile-stat">
                    <span className="profile-stat-value">{stats.total}</span>
                    <span className="profile-stat-label">Total tasks</span>
                </div>
                <div className="profile-stat">
                    <span className="profile-stat-value profile-stat-value--success">{stats.completed}</span>
                    <span className="profile-stat-label">Completed</span>
                </div>
                <div className="profile-stat">
                    <span className="profile-stat-value profile-stat-value--pending">{stats.pending}</span>
                    <span className="profile-stat-label">Pending</span>
                </div>
            </div>

            <section className="profile-tasks-section">
                <div className="profile-tasks-header">
                    <h2 className="profile-tasks-title">My tasks</h2>
                    <input
                        type="text"
                        className="profile-tasks-search"
                        placeholder="Filter by task ID..."
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        aria-label="Filter tasks by ID"
                    />
                </div>
                {userTasks.length === 0 ? (
                    <p className="profile-tasks-empty">You have no tasks yet.</p>
                ) : (
                    <ul className="profile-tasks-list">
                        {userTasks.map((task) => {
                            const content = task.content ?? null;
                            const canOpen = !!content?.url && (content.contentType === ContentType.Image || content.contentType === ContentType.Video);
                            return (
                                <li key={task.id} className="profile-task-item">
                                    <div className="profile-task-main">
                                        <span className="profile-task-id">#{task.id.slice(0, 8)}</span>
                                        <span className="profile-task-date">{formatTaskDate(task.creationDate)}</span>
                                        <span className={`profile-task-status profile-task-status--${task.status.toLowerCase()}`}>
                                            {formatTaskStatus(task.status)}
                                        </span>
                                    </div>
                                    {canOpen ? (
                                        <button
                                            type="button"
                                            className="profile-task-open-btn"
                                            onClick={() => setPreview({ type: content!.contentType, url: content!.url! })}
                                        >
                                            <Icon icon="mdi:open-in-new" width={18} />
                                            View
                                        </button>
                                    ) : (
                                        <span className="profile-task-no-content">—</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <ImageResultModal
                open={preview?.type === ContentType.Image}
                onOpenChange={(open) => { if (!open) setPreview(null); }}
                imageSrc={preview?.type === ContentType.Image ? preview.url : null}
            />
            <VideoResultModal
                open={preview?.type === ContentType.Video}
                onOpenChange={(open) => { if (!open) setPreview(null); }}
                videoUrl={preview?.type === ContentType.Video ? preview.url : null}
            />
        </div>
    );
}
