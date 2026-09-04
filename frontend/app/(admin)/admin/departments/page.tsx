"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2, Building2 } from "lucide-react";
import { adminOversightService } from "@/services/adminOversightService";
import type { Department } from "@/types/admin";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[] | null>(null);
  const [editing, setEditing] = useState<Department | "new" | null>(null);

  function refresh() {
    adminOversightService.listDepartments().then(setDepartments);
  }

  useEffect(refresh, []);

  async function handleDelete(dept: Department) {
    if (!confirm(`Delete "${dept.name}"? This only works if no staff or services are assigned to it.`)) return;
    try {
      await adminOversightService.deleteDepartment(dept.id);
      refresh();
    } catch {
      alert("Couldn't delete this department — it likely still has staff or services assigned.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Departments</h1>
          <p className="mt-1 text-sm text-ink-muted">Government departments referenced across services and staff.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New department
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-surface-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments?.map((dept) => (
              <tr key={dept.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{dept.name}</p>
                  {dept.short_name && <p className="text-xs text-ink-muted">{dept.short_name}</p>}
                </td>
                <td className="px-4 py-3 text-ink-muted">{dept.email ?? dept.phone ?? "—"}</td>
                <td className="px-4 py-3 text-ink">{dept.staff_count ?? 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      dept.status === "active"
                        ? "bg-brand-light-green text-brand-deep-green"
                        : "bg-surface-bg text-ink-muted"
                    }`}
                  >
                    {dept.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setEditing(dept)} className="text-ink-muted hover:text-brand-green">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(dept)} className="text-ink-muted hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {departments?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-muted">
                  <Building2 className="mx-auto mb-2 h-6 w-6 text-ink-muted" />
                  No departments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <DepartmentModal
          department={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function DepartmentModal({
  department,
  onClose,
  onSaved,
}: {
  department: Department | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(department?.name ?? "");
  const [shortName, setShortName] = useState(department?.short_name ?? "");
  const [email, setEmail] = useState(department?.email ?? "");
  const [phone, setPhone] = useState(department?.phone ?? "");
  const [description, setDescription] = useState(department?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { name, short_name: shortName || null, email: email || null, phone: phone || null, description: description || null };
      if (department) {
        await adminOversightService.updateDepartment(department.id, payload);
      } else {
        await adminOversightService.createDepartment(payload);
      }
      onSaved();
    } catch {
      setError("Couldn't save this department.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{department ? "Edit department" : "New department"}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Department name"
            required
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <input
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="Short name (optional)"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save department"}
          </button>
        </form>
      </div>
    </div>
  );
}
