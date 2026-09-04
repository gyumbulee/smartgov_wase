<?php

namespace App\Services\Certificates;

use App\Models\Certificates\NumberingSequence;
use Illuminate\Support\Facades\DB;

/**
 * Generates official-looking certificate numbers (spec §74) —
 * e.g. WLG/BC/2026/000001 — using a locked, per-document-type sequence
 * rather than exposing raw database IDs. The exact prefix format is a
 * placeholder until Wase LGA confirms the official numbering scheme;
 * change the prefix derivation below once that's known.
 */
class CertificateNumberGenerator
{
    public function generate(string $documentType, ?string $prefixHint = null): string
    {
        return DB::transaction(function () use ($documentType, $prefixHint) {
            $sequence = NumberingSequence::where('document_type', $documentType)
                ->lockForUpdate()
                ->first();

            $currentYear = (int) now()->format('Y');

            if (! $sequence) {
                $sequence = NumberingSequence::create([
                    'document_type' => $documentType,
                    'prefix' => $prefixHint ?? $this->derivePrefix($documentType),
                    'year' => $currentYear,
                    'current_number' => 0,
                    'padding' => 6,
                ]);
            }

            // Reset the running number when the year rolls over, matching
            // the WLG/BC/2026/000001 style — sequences are per year.
            if ($sequence->year !== $currentYear) {
                $sequence->update(['year' => $currentYear, 'current_number' => 0]);
            }

            $sequence->increment('current_number');
            $sequence->refresh();

            $padded = str_pad((string) $sequence->current_number, $sequence->padding, '0', STR_PAD_LEFT);

            return "{$sequence->prefix}/{$sequence->year}/{$padded}";
        });
    }

    /**
     * Placeholder prefix derivation — e.g. DEMO_BIRTH_CERTIFICATE -> WLG/DBC.
     * Replace with the LGA's actual official numbering scheme once supplied.
     */
    private function derivePrefix(string $documentType): string
    {
        $words = preg_split('/[_\s]+/', preg_replace('/^DEMO_/', '', $documentType));
        $initials = collect($words)->map(fn ($w) => strtoupper(substr($w, 0, 1)))->implode('');

        return 'WLG/'.($initials ?: 'CERT');
    }
}
