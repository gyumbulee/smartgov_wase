<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Discover\HistoricalRecord;

/** Public history archive (spec §39) — timeline-ordered by period. */
class HistoryController extends Controller
{
    public function index()
    {
        $records = HistoricalRecord::where('status', 'published')->orderBy('period_start')->get();

        return response()->json($records);
    }

    public function show(string $slug)
    {
        $record = HistoricalRecord::where('slug', $slug)->where('status', 'published')->firstOrFail();

        return response()->json($record);
    }
}
