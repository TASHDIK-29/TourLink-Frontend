"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ListField } from "./ListField";
import { MultiImagePicker } from "./MultiImagePicker";
import {
  tourFormSchema,
  type TourFormValues,
  type TourFormOutput,
} from "@/lib/validations/tour";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  getTourTypeName,
  useCreateTourMutation,
  useGetTourTypesQuery,
  useUpdateTourMutation,
  type TourPayload,
} from "@/redux/features/tour/tourApi";
import { useGetDivisionsQuery } from "@/redux/features/division/divisionApi";
import type { ITour } from "@/types";

const toDateInput = (value?: string) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export function TourForm({ tour }: { tour?: ITour }) {
  const router = useRouter();
  const isEdit = Boolean(tour);

  const { data: divisions, isLoading: divisionsLoading } = useGetDivisionsQuery();
  const { data: tourTypes, isLoading: typesLoading } = useGetTourTypesQuery();
  const [createTour, { isLoading: creating }] = useCreateTourMutation();
  const [updateTour, { isLoading: updating }] = useUpdateTourMutation();

  const [files, setFiles] = useState<File[]>([]);
  const [deleteImages, setDeleteImages] = useState<string[]>([]);
  const [included, setIncluded] = useState<string[]>(tour?.included ?? []);
  const [excluded, setExcluded] = useState<string[]>(tour?.excluded ?? []);
  const [amenities, setAmenities] = useState<string[]>(tour?.amenities ?? []);
  const [tourPlan, setTourPlan] = useState<string[]>(tour?.tourPlan ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      title: tour?.title ?? "",
      division: tour?.division ?? "",
      tourType: tour?.tourType ?? "",
      description: tour?.description ?? "",
      location: tour?.location ?? "",
      departureLocation: tour?.departureLocation ?? "",
      arrivalLocation: tour?.arrivalLocation ?? "",
      costFrom: tour?.costFrom ?? "",
      maxGuest: tour?.maxGuest ?? "",
      minAge: tour?.minAge ?? "",
      startDate: toDateInput(tour?.startDate),
      endDate: toDateInput(tour?.endDate),
    },
  });

  const toggleDelete = (url: string) =>
    setDeleteImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );

  const onSubmit = async (raw: TourFormValues) => {
    const values = raw as unknown as TourFormOutput;

    // Drop blank rows the admin added but never filled in.
    const clean = (list: string[]) =>
      list.map((s) => s.trim()).filter(Boolean);

    // Omit empty optionals entirely — the backend schema rejects "" for fields
    // typed as string and would store empty strings for the rest.
    const payload: TourPayload = {
      title: values.title,
      division: values.division,
      tourType: values.tourType,
      ...(values.description ? { description: values.description } : {}),
      ...(values.location ? { location: values.location } : {}),
      ...(values.departureLocation
        ? { departureLocation: values.departureLocation }
        : {}),
      ...(values.arrivalLocation
        ? { arrivalLocation: values.arrivalLocation }
        : {}),
      ...(values.costFrom !== undefined ? { costFrom: values.costFrom } : {}),
      ...(values.maxGuest !== undefined ? { maxGuest: values.maxGuest } : {}),
      ...(values.minAge !== undefined ? { minAge: values.minAge } : {}),
      ...(values.startDate ? { startDate: values.startDate } : {}),
      ...(values.endDate ? { endDate: values.endDate } : {}),
      ...(clean(included).length ? { included: clean(included) } : {}),
      ...(clean(excluded).length ? { excluded: clean(excluded) } : {}),
      ...(clean(amenities).length ? { amenities: clean(amenities) } : {}),
      ...(clean(tourPlan).length ? { tourPlan: clean(tourPlan) } : {}),
    };

    try {
      if (isEdit && tour) {
        await updateTour({
          id: tour._id,
          payload: {
            ...payload,
            ...(deleteImages.length ? { deleteImages } : {}),
          },
          files,
        }).unwrap();
        toast.success("Tour updated");
      } else {
        await createTour({ payload, files }).unwrap();
        toast.success("Tour created");
      }
      router.push("/admin/tours");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the tour"));
    }
  };

  const referencesMissing =
    !divisionsLoading &&
    !typesLoading &&
    (!divisions?.length || !tourTypes?.length);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
      {referencesMissing && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          A tour needs both a division and a tour type. Create at least one of
          each before saving.
        </p>
      )}

      <section className="space-y-4 rounded-card border border-border bg-card p-6">
        <h2 className="font-semibold">Basics</h2>

        <Input
          label="Title"
          placeholder="Sajek Valley Weekend"
          error={errors.title?.message}
          {...register("title")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Division"
            error={errors.division?.message}
            {...register("division")}
          >
            <option value="">Select a division…</option>
            {divisions?.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </Select>

          <Select
            label="Tour type"
            error={errors.tourType?.message}
            {...register("tourType")}
          >
            <option value="">Select a tour type…</option>
            {tourTypes?.map((t) => (
              <option key={t._id} value={t._id}>
                {getTourTypeName(t) || "(unnamed)"}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Description"
          placeholder="What does this trip involve?"
          error={errors.description?.message}
          {...register("description")}
        />
      </section>

      <section className="space-y-4 rounded-card border border-border bg-card p-6">
        <h2 className="font-semibold">Logistics</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Location"
            placeholder="Rangamati"
            error={errors.location?.message}
            {...register("location")}
          />
          <Input
            label="Cost from (BDT)"
            type="number"
            min={0}
            placeholder="8500"
            error={errors.costFrom?.message}
            {...register("costFrom")}
          />
          <Input
            label="Departure location"
            placeholder="Dhaka"
            error={errors.departureLocation?.message}
            {...register("departureLocation")}
          />
          <Input
            label="Arrival location"
            placeholder="Sajek"
            error={errors.arrivalLocation?.message}
            {...register("arrivalLocation")}
          />
          <Input
            label="Start date"
            type="date"
            error={errors.startDate?.message}
            {...register("startDate")}
          />
          <Input
            label="End date"
            type="date"
            error={errors.endDate?.message}
            {...register("endDate")}
          />
          <Input
            label="Max guests"
            type="number"
            min={0}
            placeholder="20"
            error={errors.maxGuest?.message}
            {...register("maxGuest")}
          />
          <Input
            label="Minimum age"
            type="number"
            min={0}
            placeholder="12"
            error={errors.minAge?.message}
            {...register("minAge")}
          />
        </div>
      </section>

      <section className="space-y-6 rounded-card border border-border bg-card p-6">
        <h2 className="font-semibold">Details</h2>
        <ListField
          label="Included"
          values={included}
          onChange={setIncluded}
          placeholder="Breakfast"
          addLabel="Add inclusion"
        />
        <ListField
          label="Excluded"
          values={excluded}
          onChange={setExcluded}
          placeholder="Airfare"
          addLabel="Add exclusion"
        />
        <ListField
          label="Amenities"
          values={amenities}
          onChange={setAmenities}
          placeholder="Air conditioning"
          addLabel="Add amenity"
        />
        <ListField
          label="Tour plan"
          values={tourPlan}
          onChange={setTourPlan}
          placeholder="Day 1 — Arrive and settle in"
          addLabel="Add day"
        />
      </section>

      <section className="space-y-4 rounded-card border border-border bg-card p-6">
        <h2 className="font-semibold">Images</h2>
        <MultiImagePicker
          files={files}
          onFilesChange={setFiles}
          existingUrls={tour?.images ?? []}
          markedForDeletion={deleteImages}
          onToggleDelete={toggleDelete}
        />
      </section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={creating || updating}>
          {isEdit ? "Save changes" : "Create tour"}
        </Button>
      </div>
    </form>
  );
}
