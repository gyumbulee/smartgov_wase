<?php

namespace App\Models\Services;

use App\Models\Applications\Application;
use App\Models\Government\Department;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'slug', 'service_code', 'short_description', 'description',
        'category_id', 'department_id', 'eligibility_description', 'fee', 'currency',
        'estimated_processing_minutes', 'status', 'is_online',
        'requires_identity_verification', 'requires_eligibility_verification',
        'requires_payment', 'sort_order', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'fee' => 'decimal:2',
            'is_online' => 'boolean',
            'requires_identity_verification' => 'boolean',
            'requires_eligibility_verification' => 'boolean',
            'requires_payment' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function fields(): HasMany
    {
        return $this->hasMany(ServiceField::class)->orderBy('sort_order');
    }

    public function requirements(): HasMany
    {
        return $this->hasMany(ServiceRequirement::class)->orderBy('sort_order');
    }

    public function workflows(): HasMany
    {
        return $this->hasMany(ServiceWorkflow::class);
    }

    public function activeWorkflow()
    {
        return $this->workflows()->where('is_active', true)->first();
    }

    public function feeVersions(): HasMany
    {
        return $this->hasMany(ServiceFeeVersion::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
}

