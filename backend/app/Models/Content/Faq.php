<?php

namespace App\Models\Content;

use App\Models\Services\Service;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Faq extends Model
{
    use HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'faqs';

    protected $fillable = ['question', 'answer', 'category', 'service_id', 'sort_order', 'status'];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}

