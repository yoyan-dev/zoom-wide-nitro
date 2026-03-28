export function isDuplicateUserError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("already been registered") ||
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("duplicate")
  );
}

export function isMissingAuthUserError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("user not found") ||
    message.includes("not found") ||
    message.includes("no rows")
  );
}
