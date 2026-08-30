<?php

namespace App\Models\Complaints;

use App\Models\Government\Department;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintCategory extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'slug', 'description', 'department_id', 'status'];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
