export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiConfig {
  name: string;
  baseUrl: string;
  endpoint: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  authType?: "none" | "bearer" | "apikey";
  token?: string;
  apiKeyHeader?: string;
  apiKeyValue?: string;
  defaultQuery?: Record<string, any>;
  transformResponse?: (data: any) => any;
}

export interface CallApiOptions {
  pathParams?: Record<string, string | number>;
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}
