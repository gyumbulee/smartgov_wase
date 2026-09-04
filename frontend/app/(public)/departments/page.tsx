"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { publicContentService } from "@/services/contentService";

interface PublicDepartment {
  id: string;
  name: string;
  short_name: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<PublicDepartment[] | null>(null);

  useEffect(() => {
    publicContentService.departments().then((data) => setDepartments(data as PublicDepartment[]));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Government departments</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">Departments of Wase Local Government.</p>

      {departments?.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-black/10 bg-white py-16 text-center">
          <Building2 className="h-8 w-8 text-ink-muted" />
          <p className="mt-3 text-sm font-medium text-ink">No departments published yet</p>
        </div>
      )}

      {departments && departments.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div key={dept.id} className="card">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light-green text-brand-green">
                <Building2 className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">{dept.name}</p>
              {dept.description && <p className="mt-1 text-xs text-ink-muted line-clamp-3">{dept.description}</p>}
              {(dept.email || dept.phone) && (
                <p className="mt-2 text-xs text-ink-muted">{dept.email ?? dept.phone}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
