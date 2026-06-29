import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  errors: never[];
};

type ApiError = {
  success: false;
  message: string;
  data: null;
  errors: string[];
};

export function ok<T>(data: T, message = "OK"): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, message, data, errors: [] });
}

export function created<T>(data: T, message = "Created"): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, message, data, errors: [] }, { status: 201 });
}

export function badRequest(message: string, errors: string[] = []): NextResponse<ApiError> {
  return NextResponse.json({ success: false, message, data: null, errors }, { status: 400 });
}

export function unauthorized(message = "Unauthorized"): NextResponse<ApiError> {
  return NextResponse.json({ success: false, message, data: null, errors: [] }, { status: 401 });
}

export function forbidden(message = "Forbidden"): NextResponse<ApiError> {
  return NextResponse.json({ success: false, message, data: null, errors: [] }, { status: 403 });
}

export function notFound(message = "Not found"): NextResponse<ApiError> {
  return NextResponse.json({ success: false, message, data: null, errors: [] }, { status: 404 });
}

export function conflict(message: string): NextResponse<ApiError> {
  return NextResponse.json({ success: false, message, data: null, errors: [] }, { status: 409 });
}

export function serverError(message = "Internal server error"): NextResponse<ApiError> {
  return NextResponse.json({ success: false, message, data: null, errors: [] }, { status: 500 });
}

export function handleZodError(error: ZodError): NextResponse<ApiError> {
  const issues = error.issues ?? (error as any).errors ?? [];
  const errors = issues.map((e: any) => `${e.path.join(".")}: ${e.message}`);
  return badRequest("Validation failed", errors);
}
