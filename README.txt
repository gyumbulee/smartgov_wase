Fix: citizen registration fails at the final step
====================================================

Cause: these 5 models use ULID primary keys (citizen_profiles,
numbering_sequences, notable_people, tourist_attractions,
processing_jobs all have `$table->ulid('id')->primary()` with no
database default), but none of them applied the HasUlids trait —
not even imported. Without it, Eloquent never generates an id
before insert, so the first save() on any of these throws:

  SQLSTATE[HY000]: General error: 1364 Field 'id' doesn't have a
  default value

CitizenProfile is the one that matters most right now: it's the
last step of CreateOrUpdateCitizenProfile::handle(), which runs at
the end of every real citizen registration (CitizenRegistrationController
::complete()). Registration cannot currently be completed through
the actual API — only accounts created via seeders/factories (which
set IDs a different way) would appear to work.

Files changed (all in backend/app/Models/):
  Certificates/NumberingSequence.php
  Citizen/CitizenProfile.php
  Discover/NotablePerson.php
  Discover/TouristAttraction.php
  System/ProcessingJob.php

Each now has `use HasUlids;` (merged with any existing traits) plus
the corresponding import.

Apply:
  1. Overwrite these 5 files in your repo with the versions in this
     zip.
  2. No .env or config changes needed, and no cache to clear —
     this is plain class code, not config.
  3. Re-test: complete a full registration (NIN verify -> email/
     password) and confirm the account is created without a 500
     error.

  git add -A
  git commit -m "Fix: CitizenProfile, NumberingSequence, NotablePerson, TouristAttraction, ProcessingJob missing HasUlids trait entirely"
  git push
