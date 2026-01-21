export interface HostawayErrorOptions {
  status?: number;
  code?: string;
  details?: unknown;
  requestId?: string;
  responseBody?: unknown;
  method?: string;
  url?: string;
}

export class HostawayError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  requestId?: string;
  responseBody?: unknown;
  method?: string;
  url?: string;

  constructor(message: string, options: HostawayErrorOptions = {}) {
    super(message);
    this.name = 'HostawayError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
    this.responseBody = options.responseBody;
    this.method = options.method;
    this.url = options.url;
  }
}
