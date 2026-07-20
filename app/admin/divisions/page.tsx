"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  useCreateDivisionMutation,
  useDeleteDivisionMutation,
  useGetDivisionsQuery,
  useUpdateDivisionMutation,
} from "@/redux/features/division/divisionApi";
import type { IDivision } from "@/types";

// Mirrors backend createDivisionSchema (name required, description optional).
const schema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function AdminDivisionsPage() {
  const { data: divisions, isLoading } = useGetDivisionsQuery();
  const [createDivision, { isLoading: creating }] = useCreateDivisionMutation();
  const [updateDivision, { isLoading: updating }] = useUpdateDivisionMutation();
  const [deleteDivision, { isLoading: deleting }] = useDeleteDivisionMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IDivision | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [toDelete, setToDelete] = useState<IDivision | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditing(null);
    setFile(null);
    reset({ name: "", description: "" });
    setFormOpen(true);
  };

  const openEdit = (division: IDivision) => {
    setEditing(division);
    setFile(null);
    reset({ name: division.name, description: division.description ?? "" });
    setFormOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
    };

    try {
      if (editing) {
        await updateDivision({ id: editing._id, payload, file }).unwrap();
        toast.success("Division updated");
      } else {
        await createDivision({ payload, file }).unwrap();
        toast.success("Division created");
      }
      setFormOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the division"));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDivision(toDelete._id).unwrap();
      toast.success("Division deleted");
      setToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete the division"));
    }
  };

  return (
    <>
      <PageHeader
        title="Divisions"
        description="Regions that tours are grouped under."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New division
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-card" />
          ))}
        </div>
      ) : !divisions?.length ? (
        <EmptyState onCreate={openCreate} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {divisions.map((division) => (
            <div
              key={division._id}
              className="overflow-hidden rounded-card border border-border bg-card"
            >
              <div className="relative aspect-[16/9] bg-muted">
                {division.thumbnail ? (
                  <Image
                    src={division.thumbnail}
                    alt={division.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <MapPin className="h-7 w-7" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="truncate font-semibold">{division.name}</h3>
                <p className="truncate text-xs text-muted-foreground">
                  /{division.slug}
                </p>
                {division.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {division.description}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(division)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${division.name}`}
                    onClick={() => setToDelete(division)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit division" : "New division"}
        description={
          editing
            ? "The slug is regenerated by the backend when the name changes."
            : undefined
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            placeholder="Chattogram"
            error={errors.name?.message}
            {...register("name")}
          />
          <Textarea
            label="Description"
            placeholder="What makes this region worth visiting?"
            error={errors.description?.message}
            {...register("description")}
          />
          <ImagePicker
            file={file}
            onChange={setFile}
            existingUrl={editing?.thumbnail}
            hint={
              editing
                ? "Uploading a new image replaces the current one."
                : undefined
            }
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={creating || updating}>
              {editing ? "Save changes" : "Create division"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        itemName={toDelete?.name ?? ""}
        description="Tours already assigned to this division will keep a dangling reference."
      />
    </>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
      <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
      <h3 className="mt-3 font-semibold">No divisions yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Divisions are required before you can create a tour.
      </p>
      <Button className="mt-5" onClick={onCreate}>
        <Plus className="h-4 w-4" />
        New division
      </Button>
    </div>
  );
}
