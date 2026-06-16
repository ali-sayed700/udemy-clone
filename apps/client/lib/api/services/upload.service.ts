/**
 * Upload service — centralizes file upload REST API calls.
 *
 * Replaces raw fetch() in courseCrud.actions.ts and raw axios in uploadVideo.ts.
 */
import apiClient from "../apiClient";

/**
 * Upload a single image file. Returns the uploaded image URL.
 */
export async function uploadImage(formData: FormData): Promise<string> {
  const { data } = await apiClient.post<{ url: string }>(
    "/files-upload/singleImg",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data.url;
}

/**
 * Upload a single video file with optional progress tracking.
 * Returns the uploaded video URL.
 */
export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<{ url: string }>(
    "/files-upload/singleVid",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    },
  );

  return data.url;
}
