export function success(data: unknown, message = "Success") {
  return {
    success: true,
    message,
    data,
  };
}

export function badRequest(message = "Bad request", errors?: unknown) {
  return {
    success: false,
    message,
    errors: errors ?? null,
  };
}
