<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'status' => $this->status,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'slug' => $r->slug,
            ])),
            'staff' => $this->whenLoaded('staff', fn () => $this->staff ? [
                'first_name' => $this->staff->first_name,
                'last_name' => $this->staff->last_name,
                'position_title' => $this->staff->position_title,
                'department' => $this->staff->department?->name,
                'employee_reference' => $this->staff->employee_reference,
            ] : null),
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
