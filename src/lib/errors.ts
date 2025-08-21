export type ErrorLike = {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
  cause?: unknown;
  meta?: unknown;
};

export function toErrorLike(err: unknown): ErrorLike {
  if (err instanceof Error) {
    const meta: Record<string, unknown> = {};
    
    // Extract common meta keys from error objects
    if ('errors' in err) meta.errors = (err as any).errors;
    if ('issues' in err) meta.issues = (err as any).issues;
    if ('keyValue' in err) meta.keyValue = (err as any).keyValue;
    if ('reason' in err) meta.reason = (err as any).reason;
    if ('code' in err) meta.code = (err as any).code;
    
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: (err as any).code,
      cause: err.cause,
      meta: Object.keys(meta).length > 0 ? meta : undefined
    };
  }
  
  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    return {
      name: 'ObjectError',
      message: String(obj.message || obj.error || obj.err || obj.msg || 'Unknown object error'),
      code: obj.code as string | number | undefined,
      meta: obj
    };
  }
  
  return {
    name: 'UnknownError',
    message: String(err)
  };
}
