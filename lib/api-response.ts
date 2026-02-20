import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

/**
 * Centralized API response wrapper
 */
export function successResponse<T>(data: T, message?: string, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status }
  );
}

export function serverErrorResponse(error: unknown): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : 'Internal server error';
  console.error('Server error:', error);
  return errorResponse(message, 500);
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse('Unauthorized', 401);
}

export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found`, 404);
}
