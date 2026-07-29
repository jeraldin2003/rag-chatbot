export default async function uploadFiles(backendUrl, files) {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetch(
    `${backendUrl.replace(/\/$/, "")}/upload_file/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `Upload failed (${res.status})`);
  }

  return data;
}
