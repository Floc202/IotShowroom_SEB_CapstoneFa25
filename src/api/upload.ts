import api from "./axios";
import type { ApiEnvelope } from "../types/base";
import type { CloudinaryUploadResponse } from "../types/upload";

export const uploadCloudinary = async (
  file: File,
  folder?: string
): Promise<ApiEnvelope<CloudinaryUploadResponse>> => {
  const formData = new FormData();

  formData.append("File", file);

  if (folder) formData.append("Folder", folder);

  const res = await api.post<ApiEnvelope<CloudinaryUploadResponse>>(
    "/Cloudinary/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
};
