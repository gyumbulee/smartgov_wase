<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Discover\TouristAttraction;
use App\Models\Government\Community;
use App\Models\Government\Facility;
use App\Models\Projects\Project;

/**
 * Aggregates markers for the public interactive map (spec §48):
 * government offices, projects, tourist attractions, and public
 * facilities. Only ever returns published/active records with actual
 * coordinates set — nothing here exposes draft content or guesses at
 * a location that wasn't explicitly recorded.
 */
class MapController extends Controller
{
    public function index()
    {
        $attractions = TouristAttraction::where('status', 'published')
            ->whereNotNull('latitude')->whereNotNull('longitude')
            ->get(['id', 'name', 'slug', 'latitude', 'longitude'])
            ->map(fn ($a) => ['type' => 'attraction', 'name' => $a->name, 'slug' => $a->slug, 'lat' => (float) $a->latitude, 'lng' => (float) $a->longitude]);

        $facilities = Facility::where('status', 'active')
            ->whereNotNull('latitude')->whereNotNull('longitude')
            ->get(['id', 'name', 'type', 'latitude', 'longitude'])
            ->map(fn ($f) => ['type' => 'facility', 'facility_type' => $f->type, 'name' => $f->name, 'lat' => (float) $f->latitude, 'lng' => (float) $f->longitude]);

        $projects = Project::whereIn('status', ['approved', 'ongoing', 'completed'])
            ->whereNotNull('latitude')->whereNotNull('longitude')
            ->get(['id', 'name', 'slug', 'status', 'latitude', 'longitude'])
            ->map(fn ($p) => ['type' => 'project', 'name' => $p->name, 'slug' => $p->slug, 'status' => $p->status, 'lat' => (float) $p->latitude, 'lng' => (float) $p->longitude]);

        $communities = Community::where('status', 'active')
            ->whereNotNull('latitude')->whereNotNull('longitude')
            ->get(['id', 'name', 'slug', 'latitude', 'longitude'])
            ->map(fn ($c) => ['type' => 'community', 'name' => $c->name, 'lat' => (float) $c->latitude, 'lng' => (float) $c->longitude]);

        return response()->json(
            $attractions->concat($facilities)->concat($projects)->concat($communities)->values()
        );
    }
}