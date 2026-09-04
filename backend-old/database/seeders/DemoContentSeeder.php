<?php

namespace Database\Seeders;

use App\Models\Government\Department;
use App\Models\Government\Ward;
use App\Models\Services\Service;
use App\Models\Services\ServiceCategory;
use App\Models\Services\ServiceWorkflow;
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

        $service = Service::firstOrCreate(
            ['service_code' => 'DEMO_BIRTH_CERTIFICATE'],
            [
                'name' => '[DEMO] Birth Certificate',
                'slug' => 'demo-birth-certificate',
                'category_id' => $category->id,
                'department_id' => $dept->id,
                'short_description' => 'Placeholder service for local development only — not a real government service.',
                'eligibility_description' => 'Demo eligibility text — replace with the real requirement once supplied by Wase LGA.',
                'fee' => 500.00,
                'currency' => 'NGN',
                'estimated_processing_minutes' => 30,
                'status' => 'active',
                'requires_identity_verification' => true,
                'requires_payment' => true,
                'sort_order' => 1,
                'published_at' => now(),
            ]
        );

        // Demo dynamic form fields — shows how the service configuration
        // engine (spec §16) drives the application form without code changes.
        if ($service->fields()->doesntExist()) {
            $service->fields()->createMany([
                [
                    'field_key' => 'child_full_name',
                    'label' => "Child's full name",
                    'field_type' => 'text',
                    'is_required' => true,
                    'sort_order' => 1,
                ],
                [
                    'field_key' => 'date_of_birth',
                    'label' => 'Date of birth',
                    'field_type' => 'date',
                    'is_required' => true,
                    'sort_order' => 2,
                ],
                [
                    'field_key' => 'place_of_birth',
                    'label' => 'Place of birth',
                    'field_type' => 'text',
                    'is_required' => true,
                    'sort_order' => 3,
                ],
            ]);
        }

        if ($service->requirements()->doesntExist()) {
            $service->requirements()->createMany([
                [
                    'name' => 'Hospital birth notification (or sworn affidavit)',
                    'requirement_type' => 'document',
                    'is_required' => true,
                    'accepted_file_types' => 'pdf,jpg,png',
                    'sort_order' => 1,
                ],
                [
                    'name' => "Parent/guardian ID",
                    'requirement_type' => 'document',
                    'is_required' => true,
                    'accepted_file_types' => 'pdf,jpg,png',
                    'sort_order' => 2,
                ],
            ]);
        }

        if ($service->workflows()->doesntExist()) {
            ServiceWorkflow::create([
                'service_id' => $service->id,
                'name' => 'Default automated workflow',
                'version' => '1',
                'definition' => [
                    'steps' => [
                        'validate_identity',
                        'validate_application',
                        'confirm_payment',
                        'queue_generation',
                        'generate_certificate',
                        'notify_citizen',
                    ],
                ],
                'is_active' => true,
            ]);
        }

        Ward::firstOrCreate(
            ['slug' => 'demo-ward-one'],
            ['name' => '[DEMO] Ward One', 'code' => 'W1', 'status' => 'active']
        );
    }
}
