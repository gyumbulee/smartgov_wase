<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            DemoContentSeeder::class,
        ]);

        // Demo super admin account — CHANGE PASSWORD before any real deployment.
        $admin = User::firstOrCreate(
            ['email' => 'admin@smartgov-wase.test'],
            ['password' => bcrypt('ChangeMe!2026'), 'status' => 'active', 'email_verified_at' => now()]
        );
        $admin->roles()->syncWithoutDetaching([Role::where('slug', 'super_admin')->first()?->id]);
    }
}
