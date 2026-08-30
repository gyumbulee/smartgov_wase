<?php

namespace App\Models\Content;

use Illuminate\Database\Eloquent\Model;

class DocumentCategory extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'slug', 'description'];
}
