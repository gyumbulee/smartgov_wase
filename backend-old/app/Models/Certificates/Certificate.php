<?php

namespace App\Models\Certificates;

use App\Models\Applications\Application;
use App\Models\Citizen\CitizenProfile;
use App\Models\Services\Service;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Certificate extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'certificate_number', 'application_id', 'citizen_id', 'service_id',
        'template_version_id', 'certificate_type', 'issue_date', 'status',
        'file_media_id', 'verification_code', 'qr_payload', 'generated_at',
        'revoked_at', 'revocation_reason',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'generated_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(CitizenProfile::class, 'citizen_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function templateVersion(): BelongsTo
    {
        return $this->belongsTo(CertificateTemplateVersion::class, 'template_version_id');
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(CertificateVerification::class);
    }

    /**
     * Public verification payload — minimum necessary information only (spec §21).
     * Never include NIN, file paths, or other citizen PII here.
     */
    public function toPublicVerificationArray(): array
    {
        return [
            'certificate_type' => $this->certificate_type,
            'certificate_number' => $this->certificate_number,
            'issue_date' => $this->issue_date?->toDateString(),
            'status' => $this->status,
        ];
    }
}

