<?php

namespace App\Models\Government;

use App\Models\Citizen\CitizenProfile;
use App\Models\Projects\Project;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ward extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name', 'slug', 'code', 'description', 'map_coordinates', 'status'];

    protected function casts(): array
    {
        return ['map_coordinates' => 'array'];
    }

    public function communities(): HasMany
    {
        return $this->hasMany(Community::class);
    }

    public function facilities(): HasMany
    {
        return $this->hasMany(Facility::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function citizens(): HasMany
    {
        return $this->hasMany(CitizenProfile::class, 'ward_id');
    }
}
