<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreContactMessageRequest;
use App\Models\Content\ContactMessage;

class ContactController extends Controller
{
    public function store(StoreContactMessageRequest $request)
    {
        ContactMessage::create([
            ...$request->validated(),
            'status' => 'new',
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Your message has been received. We will get back to you soon.'], 201);
    }
}
