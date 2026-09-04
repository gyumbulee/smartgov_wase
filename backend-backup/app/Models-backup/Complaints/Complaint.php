<?php

namespace App\Models\Complaints;

use App\Models\Citizen\CitizenProfile;
use App\Models\Government\Department;
use App\Models\Government\Staff;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Complaint extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    // This is a genuine operational workflow involving staff (spec §47) —
    // unlike certificate applications, manual handling here is expected.
    public const STATUSES = ['submitted', 'received', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'];

    protected $fillable = [
        'complaint_reference', 'citizen_id', 'category_id', 'department_id', 'title',
        'description', 'location', 'latitude', 'longitude', 'priority', 'status',
        'assigned_to', 'submitted_at', 'resolved_at',
    ];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime', 'resolved_at' => 'datetime'];
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(CitizenProfile::class, 'citizen_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ComplaintCategory::class, 'category_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'assigned_to');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ComplaintUpdate::class)->orderBy('created_at');
    }
}
