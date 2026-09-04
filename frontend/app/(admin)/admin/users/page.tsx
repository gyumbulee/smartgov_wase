"use client";

import { useEffect, useState } from "react";
import { Plus, X, UserX, UserCheck, ShieldCheck, Pencil } from "lucide-react";
import { adminOversightService } from "@/services/adminOversightService";
import type { Department, Role, StaffUser } from "@/types/admin";

// No public registration path exists for admin/staff accounts anywhere
// in the platform — this page is the only place they're created.
// Staff can hold multiple simultaneous roles (e.g. service_admin +
// content_admin) — both the create form and the edit-roles modal are
// multi-select, not single-choice.
export default function AdminUsersPage() {
  const [users, setUsers] = useState<StaffUser[] | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRolesFor, setEditingRolesFor] = useState<StaffUser | null>(null);

  function refresh() {
    adminOversightService.listStaff().then(setUsers);
  }

  useEffect(() => {
    refresh();
    adminOversightService.listRoles().then(setRoles);
    adminOversightService.listDepartments().then(setDepartments);
  }, []);

  async function handleSuspend(userId: string) {
    await adminOversightService.suspendUser(userId);
    refresh();
  }

  async function handleReactivate(userId: string) {
    await adminOversightService.reactivateUser(userId);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Staff & administrators</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage admin accounts and role assignments.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New staff account
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-surface-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">
                    {user.staff ? `${user.staff.first_name} ${user.staff.last_name}` : "—"}
                  </p>
                  {user.staff?.position_title && (
                    <p className="text-xs text-ink-muted">{user.staff.position_title}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-muted">{user.email}</td>
                <td className="px-4 py-3 text-ink-muted">{user.staff?.department ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {user.roles.map((r) => (
                      <span
                        key={r.id}
                        className="flex items-center gap-1 rounded-full bg-brand-light-green px-2 py-0.5 text-xs font-medium text-brand-deep-green"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        {r.name}
                      </span>
                    ))}
                    <button
                      onClick={() => setEditingRolesFor(user)}
                      className="text-ink-muted hover:text-brand-green"
                      title="Edit roles"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.status === "active"
                        ? "bg-brand-light-green text-brand-deep-green"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {user.status === "active" ? (
                    <button
                      onClick={() => handleSuspend(user.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-red-600"
                    >
                      <UserX className="h-3.5 w-3.5" /> Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(user.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-green hover:underline"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">
                  No staff accounts yet besides your own.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateStaffModal
          roles={roles}
          departments={departments}
          onClose={() => setShowCreate(false)}
          onCreated={refresh}
        />
      )}

      {editingRolesFor && (
        <EditRolesModal
          user={editingRolesFor}
          roles={roles}
          onClose={() => setEditingRolesFor(null)}
          onSaved={() => {
            setEditingRolesFor(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function RoleCheckboxes({
  roles,
  selected,
  onToggle,
}: {
  roles: Role[];
  selected: Set<string>;
  onToggle: (roleId: string) => void;
}) {
  return (
    <div className="space-y-1.5 rounded-md border border-black/10 p-3">
      {roles.map((role) => (
        <label key={role.id} className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={selected.has(role.id)}
            onChange={() => onToggle(role.id)}
          />
          {role.name}
        </label>
      ))}
    </div>
  );
}

function CreateStaffModal({
  roles,
  departments,
  onClose,
  onCreated,
}: {
  roles: Role[];
  departments: Department[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleIds, setRoleIds] = useState<Set<string>>(new Set());
  const [departmentId, setDepartmentId] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleRole(roleId: string) {
    setRoleIds((prev) => {
      const next = new Set(prev);
      next.has(roleId) ? next.delete(roleId) : next.add(roleId);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (roleIds.size === 0) {
      setError("Select at least one role.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminOversightService.createStaff({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        position_title: positionTitle || undefined,
        department_id: departmentId || undefined,
        role_ids: Array.from(roleIds),
      });
      onCreated();
      onClose();
    } catch {
      setError("Couldn't create account. Check the email isn't already in use.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">New staff account</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              required
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temporary password (min. 8 characters)"
            required
            minLength={8}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
            placeholder="Position title (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            <option value="">No department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">Roles</label>
            <RoleCheckboxes roles={roles} selected={roleIds} onToggle={toggleRole} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditRolesModal({
  user,
  roles,
  onClose,
  onSaved,
}: {
  user: StaffUser;
  roles: Role[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [roleIds, setRoleIds] = useState<Set<string>>(new Set(user.roles.map((r) => r.id)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleRole(roleId: string) {
    setRoleIds((prev) => {
      const next = new Set(prev);
      next.has(roleId) ? next.delete(roleId) : next.add(roleId);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (roleIds.size === 0) {
      setError("A staff account must have at least one role.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminOversightService.updateRoles(user.id, Array.from(roleIds));
      onSaved();
    } catch {
      setError("Couldn't update roles.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">
            Edit roles — {user.staff ? `${user.staff.first_name} ${user.staff.last_name}` : user.email}
          </h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <RoleCheckboxes roles={roles} selected={roleIds} onToggle={toggleRole} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save roles"}
          </button>
        </form>
      </div>
    </div>
  );
}
