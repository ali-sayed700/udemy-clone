"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  Check,
  Loader2,
  BookOpen,
  ImageIcon,
  AlertCircle,
  Target,
  Settings2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  useCreateCourse,
  uploadCourseImage,
} from "@/service/dashboard/courseCrud.service";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { label: "Basics", icon: BookOpen },
  { label: "Outcomes", icon: Target },
  { label: "Publish", icon: ImageIcon },
];

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Design",
  "Business",
  "Other",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const LANGUAGES = ["English", "Arabic", "French", "Spanish", "German", "Other"];

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-350">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
}: CreateCourseModalProps) {
  const [step, setStep] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [categories, setCategories] = useState("");
  const [level, setLevel] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("");
  const [objectives, setObjectives] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const createCourseMutation = useCreateCourse();

  const basicsMissing = [
    !title.trim() && "Title",
    !description.trim() && "Description",
    price <= 0 && "Price",
    !categories && "Category",
    !level && "Level",
    !primaryLanguage && "Language",
  ].filter(Boolean) as string[];

  const outcomesMissing = [
    !objectives.trim() && "Objectives",
    !welcomeMessage.trim() && "Welcome message",
  ].filter(Boolean) as string[];

  const missingFields = [...basicsMissing, ...outcomesMissing];
  const isBasicsValid = basicsMissing.length === 0;
  const isOutcomesValid = outcomesMissing.length === 0;
  const isFormValid = missingFields.length === 0;

  const stepStatus = [isBasicsValid, isOutcomesValid, isFormValid];

  const currentStep = STEPS[step];
  const CurrentStepIcon = currentStep.icon;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl("");
    setFormError(null);
  };

  const handleImageUpload = async (): Promise<string> => {
    if (!imageFile) return imageUrl;

    setIsUploading(true);
    try {
      const url = await uploadCourseImage(imageFile);
      setImageUrl(url);
      toast.success("Image uploaded successfully!");
      return url;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to upload image");
      setFormError(message);
      toast.error(message);
      return "";
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setTitle("");
    setDescription("");
    setPrice(0);
    setCategories("");
    setLevel("");
    setPrimaryLanguage("");
    setObjectives("");
    setWelcomeMessage("");
    setIsPublished(false);
    setImageUrl("");
    setImageFile(null);
    setImagePreview("");
    setFormError(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const goNext = () => {
    setFormError(null);

    if (step === 0 && !isBasicsValid) {
      setFormError(`Complete: ${basicsMissing.join(", ")}`);
      return;
    }

    if (step === 1 && !isOutcomesValid) {
      setFormError(`Complete: ${outcomesMissing.join(", ")}`);
      return;
    }

    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      setFormError(`Complete: ${missingFields.join(", ")}`);
      setStep(basicsMissing.length > 0 ? 0 : 1);
      return;
    }

    try {
      setFormError(null);
      let finalImageUrl = imageUrl;

      if (imageFile && !finalImageUrl) {
        finalImageUrl = await handleImageUpload();
        if (!finalImageUrl) {
          throw new Error("Image upload failed. Remove the image or try again.");
        }
      }

      await createCourseMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        price,
        categories,
        level,
        primaryLanguage,
        objectives: objectives.trim(),
        welcomeMessage: welcomeMessage.trim(),
        isPublished,
        image: finalImageUrl,
      });

      toast.success("Course created successfully!");
      handleClose();
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create course");
      setFormError(message);
      toast.error(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative mx-4 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-white">
              <CurrentStepIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Create Course
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{currentStep.label}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-4 lg:border-b-0 lg:border-r lg:border-slate-100 lg:dark:border-slate-800">
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {STEPS.map((item, index) => {
                const Icon = item.icon;
                const isActive = index === step;
                const isDone = stepStatus[index];

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setStep(index)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                        : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isDone
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {isDone && index < step ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className="block text-xs text-slate-400 dark:text-slate-500">
                        Step {index + 1}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto px-6 py-5">
            {formError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {step === 0 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Basics
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isBasicsValid ? "Complete" : `${basicsMissing.length} left`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isBasicsValid
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {isBasicsValid ? "Ready" : "Draft"}
                  </span>
                </div>

                <div>
                  <FieldLabel required>Course title</FieldLabel>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Complete React Masterclass"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800"
                  />
                </div>

                <div>
                  <FieldLabel required>Description</FieldLabel>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="What students will learn and build"
                    className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>Price</FieldLabel>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={price}
                      onChange={(e) =>
                        setPrice(parseFloat(e.target.value) || 0)
                      }
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800"
                    />
                  </div>
                  <div>
                    <FieldLabel required>Category</FieldLabel>
                    <select
                      value={categories}
                      onChange={(e) => setCategories(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 cursor-pointer"
                    >
                      <option value="" className="dark:bg-slate-800">Select category</option>
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category} className="dark:bg-slate-800">
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>Level</FieldLabel>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 cursor-pointer"
                    >
                      <option value="" className="dark:bg-slate-800">Select level</option>
                      {LEVELS.map((item) => (
                        <option key={item} value={item} className="dark:bg-slate-800">
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel required>Language</FieldLabel>
                    <select
                      value={primaryLanguage}
                      onChange={(e) => setPrimaryLanguage(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 cursor-pointer"
                    >
                      <option value="" className="dark:bg-slate-800">Select language</option>
                      {LANGUAGES.map((item) => (
                        <option key={item} value={item} className="dark:bg-slate-800">
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Outcomes
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isOutcomesValid
                        ? "Complete"
                        : `${outcomesMissing.length} left`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isOutcomesValid
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {isOutcomesValid ? "Ready" : "Draft"}
                  </span>
                </div>

                <div>
                  <FieldLabel required>Objectives</FieldLabel>
                  <textarea
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    rows={5}
                    placeholder="Build production-ready components, understand hooks, manage state"
                    className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800"
                  />
                </div>

                <div>
                  <FieldLabel required>Welcome message</FieldLabel>
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={4}
                    placeholder="Welcome students and set expectations"
                    className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Cover image
                      </h3>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      {imagePreview ? (
                        <div className="space-y-3 p-3">
                          <Image
                            src={imagePreview}
                            alt="Course cover preview"
                            width={900}
                            height={480}
                            className="aspect-video w-full rounded-lg object-cover"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            {!imageUrl ? (
                              <button
                                type="button"
                                onClick={handleImageUpload}
                                disabled={isUploading}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                              >
                                {isUploading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                                {isUploading ? "Uploading" : "Upload"}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                <Check className="h-3.5 w-3.5" />
                                Uploaded
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview("");
                                setImageUrl("");
                              }}
                              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-white dark:hover:bg-slate-800 hover:text-red-600 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-450 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                            <Upload className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                              Select cover image
                            </span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                              PNG, max 2MB
                            </span>
                          </span>
                          <input
                            type="file"
                            accept="image/png"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-slate-500 dark:text-slate-450" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Summary
                      </h3>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-xs uppercase text-slate-400 dark:text-slate-500">
                          Title
                        </dt>
                        <dd className="font-medium text-slate-900 dark:text-white">
                          {title || "Untitled course"}
                        </dd>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <dt className="text-xs uppercase text-slate-400 dark:text-slate-500">
                            Price
                          </dt>
                          <dd className="font-medium text-slate-900 dark:text-white">
                            ${price}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-slate-400 dark:text-slate-500">
                            Level
                          </dt>
                          <dd className="font-medium text-slate-900 dark:text-white">
                            {level || "-"}
                          </dd>
                        </div>
                      </div>
                      <div>
                        <dt className="text-xs uppercase text-slate-400 dark:text-slate-500">
                          Category
                        </dt>
                        <dd className="font-medium text-slate-900 dark:text-white">
                          {categories || "-"}
                        </dd>
                      </div>
                    </dl>

                    <label className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 dark:bg-slate-950 p-3 cursor-pointer">
                      <span>
                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                          Publish
                        </span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                          {isPublished ? "Visible" : "Draft"}
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="mt-1 rounded border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-slate-500 dark:bg-slate-800 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-4">
          <button
            type="button"
            onClick={() => (step > 0 ? setStep(step - 1) : handleClose())}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createCourseMutation.isPending || isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {createCourseMutation.isPending || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading" : "Creating"}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Course
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
