<?php

namespace App\Models\Content;

use App\Models\Government\Department;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class News extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    /** CMS editorial pipeline per spec §51: draft -> review -> approved -> published */
    public const STATUSES = ['draft', 'review', 'approved', 'published', 'archived'];

    protected $fillable = [
        'title', 'slug', 'excerpt', 'content', 'category_id', 'author_id',
        'department_id', 'featured_image_id', 'status', 'published_at',
        'featured', 'views_count',
    ];

    protected function casts(): array
    {
        return ['published_at' => 'datetime', 'featured' => 'boolean'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(NewsCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
