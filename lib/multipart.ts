/**
 * Builds the multipart body the backend's `validateRequest` expects.
 *
 * `validateRequest` does `JSON.parse(req.body.data)` before running the Zod
 * schema, so the entire JSON payload travels as ONE stringified field named
 * `data` — not as individual form fields.
 *
 * These routes must ALWAYS be sent as multipart, even with zero files: multer
 * only populates `req.body`/`req.files` for multipart requests, and the tour
 * controller calls `.map()` on `req.files` unguarded.
 *
 * @param fileField `files` for tours (multer .array), `file` for divisions (.single)
 */
export function buildMultipart(
  // `object` rather than Record<string, unknown> so plain interfaces (which
  // have no index signature) can be passed without a cast.
  payload: object,
  files: File[] = [],
  fileField: "files" | "file" = "files",
): FormData {
  const form = new FormData();
  form.append("data", JSON.stringify(payload));
  for (const file of files) {
    form.append(fileField, file);
  }
  return form;
}
