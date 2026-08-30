<?php

namespace App\Models\Content;

use App\Models\Media\Media;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['title', 'slug', 'description', 'category_id', 'file_media_id', 'version', 'is_public', 'published_at', 'created_by'];

    protected function casts(): array
    {
        return ['is_public' => 'boolean', 'published_at' => 'datetime'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(DocumentCategory::class, 'category_id');
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'file_media_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

