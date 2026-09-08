<?php

namespace App\Models\Applications;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationStatusHistory extends Model
{
    use HasUlids;

    // The migration named this table in the singular
    // ("application_status_history"), but Eloquent's default naming
    // convention pluralizes the class name ("...histories"). Without
    // this override, every query against this model looks for a table
    // that doesn't exist.
    protected $table = 'application_status_history';

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['application_id', 'from_status', 'to_status', 'changed_by_user_id', 'reason', 'metadata', 'created_at'];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'created_at' => 'datetime'];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}

