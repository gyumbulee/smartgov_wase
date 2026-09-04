<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Content\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnnouncementController extends Controller
{
    public function index()
    {
        return AnnouncementResource::collection(Announcement::orderByDesc('created_at')->get());
    }

    public function store(StoreAnnouncementRequest $request)
    {
        $announcement = Announcement::create([
            ...$request->validated(),
            'slug' => $request->input('slug') ?: Str::slug($request->input('title')).'-'.now()->timestamp,
            'status' => $request->input('status', 'draft'),
            'published_by' => $request->user()->id,
        ]);

        return new AnnouncementResource($announcement);
    }

    public function update(StoreAnnouncementRequest $request, Announcement $announcement)
    {
        $announcement->update($request->validated());

        return new AnnouncementResource($announcement);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }
}
