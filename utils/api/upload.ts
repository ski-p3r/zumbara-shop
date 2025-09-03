import axios from "axios";

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      "http://192.168.0.22:8001/api/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-upload-token": "changeme123",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
