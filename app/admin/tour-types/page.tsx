"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  getTourTypeName,
  useCreateTourTypeMutation,
  useDeleteTourTypeMutation,
  useGetTourTypesQuery,
  useUpdateTourTypeMutation,
} from "@/redux/features/tour/tourApi";
import type { ITourType } from "@/types";

const schema = z.object({ name: z.string().min(1, "Name is required.") });
type FormValues = z.infer<typeof schema>;

export default function AdminTourTypesPage() {
  const { data: tourTypes, isLoading } = useGetTourTypesQuery();
  const [createTourType, { isLoading: creating }] = useCreateTourTypeMutation();
  const [updateTourType, { isLoading: updating }] = useUpdateTourTypeMutation();
  const [deleteTourType, { isLoading: deleting }] = useDeleteTourTypeMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ITourType | null>(null);
  const [toDelete, setToDelete] = useState<ITourType | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "" });
    setFormOpen(true);
  };

  const openEdit = (type: ITourType) => {
    setEditing(type);
    reset({ name: getTourTypeName(type) });
    setFormOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) {
        await updateTourType({ id: editing._id, name: values.name }).unwrap();
        toast.success("Tour type updated");
      } else {
        await createTourType({ name: values.name }).unwrap();
        toast.success("Tour type created");
      }
      setFormOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the tour type"));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTourType(toDelete._id).unwrap();
      toast.success("Tour type deleted");
      setToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete the tour type"));
    }
  };

  return (
    <>
      <PageHeader
        title="Tour Types"
        description="Categories such as Adventure, Family or Luxury."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New tour type
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !tourTypes?.length ? (
        <div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
          <Tags className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">No tour types yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Tour types are required before you can create a tour.
          </p>
          <Button className="mt-5" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New tour type
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
          {tourTypes.map((type) => (
            <li
              key={type._id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Tags className="h-4 w-4" />
                </span>
                <span className="truncate font-medium">
                  {getTourTypeName(type) || (
                    <span className="text-destructive">(no name stored)</span>
                  )}
                </span>
              </div>

              <div className="flex shrink-0 gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(type)}
                  aria-label={`Edit ${getTourTypeName(type)}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setToDelete(type)}
                  aria-label={`Delete ${getTourTypeName(type)}`}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit tour type" : "New tour type"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            placeholder="Adventure"
            error={errors.name?.message}
            {...register("name")}
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
              {editing ? "Save changes" : "Create tour type"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        itemName={getTourTypeName(toDelete)}
        description="Tours already using this type will keep a dangling reference."
      />
    </>
  );
}
