import { Fragment, useMemo, useState, useEffect, useContext } from 'react';
import { ApiContext } from "../../contexts/apiContext.tsx";
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import '../../styles/admin.css';
import { userService } from '../../services/userService';
import { taskService } from '../../services/taskService';
import { TaskStatus } from '../../types/generation/task';
import { UserRole, type User } from "../../types/user/user.ts";
import { subscriptionService } from '../../services/subscriptionService';
import { type Subscription, SubscriptionPlan, SubscriptionStatus } from '../../types/subscription/subscription';
import type { Task } from '../../types/generation/task';

const AVATAR_COLORS = ['ad-av-purple', 'ad-av-pink', 'ad-av-teal', 'ad-av-amber', 'ad-av-blue', 'ad-av-rose', 'ad-av-emerald'];

function getAvatarColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatRegisterDate(isoDate: string | undefined) {
    if (!isoDate) return '—';
    try {
        const d = new Date(isoDate);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
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

function formatTaskStatus(status: TaskStatus): string {
    switch (status) {
        case TaskStatus.Pending: return "Pending";
        case TaskStatus.Success: return "Success";
        case TaskStatus.Failed: return "Failed";
    }
}

export default function Admin() {
    const { api } = useContext(ApiContext)!;
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterPlan, setFilterPlan] = useState<string>('all');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [page, setPage] = useState(1);
    const perPage = 20;

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await userService.getUsers(api);
            setAllUsers(data);
        };
        const fetchSubscriptions = async () => {
            try {
                const data = await subscriptionService.getAll(api);
                setSubscriptions(data);
            } catch {
                setSubscriptions([]);
            }
        };
        fetchUsers();
        fetchSubscriptions();
    }, [api]);

    const subscriptionByUserId = useMemo(() => {
        const map: Record<string, Subscription> = {};
        subscriptions
            .filter((s) => s.status === SubscriptionStatus.Active)
            .forEach((s) => { map[s.userId] = s; });
        return map;
    }, [subscriptions]);

    const filteredUsers = useMemo(() => {
        let list = allUsers;
        if (userSearch.trim()) {
            const term = userSearch.trim().toLowerCase();
            list = list.filter((u) =>
                u.id.toLowerCase().includes(term) ||
                u.username?.toLowerCase().includes(term) ||
                (u.email ?? '').toLowerCase().includes(term)
            );
        }
        if (filterRole !== 'all') {
            list = list.filter((u) => u.role === filterRole);
        }
        if (filterPlan !== 'all') {
            list = list.filter((u) => {
                const plan = subscriptionByUserId[u.id]?.plan ?? SubscriptionPlan.Starter;
                return plan.toLowerCase() === filterPlan;
            });
        }
        return list;
    }, [allUsers, userSearch, filterRole, filterPlan, subscriptionByUserId]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / perPage));
    const pagedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

    const [tasksByUserId, setTasksByUserId] = useState<Record<string, Task[]>>({});
    const [loadingTasksFor, setLoadingTasksFor] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            const updated = await userService.updateUserRole(api, userId, newRole);
            setAllUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
            toast.success(`Role updated to ${newRole}`);
        } catch {
            toast.error('Failed to update role');
        }
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await userService.deleteUser(api, userToDelete.id);
            setAllUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
            toast.success(`Deleted ${userToDelete.username}`);
        } catch {
            toast.error('Failed to delete user');
        } finally {
            setUserToDelete(null);
        }
    };

    const handlePlanChange = async (user: User, newPlan: SubscriptionPlan) => {
        try {
            const updated = await subscriptionService.setUserPlan(api, user.id, newPlan);
            if (updated === null) {
                setSubscriptions((prev) => prev.filter((s) => s.userId !== user.id));
            } else {
                setSubscriptions((prev) => {
                    const exists = prev.some((s) => s.id === updated.id);
                    return exists ? prev.map((s) => (s.id === updated.id ? updated : s)) : [...prev, updated];
                });
            }
            toast.success(`${user.username} is now on ${newPlan}`);
        } catch {
            toast.error('Failed to change plan');
        }
    };

    const toggleBlock = async (user: User) => {
        try {
            const updated = user.isBlocked
                ? await userService.unblockUser(api, user.id)
                : await userService.blockUser(api, user.id);
            setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
            toast.success(updated.isBlocked ? `Blocked ${user.username}` : `Unblocked ${user.username}`);
        } catch {
            toast.error('Failed to update block status');
        }
    };

    const toggleExpand = async (userId: string) => {
        const opening = expandedUserId !== userId;
        setExpandedUserId(opening ? userId : null);
        if (opening && tasksByUserId[userId] === undefined) {
            try {
                setLoadingTasksFor(userId);
                const tasks = await taskService.getByUserId(api, userId);
                setTasksByUserId((prev) => ({ ...prev, [userId]: tasks }));
            } catch {
                setTasksByUserId((prev) => ({ ...prev, [userId]: [] }));
            } finally {
                setLoadingTasksFor(null);
            }
        }
    };

    const roleCounts = useMemo(() => ({
        all: allUsers.length,
        user: allUsers.filter(u => u.role === UserRole.User).length,
        admin: allUsers.filter(u => u.role === UserRole.Admin).length,
    }), [allUsers]);

    const exportCSV = () => {
        const headers = ['ID', 'Username', 'Email', 'Role', 'Plan', 'Registered', 'Blocked'];
        const rows = filteredUsers.map((u) => {
            const plan = subscriptionByUserId[u.id]?.plan ?? SubscriptionPlan.Starter;
            return [
                u.id,
                u.username ?? '',
                u.email ?? '',
                u.role,
                plan,
                formatRegisterDate(u.registerDate),
                u.isBlocked ? 'Yes' : 'No',
            ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
        });
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `movyai-users-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${filteredUsers.length} users to CSV`);
    };

    const planCounts = useMemo(() => {
        const counts: Record<string, number> = { all: allUsers.length, starter: 0, pro: 0, ultra: 0 };
        allUsers.forEach(u => {
            const plan = (subscriptionByUserId[u.id]?.plan ?? SubscriptionPlan.Starter).toLowerCase();
            if (counts[plan] !== undefined) counts[plan]++;
        });
        return counts;
    }, [allUsers, subscriptionByUserId]);

    const startNum = filteredUsers.length === 0 ? 0 : (page - 1) * perPage + 1;
    const endNum = Math.min(page * perPage, filteredUsers.length);

    return (
        <div className="ad-page">
            <div className="ad-container">

                {/* ── Page head ── */}
                <div className="ad-page-head">
                    <div className="ad-page-head-left">
                        <h1 className="ad-page-title">Users &amp; <em>permissions.</em></h1>
                        <p className="ad-page-sub">Manage accounts, roles and plans. Block abuse and keep an eye on the people building on MovyAI.</p>
                    </div>
                    <div className="ad-page-actions">
                        <button className="ad-btn" onClick={exportCSV}>
                            <Icon icon="mdi:download-outline" width={14} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="ad-stats">
                    <div className="ad-stat">
                        <div className="ad-stat-lbl">
                            <span className="ad-stat-ico"><Icon icon="mdi:account-group-outline" width={13} /></span>
                            Total users
                        </div>
                        <div className="ad-stat-num">{allUsers.length.toLocaleString()}</div>
                        <div className="ad-stat-delta up">All registered accounts</div>
                    </div>
                    <div className="ad-stat">
                        <div className="ad-stat-lbl">
                            <span className="ad-stat-ico"><Icon icon="mdi:star-outline" width={13} /></span>
                            Paid users
                        </div>
                        <div className="ad-stat-num">{(planCounts.pro + planCounts.ultra).toLocaleString()}</div>
                        <div className="ad-stat-delta up">Pro + Ultra subscribers</div>
                    </div>
                    <div className="ad-stat">
                        <div className="ad-stat-lbl">
                            <span className="ad-stat-ico"><Icon icon="mdi:shield-account-outline" width={13} /></span>
                            Admins
                        </div>
                        <div className="ad-stat-num">{roleCounts.admin}</div>
                        <div className="ad-stat-delta">With admin access</div>
                    </div>
                    <div className="ad-stat">
                        <div className="ad-stat-lbl">
                            <span className="ad-stat-ico"><Icon icon="mdi:account-cancel-outline" width={13} /></span>
                            Blocked
                        </div>
                        <div className="ad-stat-num">{allUsers.filter(u => u.isBlocked).length}</div>
                        <div className="ad-stat-delta down">Suspended accounts</div>
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <div className="ad-toolbar">
                    <div className="ad-toolbar-left">
                        <div className="ad-search">
                            <span className="ad-search-ico"><Icon icon="mdi:magnify" width={14} /></span>
                            <input
                                type="text"
                                placeholder="Filter by ID, username or email…"
                                value={userSearch}
                                onChange={(e) => { setUserSearch(e.target.value); setPage(1); }}
                                aria-label="Filter users"
                            />
                        </div>
                        <div className="ad-seg">
                            {(['all', 'user', 'admin'] as const).map((r) => (
                                <button
                                    key={r}
                                    className={`ad-seg-btn${filterRole === r ? ' active' : ''}`}
                                    onClick={() => { setFilterRole(r); setPage(1); }}
                                >
                                    {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                                    <span className="ad-seg-pill">{roleCounts[r]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="ad-toolbar-right">
                        <div className="ad-seg">
                            {(['all', 'starter', 'pro', 'ultra'] as const).map((p) => (
                                <button
                                    key={p}
                                    className={`ad-seg-btn${filterPlan === p ? ' active' : ''}`}
                                    onClick={() => { setFilterPlan(p); setPage(1); }}
                                >
                                    {p === 'all' ? 'All plans' : p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Table card ── */}
                <div className="ad-table-card">
                    <div className="ad-table-scroll">
                        <table className="ad-users">
                            <thead>
                                <tr>
                                    <th className="ad-col-expand" />
                                    <th>User</th>
                                    <th>ID</th>
                                    <th>Role</th>
                                    <th>Plan</th>
                                    <th>Registered</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedUsers.map((user) => {
                                    const tasks = tasksByUserId[user.id] ?? [];
                                    const isExpanded = expandedUserId === user.id;
                                    const isLoading = loadingTasksFor === user.id;
                                    const sub = subscriptionByUserId[user.id];
                                    const currentPlan = sub?.plan ?? SubscriptionPlan.Starter;
                                    const planLower = currentPlan.toLowerCase();
                                    const avatarLetter = (user.username ?? user.email ?? '?')[0];
                                    const avatarColor = getAvatarColor(user.id);

                                    return (
                                        <Fragment key={user.id}>
                                            <tr>
                                                {/* Expand */}
                                                <td className="ad-col-expand">
                                                    <button
                                                        type="button"
                                                        className="ad-expand-btn"
                                                        onClick={() => toggleExpand(user.id)}
                                                        aria-expanded={isExpanded}
                                                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                                    >
                                                        <Icon
                                                            icon="mdi:chevron-down"
                                                            width={16}
                                                            className={`ad-expand-icon${isExpanded ? ' ad-expand-icon--open' : ''}`}
                                                        />
                                                    </button>
                                                </td>

                                                {/* User */}
                                                <td>
                                                    <div className="ad-user-cell">
                                                        <div className={`ad-avatar ${avatarColor}`}>{avatarLetter}</div>
                                                        <div>
                                                            <div className="ad-user-name">
                                                                {user.username ?? '—'}
                                                            </div>
                                                            <div className="ad-user-email">{user.email ?? '—'}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ID */}
                                                <td className="ad-id-cell">{user.id.slice(0, 8)}…</td>

                                                {/* Role */}
                                                <td>
                                                    <select
                                                        className="ad-role-select"
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                        aria-label={`Change role for ${user.username}`}
                                                    >
                                                        <option value={UserRole.Admin}>Admin</option>
                                                        <option value={UserRole.User}>User</option>
                                                    </select>
                                                </td>

                                                {/* Plan */}
                                                <td>
                                                    <select
                                                        className={`ad-plan-select ${planLower}`}
                                                        value={currentPlan}
                                                        onChange={(e) => handlePlanChange(user, e.target.value as SubscriptionPlan)}
                                                        aria-label={`Change plan for ${user.username}`}
                                                    >
                                                        <option value={SubscriptionPlan.Starter}>Starter</option>
                                                        <option value={SubscriptionPlan.Pro}>Pro</option>
                                                        <option value={SubscriptionPlan.Ultra}>Ultra</option>
                                                    </select>
                                                </td>

                                                {/* Registered */}
                                                <td style={{ color: '#A5A1B5', fontSize: '13px' }}>
                                                    {formatRegisterDate(user.registerDate)}
                                                </td>

                                                {/* Status */}
                                                <td>
                                                    {user.isBlocked ? (
                                                        <span className="ad-status blocked">
                                                            <span className="ad-status-dot" />
                                                            Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="ad-status">
                                                            <span className="ad-status-dot" />
                                                            Active
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td>
                                                    <div className="ad-row-actions">
                                                        <button
                                                            type="button"
                                                            className={`ad-ico-btn ${user.isBlocked ? 'ok' : 'warn'}`}
                                                            title={user.isBlocked ? 'Unblock' : 'Block'}
                                                            onClick={() => toggleBlock(user)}
                                                        >
                                                            {user.isBlocked ? 'Unblock' : 'Block'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="ad-ico-btn danger"
                                                            title="Delete user"
                                                            onClick={() => setUserToDelete(user)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Tasks expand */}
                                            {isExpanded && (
                                                <tr className="ad-tasks-row">
                                                    <td colSpan={8} className="ad-tasks-cell">
                                                        <div className="ad-tasks-inner">
                                                            <div className="ad-tasks-title">
                                                                Tasks {isLoading ? '(loading…)' : `(${tasks.length})`}
                                                            </div>
                                                            {isLoading ? (
                                                                <p className="ad-tasks-empty">Loading tasks…</p>
                                                            ) : tasks.length === 0 ? (
                                                                <p className="ad-tasks-empty">No tasks for this user.</p>
                                                            ) : (
                                                                <table className="ad-tasks-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Task ID</th>
                                                                            <th>Prompt</th>
                                                                            <th>Created</th>
                                                                            <th>Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {tasks.map((task) => (
                                                                            <tr key={task.id}>
                                                                                <td>#{task.id.slice(0, 8)}</td>
                                                                                <td>{task.prompt ?? '—'}</td>
                                                                                <td>{formatTaskDate(task.creationDate)}</td>
                                                                                <td className={`ad-task-status--${task.status.toLowerCase()}`}>
                                                                                    {formatTaskStatus(task.status)}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}

                                {pagedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6A6678', fontSize: '14px' }}>
                                            No users match your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pager */}
                    <div className="ad-pager">
                        <div className="ad-pager-info">
                            Showing <strong>{startNum}–{endNum}</strong> of <strong>{filteredUsers.length.toLocaleString()}</strong>
                        </div>
                        <div className="ad-pager-btns">
                            <button className="ad-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                <Icon icon="mdi:chevron-left" width={14} />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    className={`ad-page-btn${page === p ? ' active' : ''}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                            {totalPages > 5 && <button className="ad-page-btn" disabled>…</button>}
                            <button className="ad-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                <Icon icon="mdi:chevron-right" width={14} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Delete confirmation modal */}
            <Dialog.Root open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="ad-modal-overlay" />
                    <Dialog.Content className="ad-modal-content">
                        <Dialog.Title className="ad-modal-title">Delete user?</Dialog.Title>
                        <Dialog.Description className="ad-modal-desc">
                            This will permanently delete <strong>{userToDelete?.username}</strong>. This action cannot be undone.
                        </Dialog.Description>
                        <div className="ad-modal-actions">
                            <button onClick={() => setUserToDelete(null)} className="ad-btn">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="ad-btn ad-btn-danger">
                                Delete
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
