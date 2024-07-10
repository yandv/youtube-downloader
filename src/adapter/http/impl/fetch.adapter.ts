import { HttpRequestException } from "@/exceptions/http-request.exception";
import { HttpClient, HttpRequest, HttpResponse } from "../request-adapter";

export class FetchHttpClientAdapter implements HttpClient {
  async request<T = any>(data: HttpRequest): Promise<HttpResponse<T>> {
    const realUrl = data.url;

    const response = await fetch(realUrl, {
      method: data.method ?? "GET",
      headers: data.headers,
      body: JSON.stringify(data.body),
    });

    const { status = 500, statusText = "Internal Server Error" } = response;

    if (!response.ok) {
      throw new HttpRequestException(status, statusText);
    }

    const json = await response.json();

    return {
      status,
      data: json,
    };
  }
}
