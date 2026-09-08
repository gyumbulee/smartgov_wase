<?php

namespace App\Models\Media;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use HasUlids, SoftDeletes;

    protected $table = 'media';
    protected $keyType = 'string';
    public $incrementing = false;

    // Central polymorphic media system (spec §39/§52) backing projects,
    // tourism, news, people, events, communities, galleries, documents.
    protected $fillable = [
        'disk', 'path', 'filename', 'original_filename', 'mime_type', 'extension',
        'size', 'width', 'height', 'alt_text', 'title', 'description', 'credit',
        'copyright', 'license', 'uploaded_by',
    ];

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function url(): string
    {
        return \Illuminate\Support\Facades\Storage::disk($this->disk)->url($this->path);
    }
}

