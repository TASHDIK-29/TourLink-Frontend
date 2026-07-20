/**
 * The backend's globalErrorHandler returns { success, message, errorSources? }.
 * Zod failures arrive as errorSources entries, which are more specific than the
 * generic top-level message, so prefer them.
 */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const data = (error as { data?: unknown })?.data as
    | {
        message?: string;
        errorSources?: { path?: string; message?: string }[];
      }
    | undefined;

  const source = data?.errorSources?.find((s) => s?.message)?.message;
  if (source) return source;
  if (data?.message) return data.message;

  if ((error as { status?: unknown })?.status === "FETCH_ERROR") {
    return "Cannot reach the server. Is the backend running?";
  }
  return fallback;
}
