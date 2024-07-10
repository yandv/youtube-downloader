import { FetchHttpClientAdapter } from "./impl/fetch.adapter";

export interface HttpRequest {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

export interface HttpResponse<T> {
  status: number;
  data: T;
}

export interface HttpClient {
  request: <T>(data: HttpRequest) => Promise<HttpResponse<T>>;
}

export const httpClientFactory = (): HttpClient => new FetchHttpClientAdapter();
