import {Fragment, useMemo, useState} from 'react';
import {Icon} from '@iconify/react';
import '../../styles/Admin.css';
import {userService} from '../../services/userService';
import {taskService} from '../../services/taskService';
import {type Task, TaskStatus} from '../../types/generation/task';
import {UserRole} from "../../types/user/user.ts";

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
    const [userSearch, setUserSearch] = useState('');
    const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

    const [filterId, setFilterId] = useState('');
    const [filterUsername, setFilterUsername] = useState('');
    const [filterEmail, setFilterEmail] = useState('');
    const [filterRegisterDate, setFilterRegisterDate] = useState('');
    const [filterRole, setFilterRole] = useState<string>('');
    const [roleUpdateKey, setRoleUpdateKey] = useState(0);

    const users = useMemo(() => {
        let list = userService.getUsers(userSearch || null);
        list = list.filter((u) => !deletedIds.has(u.id));

        const idTerm = filterId.trim().toLowerCase();
        if (idTerm) {
            list = list.filter((u) => String(u.id).toLowerCase().includes(idTerm));
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
    }, [userSearch, deletedIds, filterId, filterUsername, filterEmail, filterRegisterDate, filterRole, roleUpdateKey]);

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

    const handleRoleChange = (userId: number, newRole: UserRole) => {
        userService.updateUserRole(userId, newRole);
        setRoleUpdateKey((k) => k + 1);
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
