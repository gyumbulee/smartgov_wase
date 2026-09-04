<?php

namespace App\Models\Certificates;

use App\Models\Services\Service;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CertificateTemplate extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'code', 'description', 'service_id', 'document_type', 'status'];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(CertificateTemplateVersion::class, 'template_id');
    }

    public function activeVersion()
    {
        return $this->versions()->where('status', 'active')->latest('effective_from')->first();
    }
}

