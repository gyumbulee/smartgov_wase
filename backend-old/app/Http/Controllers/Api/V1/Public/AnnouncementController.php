<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Content\Announcement;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::query()
            ->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->orderByRaw("FIELD(priority, 'urgent', 'important', 'normal')")
            ->orderByDesc('starts_at')
            ->get();

        return response()->json($announcements);
    }
}
