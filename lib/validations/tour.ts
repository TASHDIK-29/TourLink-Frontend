import { z } from "zod";

/**
 * Numeric fields arrive from <input type="number"> as strings, but the backend
 * Zod schema is strict `z.number()`. Coerce here, and treat "" as absent rather
 * than 0 — an empty cost field must not publish a free tour.
 */
const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => (v === "" || v == null ? undefined : Number(v)))
  .refine((v) => v === undefined || !Number.isNaN(v), "Must be a number.");

export const tourFormSchema = z
  .object({
    title: z.string().min(1, "Title is required."),
    division: z.string().min(1, "Division is required."),
    tourType: z.string().min(1, "Tour type is required."),
    description: z.string().optional(),
    location: z.string().optional(),
    departureLocation: z.string().optional(),
    arrivalLocation: z.string().optional(),
    costFrom: optionalNumber,
    maxGuest: optionalNumber,
    minAge: optionalNumber,
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      new Date(data.endDate) >= new Date(data.startDate),
    { message: "End date must be on or after the start date.", path: ["endDate"] },
  );

export type TourFormValues = z.input<typeof tourFormSchema>;
export type TourFormOutput = z.output<typeof tourFormSchema>;
