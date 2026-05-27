import {Fragment, useMemo, useState, useEffect, useContext} from 'react';
import {ApiContext} from "../../contexts/apiContext.tsx";
import {Icon} from '@iconify/react';
import {toast} from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import '../../styles/Admin.css';
import {userService} from '../../services/userService';
import {taskService} from '../../services/taskService';
import {TaskStatus} from '../../types/generation/task';
import {UserRole, type User} from "../../types/user/user.ts";
import {subscriptionService} from '../../services/subscriptionService';
import {type Subscription, SubscriptionPlan, SubscriptionStatus} from '../../types/subscription/subscription';
import type {Task} from '../../types/generation/task';

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

function formatTaskStatus(status: TaskStatus) : string {
    switch (status) {
        case TaskStatus.Pending: {
            return "Pending";
        }
        case TaskStatus.Success: {
            return "Success";
        }
        case TaskStatus.Failed: {
            return "Failed";
        }
    }
}

export default function Admin() {
    const { api } = useContext(ApiContext)!;
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const [filterId, setFilterId] = useState('');
    const [filterUsername, setFilterUsername] = useState('');
    const [filterEmail, setFilterEmail] = useState('');
    const [filterRegisterDate, setFilterRegisterDate] = useState('');
    const [filterRole, setFilterRole] = useState<string>('');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

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

    const users = useMemo(() => {
        let list: User[] = allUsers;
        if (userSearch.trim() !== '') {
            const searchTerm = userSearch.trim().toLowerCase();
            list = list.filter((u) =>
                u.id.toLowerCase().includes(searchTerm) ||
                u.username?.toLowerCase().includes(searchTerm) ||
                (u.email ?? '').toLowerCase().includes(searchTerm)
            );
        }

        const idTerm = filterId.trim().toLowerCase();
        if (idTerm) {
            list = list.filter((u) => u.id.toLowerCase().includes(idTerm));
        }
        const usernameTerm = filterUsername.trim().toLowerCase();
        if (usernameTerm) {
            list = list.filter((u) => u.username?.toLowerCase().includes(usernameTerm));
        }
        const emailTerm = filterEmail.trim().toLowerCase();
        if (emailTerm) {
            list = list.filter((u) => (u.email ?? '').toLowerCase().includes(emailTerm));
        }
        const dateTerm = filterRegisterDate.trim().toLowerCase();
        if (dateTerm) {
            list = list.filter((u) => {
                const formatted = formatRegisterDate(u.registerDate).toLowerCase();
                return formatted.includes(dateTerm) || (u.registerDate ?? '').toLowerCase().includes(dateTerm);
            });
        }
        if (filterRole) {
            list = list.filter((u) => u.role === filterRole);
        }
        return list;
    }, [allUsers, userSearch, filterId, filterUsername, filterEmail, filterRegisterDate, filterRole]);

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

    return (
        <div className="page-wrapper admin-wrapper">
            <h1 className="page-title admin-title">Control Panel (Admin)</h1>
            <div className="admin-search-wrap">
                <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Filter by ID, username or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    aria-label="Filter users"
                />
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th className="admin-table-col-expand" />
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Register date</th>
                            <th>Role</th>
                            <th>Plan</th>
                            <th>Actions</th>
                        </tr>
                        <tr className="admin-table-filter-row">
                            <th className="admin-table-col-expand" />
                            <th>
                                <input
                                    type="text"
                                    className="admin-table-filter-input"
                                    placeholder="Filter..."
                                    value={filterId}
                                    onChange={(e) => setFilterId(e.target.value)}
                                    aria-label="Filter by ID"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    className="admin-table-filter-input"
                                    placeholder="Filter..."
                                    value={filterUsername}
                                    onChange={(e) => setFilterUsername(e.target.value)}
                                    aria-label="Filter by username"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    className="admin-table-filter-input"
                                    placeholder="Filter..."
                                    value={filterEmail}
                                    onChange={(e) => setFilterEmail(e.target.value)}
                                    aria-label="Filter by email"
                                />
                            </th>
                            <th>
                                <input
                                    type="text"
                                    className="admin-table-filter-input"
                                    placeholder="Filter..."
                                    value={filterRegisterDate}
                                    onChange={(e) => setFilterRegisterDate(e.target.value)}
                                    aria-label="Filter by register date"
                                />
                            </th>
                            <th>
                                <select
                                    className="admin-table-filter-select"
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    aria-label="Filter by role"
                                >
                                    <option value="">All</option>
                                    <option value={UserRole.Admin}>Admin</option>
                                    <option value={UserRole.User}>User</option>
                                </select>
                            </th>
                            <th />
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const tasks = tasksByUserId[user.id] ?? [];
                            const isExpanded = expandedUserId === user.id;
                            const isLoading = loadingTasksFor === user.id;
                            return (
                                <Fragment key={user.id}>
                                    <tr
                                        className={`admin-user-row ${isExpanded ? 'admin-user-row--expanded' : ''}`}
                                    >
                                        <td className="admin-table-col-expand">
                                            <button
                                                type="button"
                                                className="admin-expand-btn"
                                                onClick={() => toggleExpand(user.id)}
                                                aria-expanded={isExpanded}
                                                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                                title={tasks.length === 0 ? 'No tasks' : `${tasks.length} task(s)`}
                                            >
                                                <Icon
                                                    icon="mdi:chevron-down"
                                                    width={20}
                                                    className={`admin-expand-icon ${isExpanded ? 'admin-expand-icon--open' : ''}`}
                                                />
                                            </button>
                                        </td>
                                        <td>{user.id}</td>
                                        <td>
                                            <span className="admin-username">{user.username}</span>
                                            {user.isBlocked && (
                                                <span className="admin-status-badge admin-status-badge--blocked">Blocked</span>
                                            )}
                                        </td>
                                        <td>{user.email ?? '—'}</td>
                                        <td>{formatRegisterDate(user.registerDate)}</td>
                                        <td>
                                            <select
                                                className={`admin-role-select ${user.role === UserRole.Admin ? 'role-admin' : 'role-user'}`}
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                aria-label={`Change role for ${user.username}`}
                                            >
                                                <option value={UserRole.Admin}>Admin</option>
                                                <option value={UserRole.User}>User</option>
                                            </select>
                                        </td>
                                        <td>
                                            {(() => {
                                                const sub = subscriptionByUserId[user.id];
                                                const currentPlan = sub?.plan ?? SubscriptionPlan.Starter;
                                                return (
                                                    <select
                                                        className={`admin-plan-select admin-plan-select--${currentPlan.toLowerCase()}`}
                                                        value={currentPlan}
                                                        onChange={(e) => handlePlanChange(user, e.target.value as SubscriptionPlan)}
                                                        aria-label={`Change plan for ${user.username}`}
                                                    >
                                                        <option value={SubscriptionPlan.Starter}>Starter</option>
                                                        <option value={SubscriptionPlan.Pro}>Pro</option>
                                                        <option value={SubscriptionPlan.Studio}>Studio</option>
                                                    </select>
                                                );
                                            })()}
                                        </td>
                                        <td className="admin-actions-cell">
                                            <button
                                                type="button"
                                                onClick={() => toggleBlock(user)}
                                                className={`admin-block-btn ${user.isBlocked ? 'admin-block-btn--unblock' : ''}`}
                                            >
                                                {user.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUserToDelete(user)}
                                                className="admin-delete-btn"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="admin-tasks-row">
                                            <td colSpan={8} className="admin-tasks-cell">
                                                <div className="admin-tasks-dropdown">
                                                    <h4 className="admin-tasks-dropdown-title">
                                                        Tasks {isLoading ? '(loading…)' : `(${tasks.length})`}
                                                    </h4>
                                                    {isLoading ? (
                                                        <p className="admin-tasks-empty">Loading tasks…</p>
                                                    ) : tasks.length === 0 ? (
                                                        <p className="admin-tasks-empty">No tasks for this user.</p>
                                                    ) : (
                                                        <table className="admin-tasks-table">
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
                                                                        <td className={`admin-task-status admin-task-status--${task.status.toLowerCase()}`}>
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
                    </tbody>
                </table>
            </div>

            <Dialog.Root open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="admin-modal-overlay" />
                    <Dialog.Content className="admin-modal-content">
                        <Dialog.Title className="admin-modal-title">Delete user?</Dialog.Title>
                        <Dialog.Description className="admin-modal-desc">
                            This will permanently delete <strong>{userToDelete?.username}</strong>. This action cannot be undone.
                        </Dialog.Description>
                        <div className="admin-modal-actions">
                            <button onClick={() => setUserToDelete(null)} className="admin-modal-cancel">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="admin-modal-delete">
                                Delete
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
