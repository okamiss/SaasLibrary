export class OssConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OssConfigurationError';
  }
}

export class OssOperationError extends Error {
  constructor(
    public readonly operation: 'upload' | 'download' | 'delete',
    public readonly key: string,
    cause: unknown
  ) {
    super(`OSS ${operation} failed for key: ${key}`);
    this.name = 'OssOperationError';
    this.cause = cause;
  }
}
