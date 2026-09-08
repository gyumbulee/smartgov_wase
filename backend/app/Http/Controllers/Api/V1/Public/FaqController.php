<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Models\Content\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        $faqs = Faq::query()
            ->where('status', 'active')
            ->when($request->filled('service_id'), fn ($q) => $q->where('service_id', $request->string('service_id')))
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->string('category')))
            ->orderBy('sort_order')
            ->get();

        return FaqResource::collection($faqs);
    }
}
