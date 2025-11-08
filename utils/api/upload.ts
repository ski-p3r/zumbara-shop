"use server";

import axios from "axios";

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      "https://api.zumbarashop.com/api/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-upload-token": "changeme123",
        },
      }
    );
    console.log(response.data);

    return response.data;
  } catch (error: any) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "File upload failed");
  }
}
