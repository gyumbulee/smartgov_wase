<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RolePermissionSeeder extends Seeder
{
    /**
     * Roles per spec §28. Permissions per spec §29 — granular, not
     * all-or-nothing. finance_admin does NOT get template permissions;
     * content_admin does NOT get payment permissions; auditor is read-only.
     */
    public function run(): void
    {
        $permissions = [
            'users.view', 'users.manage',
            'citizens.view', 'citizens.manage',
            'applications.view', 'applications.manage',
            'services.view', 'services.manage',
            'payments.view', 'payments.manage',
            'certificates.view', 'certificates.manage',
            'templates.view', 'templates.manage',
            'news.publish',
            'projects.manage',
            'content.manage',
            'complaints.manage',
            'audit.view',
            'settings.manage',
        ];

        $permissionModels = collect($permissions)->mapWithKeys(function ($slug) {
            $permission = Permission::firstOrCreate(
                ['slug' => $slug],
                ['name' => Str::headline(str_replace('.', ' ', $slug))]
            );
            return [$slug => $permission];
        });

        $roles = [
            'citizen' => [],
            'super_admin' => $permissions,
            'lga_admin' => $permissions,
            'service_admin' => ['services.view', 'services.manage', 'applications.view'],
            'certificate_admin' => ['certificates.view', 'certificates.manage', 'templates.view', 'templates.manage'],
            'finance_admin' => ['payments.view', 'payments.manage'],
            'content_admin' => ['content.manage', 'news.publish'],
            'project_admin' => ['projects.manage'],
            'auditor' => ['audit.view', 'users.view', 'citizens.view', 'applications.view', 'payments.view', 'certificates.view'],
        ];

        foreach ($roles as $slug => $rolePermissions) {
            $role = Role::firstOrCreate(
                ['slug' => $slug],
                ['name' => Str::headline(str_replace('_', ' ', $slug))]
            );

            $ids = collect($rolePermissions)->map(fn ($slug) => $permissionModels[$slug]->id)->all();
            $role->permissions()->sync($ids);
        }
    }
}
