export class HttpRequestException extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpRequestException";
    this.status = status;
  }
}
