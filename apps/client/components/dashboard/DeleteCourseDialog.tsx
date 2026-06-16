"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useDeleteCourse } from "@/service/dashboard/courseCrud.service";
import { toast } from "react-toastify";

interface DeleteCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export default function DeleteCourseDialog({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}: DeleteCourseDialogProps) {
  const deleteMutation = useDeleteCourse();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(courseId);
      toast.success("Course deleted successfully!");
      onClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete course",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Warning icon */}
          <div className="w-14 h-14 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Course</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                &quot;{courseTitle}&quot;
              </span>
              ? This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full pt-2">
            <button
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
