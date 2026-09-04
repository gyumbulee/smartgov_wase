<?php

namespace App\Models\Certificates;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CertificateVerification extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['certificate_id', 'verification_reference', 'verified_at', 'ip_address', 'user_agent', 'result', 'metadata', 'created_at'];

    protected function casts(): array
    {
        return ['verified_at' => 'datetime', 'metadata' => 'array', 'created_at' => 'datetime'];
    }

    public function certificate(): BelongsTo
    {
        return $this->belongsTo(Certificate::class);
    }
}
