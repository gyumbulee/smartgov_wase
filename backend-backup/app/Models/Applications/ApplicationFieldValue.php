<?php

namespace App\Models\Applications;

use App\Models\Services\ServiceField;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationFieldValue extends Model
{
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['application_id', 'service_field_id', 'field_key', 'value_text', 'value_json'];

    protected function casts(): array
    {
        return ['value_json' => 'array'];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function serviceField(): BelongsTo
    {
        return $this->belongsTo(ServiceField::class);
    }
}

