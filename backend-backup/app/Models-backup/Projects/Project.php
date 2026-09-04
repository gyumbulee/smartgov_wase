<?php

namespace App\Models\Projects;

use App\Models\Government\Community;
use App\Models\Government\Department;
use App\Models\Government\Ward;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    public const STATUSES = ['proposed', 'approved', 'ongoing', 'completed', 'suspended', 'cancelled'];

    protected $fillable = [
        'name', 'slug', 'project_code', 'description', 'department_id', 'ward_id',
        'community_id', 'location_description', 'latitude', 'longitude', 'contractor',
        'budget', 'currency', 'start_date', 'expected_completion_date',
        'actual_completion_date', 'progress_percentage', 'status', 'featured',
    ];

    protected function casts(): array
    {
        return [
            'budget' => 'decimal:2',
            'start_date' => 'date',
            'expected_completion_date' => 'date',
            'actual_completion_date' => 'date',
            'featured' => 'boolean',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ProjectUpdate::class)->orderByDesc('published_at');
    }
}
