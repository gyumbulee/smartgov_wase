<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHistoricalRecordRequest;
use App\Http\Resources\HistoricalRecordResource;
use App\Models\Discover\HistoricalRecord;
use Illuminate\Support\Str;

/**
 * spec §39: "Use credible sources and clearly distinguish documented
 * history from oral traditions." The `sources` field is where that
 * distinction lives — not enforced by validation (a source-free draft
 * is still allowed while researching), but present in every response
 * so the public page can render it or its absence honestly.
 */
class HistoricalRecordController extends Controller
{
    public function index()
    {
        return HistoricalRecordResource::collection(
            HistoricalRecord::orderBy('period_start')->get()
        );
    }

    public function store(StoreHistoricalRecordRequest $request)
    {
        $record = HistoricalRecord::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('title')),
            'status' => $request->input('status', 'draft'),
        ]);

        return new HistoricalRecordResource($record);
    }

    public function update(
        StoreHistoricalRecordRequest $request,
        HistoricalRecord $record
    ) {
        $record->update($request->validated());

        return new HistoricalRecordResource($record);
    }

    public function publish(HistoricalRecord $record)
    {
        $record->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return new HistoricalRecordResource($record);
    }

    public function destroy(HistoricalRecord $record)
    {
        $record->delete();

        return response()->json([
            'message' => 'Record deleted.',
        ]);
    }
}
