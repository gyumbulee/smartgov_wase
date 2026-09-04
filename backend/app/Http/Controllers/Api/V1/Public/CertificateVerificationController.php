<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Certificates\Certificate;
use App\Models\Certificates\CertificateVerification;
use Illuminate\Http\Request;

/**
 * Public certificate verification (spec §21). Deliberately returns
 * only the minimum necessary fields — no citizen name, no NIN, no file
 * path, nothing beyond what the certificate itself would show a third
 * party. Every lookup attempt is recorded for verification statistics
 * (spec §30 / Database_Schema §30), successful or not.
 */
class CertificateVerificationController extends Controller
{
    public function verify(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $code = $request->string('code');

        $certificate = Certificate::where('verification_code', $code)
            ->orWhere('certificate_number', $code)
            ->first();

        $result = $certificate && $certificate->status === 'active' ? 'valid' : 'not_found';

        if ($certificate) {
            CertificateVerification::create([
                'certificate_id' => $certificate->id,
                'verification_reference' => $code,
                'verified_at' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'result' => $result,
                'created_at' => now(),
            ]);
        }

        if ($result !== 'valid') {
            return response()->json(['verified' => false, 'message' => 'No matching valid certificate was found.'], 404);
        }

        return response()->json([
            'verified' => true,
            'certificate' => $certificate->toPublicVerificationArray(),
        ]);
    }
}
