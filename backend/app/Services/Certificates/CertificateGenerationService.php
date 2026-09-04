<?php

namespace App\Services\Certificates;

use App\Models\Applications\Application;
use App\Models\Certificates\Certificate;
use App\Models\Certificates\CertificateTemplate;
use App\Models\Media\Media;
use App\Models\System\Notification;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use setasign\Fpdi\Tcpdf\Fpdi;

/**
 * Populates the government's own official PDF template rather than
 * recreating the certificate from HTML (spec §16/§56: "Do not
 * unnecessarily redesign the government's official documents").
 * Uses FPDI to import the uploaded template's page as-is, then
 * overlays text/QR at the coordinates an admin configured via
 * certificate_template_fields.
 *
 * Throws TemplateNotConfiguredException when a service has no active
 * template — callers (GenerateCertificateJob) are expected to route
 * that into the exception queue (spec §69) rather than crash the whole
 * request.
 */
class CertificateGenerationService
{
    public function __construct(
        private readonly CertificateNumberGenerator $numberGenerator,
        private readonly TemplateFieldMapper $fieldMapper,
    ) {
    }

    public function generate(Application $application): Certificate
    {
        if ($application->certificate) {
            return $application->certificate; // already generated — idempotent
        }

        $template = CertificateTemplate::where('service_id', $application->service_id)
            ->where('status', 'active')
            ->first();

        $templateVersion = $template?->activeVersion();

        if (! $template || ! $templateVersion || ! $templateVersion->file_media_id) {
            throw new TemplateNotConfiguredException(
                "No active certificate template is configured for service \"{$application->service->name}\"."
            );
        }

        return DB::transaction(function () use ($application, $template, $templateVersion) {
            $certificateNumber = $this->numberGenerator->generate($template->code);
            $verificationCode = Str::upper(Str::random(4).'-'.Str::random(4).'-'.Str::random(4));
            $verificationUrl = rtrim(config('payment.frontend_url'), '/')."/verify-certificate?code={$verificationCode}";

            $certificate = Certificate::create([
                'certificate_number' => $certificateNumber,
                'application_id' => $application->id,
                'citizen_id' => $application->citizen_id,
                'service_id' => $application->service_id,
                'template_version_id' => $templateVersion->id,
                'certificate_type' => $template->document_type ?? $template->name,
                'issue_date' => now()->toDateString(),
                'status' => 'active',
                'verification_code' => $verificationCode,
                'qr_payload' => $verificationUrl,
                'generated_at' => now(),
            ]);

            $pdfPath = $this->renderPdf($application, $certificate, $templateVersion, $verificationUrl);

            $media = Media::create([
                'disk' => 'local',
                'path' => $pdfPath,
                'filename' => basename($pdfPath),
                'original_filename' => "{$certificateNumber}.pdf",
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'size' => Storage::disk('local')->size($pdfPath),
            ]);

            $certificate->update(['file_media_id' => $media->id]);

            $application->update(['status' => 'completed', 'completed_at' => now()]);
            $application->statusHistory()->create([
                'from_status' => 'processing',
                'to_status' => 'completed',
                'reason' => 'Certificate generated.',
                'created_at' => now(),
            ]);

            $this->notify($application, 'Certificate ready', 'Your certificate is now available to download.');

            return $certificate;
        });
    }

    private function renderPdf($application, Certificate $certificate, $templateVersion, string $verificationUrl): string
    {
        $templateMedia = Media::findOrFail($templateVersion->file_media_id);
        $sourcePath = Storage::disk($templateMedia->disk)->path($templateMedia->path);

        $pdf = new Fpdi();
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        $pdf->setSourceFile($sourcePath); // returns page count, not a template id
        $importedPage = $pdf->importPage(1); // this IS the template id used below
        $size = $pdf->getTemplateSize($importedPage);

        $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
        $pdf->useTemplate($importedPage);

        $qrTempPath = null;

        foreach ($templateVersion->fields as $field) {
            if ($field->field_key === 'qr_code') {
                $qrTempPath = $this->generateQrImage($verificationUrl);
                $pdf->Image(
                    $qrTempPath,
                    $field->x_position ?? 0,
                    $field->y_position ?? 0,
                    $field->width ?: 25,
                    $field->height ?: 25
                );
                continue;
            }

            $value = $this->fieldMapper->resolve($field->data_source, $application, $certificate);
            if ($value === '') {
                continue;
            }

            $pdf->SetFont($this->mapFont($field->font_family), $this->mapFontStyle($field->font_style), $field->font_size ?: 12);
            [$r, $g, $b] = $this->hexToRgb($field->color ?: '#17201B');
            $pdf->SetTextColor($r, $g, $b);
            $pdf->SetXY($field->x_position ?? 0, $field->y_position ?? 0);
            $pdf->Cell(
                $field->width ?: 100,
                $field->height ?: 8,
                $value,
                0,
                0,
                $this->mapAlignment($field->alignment)
            );
        }

        $relativePath = 'certificates/'.$application->id.'/'.$certificate->certificate_number.'-'.Str::random(6).'.pdf';
        $fullPath = Storage::disk('local')->path($relativePath);
        Storage::disk('local')->makeDirectory(dirname($relativePath));
        $pdf->Output($fullPath, 'F');

        if ($qrTempPath && file_exists($qrTempPath)) {
            @unlink($qrTempPath);
        }

        return $relativePath;
    }

    private function generateQrImage(string $data): string
    {
        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($data)
            ->size(300)
            ->margin(8)
            ->build();

        $path = tempnam(sys_get_temp_dir(), 'sgw_qr_').'.png';
        file_put_contents($path, $result->getString());

        return $path;
    }

    private function mapFont(?string $font): string
    {
        $supported = ['helvetica', 'times', 'courier'];
        $font = strtolower((string) $font);

        return in_array($font, $supported, true) ? $font : 'helvetica';
    }

    private function mapFontStyle(?string $style): string
    {
        return match (strtolower((string) $style)) {
            'bold' => 'B',
            'italic' => 'I',
            'bold-italic', 'bolditalic' => 'BI',
            default => '',
        };
    }

    private function mapAlignment(?string $alignment): string
    {
        return match (strtolower((string) $alignment)) {
            'center' => 'C',
            'right' => 'R',
            default => 'L',
        };
    }

    private function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) !== 6) {
            return [23, 32, 27]; // brand ink fallback
        }

        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2)),
        ];
    }

    private function notify(Application $application, string $title, string $message): void
    {
        $userId = $application->citizen?->user_id;
        if (! $userId) {
            return;
        }

        Notification::create([
            'user_id' => $userId,
            'type' => 'certificate',
            'title' => $title,
            'message' => $message,
            'channel' => 'database',
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }
}
