import React, { useState } from "react";
import axios from "axios";

function Upload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post("http://localhost:3001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(`Upload complete. ${res.data.errorsLogged} error(s) logged.`);
      setFile(null);
      onUploadComplete(); // Refresh audit table
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check the console.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6 bg-zinc-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-2 text-white">Upload CSV File</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="block mb-4 text-white"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
}

export default Upload;
