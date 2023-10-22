import { ZodError } from 'zod'

/**
 * Queryframe error codes
 *
 */
export enum QUERYFRAME_ERROR {
  BAD_INPUT = 'BAD_INPUT',
  BAD_OUTPUT = 'BAD_OUTPUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  API_ERROR = 'API_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  TIMEOUT = 'TIMEOUT',
}

export const NETWORK_ERROR = {
  400: QUERYFRAME_ERROR.BAD_REQUEST,
  401: QUERYFRAME_ERROR.UNAUTHORIZED,
  403: QUERYFRAME_ERROR.FORBIDDEN,
  404: QUERYFRAME_ERROR.NOT_FOUND,
  405: QUERYFRAME_ERROR.METHOD_NOT_ALLOWED,
}

/**
 * Queryframe error documentation
 *
 */
export class QueryframeError extends Error {
  public readonly cause?: Error
  public readonly code

  constructor(opts: {
    code: QUERYFRAME_ERROR
    message: string
    cause?: unknown
  }) {
    const cause = opts.cause
    const message = opts.message

    super(message, {
      cause: cause instanceof ZodError ? cause.flatten() : cause,
    })

    this.code = opts.code
    this.name = 'QueryframeError'
  }
}
