<?php

namespace App\Models\System;

use App\Models\Applications\Application;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Business-level record of async processing (spec §66) — e.g.
 * certificate generation. Distinct from Redis's own internal queue
 * bookkeeping; this is what gives admins a queryable, human-readable
 * exception queue (spec §69) without digging into Horizon/Redis directly.
 */
class ProcessingJob extends Model
{
    use HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'application_id', 'job_type', 'status', 'attempts',
        'started_at', 'completed_at', 'failed_at', 'error_message',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
