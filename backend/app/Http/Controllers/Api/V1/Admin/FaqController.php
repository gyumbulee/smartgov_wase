<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFaqRequest;
use App\Http\Resources\FaqResource;
use App\Models\Content\Faq;

class FaqController extends Controller
{
    public function index()
    {
        return FaqResource::collection(Faq::orderBy('sort_order')->get());
    }

    public function store(StoreFaqRequest $request)
    {
        $faq = Faq::create([...$request->validated(), 'status' => $request->input('status', 'active')]);

        return new FaqResource($faq);
    }

    public function update(StoreFaqRequest $request, Faq $faq)
    {
        $faq->update($request->validated());

        return new FaqResource($faq);
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();

        return response()->json(['message' => 'FAQ deleted.']);
    }
}
