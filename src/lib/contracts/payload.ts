export class ApiPayloadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ApiPayloadError"
  }
}
