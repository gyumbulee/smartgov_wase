<?php

namespace Database\Seeders;

use App\Models\Certificates\CertificateTemplate;
use App\Models\Certificates\CertificateTemplateVersion;
use App\Models\Government\Department;
use App\Models\Government\Ward;
use App\Models\Media\Media;
use App\Models\Services\Service;
use App\Models\Services\ServiceCategory;
use App\Models\Services\ServiceWorkflow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use TCPDF;

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

        $this->seedDemoCertificateTemplate($service);
    }

    /**
     * Generates a simple placeholder PDF (clearly watermarked as demo)
     * and wires it up as an active, field-mapped certificate template,
     * so the full pipeline — submit, pay, generate, download, verify —
     * is testable end to end without an admin manually uploading a
     * real government template first. Replace with the actual official
     * PDF via the admin template UI before any real deployment.
     */
    private function seedDemoCertificateTemplate(Service $service): void
    {
        $template = CertificateTemplate::firstOrCreate(
            ['code' => 'DEMO_BIRTH_CERTIFICATE'],
            [
                'name' => '[DEMO] Birth Certificate Template',
                'description' => 'Placeholder template for local development only — not an official document.',
                'service_id' => $service->id,
                'document_type' => 'DEMO_BIRTH_CERTIFICATE',
                'status' => 'inactive',
            ]
        );

        if ($template->versions()->exists()) {
            return; // already seeded
        }

        $pdfPath = $this->buildPlaceholderPdf();

        $media = Media::create([
            'disk' => 'local',
            'path' => $pdfPath,
            'filename' => basename($pdfPath),
            'original_filename' => 'demo-birth-certificate-template.pdf',
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'size' => Storage::disk('local')->size($pdfPath),
        ]);

        $version = CertificateTemplateVersion::create([
            'template_id' => $template->id,
            'version' => 'v1',
            'file_media_id' => $media->id,
            'status' => 'active',
            'effective_from' => now(),
        ]);

        $version->fields()->createMany([
            ['field_key' => 'full_name', 'data_source' => 'citizen.full_name', 'x_position' => 40, 'y_position' => 90, 'width' => 180, 'height' => 10, 'font_family' => 'helvetica', 'font_size' => 18, 'font_style' => 'bold', 'alignment' => 'center', 'color' => '#07552B'],
            ['field_key' => 'date_of_birth', 'data_source' => 'application.field:date_of_birth', 'x_position' => 40, 'y_position' => 110, 'width' => 180, 'height' => 8, 'font_family' => 'helvetica', 'font_size' => 12, 'alignment' => 'center', 'color' => '#17201B'],
            ['field_key' => 'place_of_birth', 'data_source' => 'application.field:place_of_birth', 'x_position' => 40, 'y_position' => 122, 'width' => 180, 'height' => 8, 'font_family' => 'helvetica', 'font_size' => 12, 'alignment' => 'center', 'color' => '#17201B'],
            ['field_key' => 'certificate_number', 'data_source' => 'certificate.number', 'x_position' => 20, 'y_position' => 260, 'width' => 100, 'height' => 6, 'font_family' => 'courier', 'font_size' => 9, 'alignment' => 'left', 'color' => '#66736B'],
            ['field_key' => 'issue_date', 'data_source' => 'certificate.issue_date', 'x_position' => 150, 'y_position' => 260, 'width' => 100, 'height' => 6, 'font_family' => 'helvetica', 'font_size' => 9, 'alignment' => 'right', 'color' => '#66736B'],
            ['field_key' => 'qr_code', 'data_source' => null, 'x_position' => 170, 'y_position' => 225, 'width' => 25, 'height' => 25],
        ]);

        $template->update(['status' => 'active']);
    }

    private function buildPlaceholderPdf(): string
    {
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();

        $pdf->SetFont('helvetica', 'B', 22);
        $pdf->SetTextColor(7, 85, 43);
        $pdf->SetXY(20, 40);
        $pdf->Cell(170, 12, 'WASE LOCAL GOVERNMENT AREA', 0, 1, 'C');

        $pdf->SetFont('helvetica', '', 14);
        $pdf->SetXY(20, 55);
        $pdf->Cell(170, 10, 'Certificate of Birth (DEMO — NOT AN OFFICIAL DOCUMENT)', 0, 1, 'C');

        $pdf->SetDrawColor(11, 122, 59);
        $pdf->Rect(15, 15, 180, 267);

        $pdf->SetFont('helvetica', 'I', 9);
        $pdf->SetTextColor(180, 180, 180);
        $pdf->SetXY(20, 150);
        $pdf->MultiCell(170, 8, 'This is a system-generated placeholder used for development and testing only. It carries no legal or official standing and must be replaced with the real Wase LGA certificate template before production use.', 0, 'C');

        $path = 'certificate-templates/demo/'.Str::random(10).'.pdf';
        Storage::disk('local')->makeDirectory(dirname($path));
        $pdf->Output(Storage::disk('local')->path($path), 'F');

        return $path;
    }
}
