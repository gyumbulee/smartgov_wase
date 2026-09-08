<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactMessageResource;
use App\Models\Content\ContactMessage;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function index(Request $request)
    {
        $messages = ContactMessage::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->with('assignedTo')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 25));

        return ContactMessageResource::collection($messages);
    }

    public function updateStatus(Request $request, ContactMessage $contactMessage)
    {
        $request->validate(['status' => ['required', 'in:new,read,in_progress,resolved,spam']]);
        $contactMessage->update(['status' => $request->input('status')]);

        return new ContactMessageResource($contactMessage);
    }
}
