import { useContext, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { ApiContext } from '../../contexts/apiContext';
import { useAuth } from '../../contexts/authContext';
import { taskService } from '../../services/taskService';
import type { Task } from '../../types/generation/task';
import { ContentType } from '../../types/generation/content';
import { ImageResultModal } from '../../components/modals/imageResultModal';
import { VideoResultModal } from '../../components/modals/videoResultModal';
import '../../styles/Profile.css';

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
    const { user } = useAuth();
    const [preview, setPreview] = useState<{ type: ContentType; url: string } | null>(null);
    const [taskSearch, setTaskSearch] = useState<string>('');
    const [allTasks, setAllTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (!user?.id) return;
        taskService.getByUserId(api, user.id).then(setAllTasks).catch(() => setAllTasks([]));
    }, [api, user?.id]);

    const userTasks = useMemo(() => {
        if (!taskSearch.trim()) return allTasks;
        const term = taskSearch.trim().toLowerCase();
        return allTasks.filter((t) => t.id.toLowerCase().includes(term));
    }, [allTasks, taskSearch]);

    if (!user) {
        return null;
    }

    const displayEmail = user.email || `${user.username}@movyai.app`;
    const registerDateFormatted = formatRegisterDate(user.registerDate);

    return (
        <div className="page-wrapper profile-wrapper">
            <h1 className="page-title profile-title">My Profile</h1>
            <div className="profile-card">
                <div className="profile-content">
                    <Icon icon="solar:user-circle-bold" width="80" color="#8b5cf6" />
                    <div>
                        <h2 className="profile-name">{user.username}</h2>
                        <p className="profile-email">{displayEmail}</p>
                        <span className="profile-role">Role: {formatRole(user.role)}</span>
                        {registerDateFormatted && (
                            <p className="profile-register-date">
                                Member since: {registerDateFormatted}
                            </p>
                        )}
                    </div>
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
