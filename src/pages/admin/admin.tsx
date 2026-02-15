import { useState, useMemo, Fragment } from 'react';
import { Icon } from '@iconify/react';
import '../../styles/Admin.css';
import { userService } from '../../services/userService';
import { taskService } from '../../services/taskService';
import type { Task } from '../../types/generation/task';

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

function formatTaskStatus(status: Task['status']) {
    const labels: Record<Task['status'], string> = {
        pending: 'Pending',
        success: 'Completed',
        failed: 'Failed',
    };
    return labels[status];
}

export default function Admin() {
    const [userSearch, setUserSearch] = useState('');
    const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

    const users = useMemo(() => {
        const list = userService.getUsers(userSearch || null);
        return list.filter((u) => !deletedIds.has(u.id));
    }, [userSearch, deletedIds]);

    const tasksByUserId = useMemo(() => {
        const map: Record<number, Task[]> = {};
        users.forEach((user) => {
            map[user.id] = taskService.getTasks(user.id, null);
        });
        return map;
    }, [users]);

    const handleDelete = (id: number) => {
        setDeletedIds((prev) => new Set(prev).add(id));
    };

    const toggleExpand = (userId: number) => {
        setExpandedUserId((prev) => (prev === userId ? null : userId));
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const tasks = tasksByUserId[user.id] ?? [];
                            const isExpanded = expandedUserId === user.id;
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
                                        <td>{user.username}</td>
                                        <td>{user.email ?? '—'}</td>
                                        <td>{formatRegisterDate(user.registerDate)}</td>
                                        <td className={user.role === 'admin' ? 'role-admin' : 'role-user'}>
                                            {user.role}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(user.id)}
                                                className="admin-delete-btn"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="admin-tasks-row">
                                            <td colSpan={7} className="admin-tasks-cell">
                                                <div className="admin-tasks-dropdown">
                                                    <h4 className="admin-tasks-dropdown-title">
                                                        Tasks ({tasks.length})
                                                    </h4>
                                                    {tasks.length === 0 ? (
                                                        <p className="admin-tasks-empty">No tasks for this user.</p>
                                                    ) : (
                                                        <table className="admin-tasks-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Task ID</th>
                                                                    <th>Created</th>
                                                                    <th>Status</th>
                                                                    <th>Content ID</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {tasks.map((task) => (
                                                                    <tr key={task.id}>
                                                                        <td>#{task.id}</td>
                                                                        <td>{formatTaskDate(task.creationDate)}</td>
                                                                        <td className={`admin-task-status admin-task-status--${task.status}`}>
                                                                            {formatTaskStatus(task.status)}
                                                                        </td>
                                                                        <td>{task.contentId ?? '—'}</td>
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
        </div>
    );
}
