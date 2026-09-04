<?php

namespace App\Models\Payments;

use App\Models\Applications\Application;
use App\Models\Citizen\CitizenProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'application_id', 'citizen_id', 'payment_reference', 'gateway',
        'gateway_transaction_id', 'amount', 'currency', 'status', 'payment_method',
        'paid_at', 'gateway_response',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'gateway_response' => 'array',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(CitizenProfile::class, 'citizen_id');
    }

    public function receipt(): HasOne
    {
        return $this->hasOne(Receipt::class);
    }
}

