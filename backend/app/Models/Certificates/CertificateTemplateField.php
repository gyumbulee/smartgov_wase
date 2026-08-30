<?php

namespace App\Models\Certificates;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CertificateTemplateField extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'template_version_id', 'field_key', 'data_source', 'x_position', 'y_position',
        'width', 'height', 'font_family', 'font_size', 'font_style', 'alignment',
        'color', 'format_rule',
    ];

    public function templateVersion(): BelongsTo
    {
        return $this->belongsTo(CertificateTemplateVersion::class, 'template_version_id');
    }
}

