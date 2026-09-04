<?php

namespace App\Models\Complaints;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintUpdate extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['complaint_id', 'user_id', 'status', 'message'];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
