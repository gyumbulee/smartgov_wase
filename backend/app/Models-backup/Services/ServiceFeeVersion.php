<?php

namespace App\Models\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceFeeVersion extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['service_id', 'amount', 'currency', 'effective_from', 'effective_until', 'status', 'created_by'];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'effective_from' => 'datetime',
            'effective_until' => 'datetime',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
