<?php

namespace App\Services\Certificates;

use RuntimeException;

/**
 * Thrown by CertificateGenerationService when a service reaches
 * processing with no active certificate template. This is an expected,
 * recoverable condition (an admin hasn't uploaded/activated a template
 * yet) — not a system fault — so it's caught separately from generic
 * exceptions and routed to the exception queue with a clear message
 * rather than a stack trace (spec §69).
 */
class TemplateNotConfiguredException extends RuntimeException
{
}
