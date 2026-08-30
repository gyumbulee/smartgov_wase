<?php

namespace Database\Seeders;

use App\Models\Government\Department;
use App\Models\Government\Ward;
use App\Models\Services\Service;
use App\Models\Services\ServiceCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoContentSeeder extends Seeder
{
    /**
     * IMPORTANT: This is clearly-labeled placeholder/demo data only.
     * Do not present these as real Wase LGA government facts. Replace
     * with verified official content before production use (spec:
     * "Do not invent government data and present it as factual").
     */
    public function run(): void
    {
        $dept = Department::firstOrCreate(
            ['slug' => 'civil-registry-demo'],
            [
                'name' => '[DEMO] Civil Registry Department',
                'short_name' => 'Registry',
                'description' => 'Placeholder department for local development/testing only.',
                'status' => 'active',
                'sort_order' => 1,
            ]
        );

        $category = ServiceCategory::firstOrCreate(
            ['slug' => 'certificates-demo'],
            ['name' => '[DEMO] Certificates', 'sort_order' => 1, 'status' => 'active']
        );

        Service::firstOrCreate(
            ['service_code' => 'DEMO_BIRTH_CERTIFICATE'],
            [
                'name' => '[DEMO] Birth Certificate',
                'slug' => 'demo-birth-certificate',
                'category_id' => $category->id,
                'department_id' => $dept->id,
                'short_description' => 'Placeholder service for local development only — not a real government service.',
                'fee' => 500.00,
                'currency' => 'NGN',
                'estimated_processing_minutes' => 30,
                'status' => 'draft',
                'requires_identity_verification' => true,
                'requires_payment' => true,
                'sort_order' => 1,
            ]
        );

        Ward::firstOrCreate(
            ['slug' => 'demo-ward-one'],
            ['name' => '[DEMO] Ward One', 'code' => 'W1', 'status' => 'active']
        );
    }
}
