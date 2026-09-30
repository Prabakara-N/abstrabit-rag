import { NextResponse } from 'next/server'

/**
 * Standardized API response utilities
 * Ensures consistent error format across all endpoints
 */

// =============================================================================
// Success Responses
// =============================================================================

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function createdResponse<T>(data: T) {
  return NextResponse.json(data, { status: 201 })
}

export function noContentResponse() {
  return new NextResponse(null, { status: 204 })
}

// =============================================================================
// Error Responses
// =============================================================================

interface ErrorResponseOptions {
  details?: string
  code?: string
}

function errorResponse(
  message: string,
  status: number,
  options?: ErrorResponseOptions
) {
  return NextResponse.json(
    {
      error: message,
      ...(options?.details && { details: options.details }),
      ...(options?.code && { code: options.code }),
    },
    { status }
  )
}

/** 400 Bad Request - Invalid input or missing required fields */
export function badRequestError(message = 'Bad request', options?: ErrorResponseOptions) {
  return errorResponse(message, 400, options)
}

/** 401 Unauthorized - Not authenticated */
export function unauthorizedError(message = 'Unauthorized', options?: ErrorResponseOptions) {
  return errorResponse(message, 401, options)
}

/** 403 Forbidden - Authenticated but not allowed */
export function forbiddenError(message = 'Access denied', options?: ErrorResponseOptions) {
  return errorResponse(message, 403, options)
}

/** 404 Not Found - Resource doesn't exist */
export function notFoundError(message = 'Not found', options?: ErrorResponseOptions) {
  return errorResponse(message, 404, options)
}

/** 409 Conflict - Resource already exists */
export function conflictError(message = 'Resource already exists', options?: ErrorResponseOptions) {
  return errorResponse(message, 409, options)
}

/** 422 Unprocessable Entity - Validation failed */
export function validationError(message = 'Validation failed', options?: ErrorResponseOptions) {
  return errorResponse(message, 422, options)
}

/** 429 Too Many Requests - Rate limited */
export function rateLimitError(message = 'Too many requests', options?: ErrorResponseOptions) {
  return errorResponse(message, 429, options)
}

/** 500 Internal Server Error - Unexpected error */
export function serverError(message = 'Internal server error', options?: ErrorResponseOptions) {
  return errorResponse(message, 500, options)
}

// =============================================================================
// Streaming Response Helper
// =============================================================================

export function streamResponse(stream: ReadableStream, headers?: HeadersInit) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...headers,
    },
  })
}
