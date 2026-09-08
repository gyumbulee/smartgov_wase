<?php

namespace App\Models\Certificates;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

/**
 * Backs the numbering_sequences table (present since Phase 1's
 * migrations) — no model existed for it until Phase 6 needed it for
 * certificate number generation. See CertificateNumberGenerator.
 */
class NumberingSequence extends Model
{
    use HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['document_type', 'prefix', 'year', 'current_number', 'padding'];

    protected function casts(): array
    {
        return ['year' => 'integer', 'current_number' => 'integer', 'padding' => 'integer'];
    }
}
