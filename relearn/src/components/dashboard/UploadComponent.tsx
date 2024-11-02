"use client";

import React, { useState } from "react";
import Tesseract from "tesseract.js";

type FileUploadProps = {
  onUpload?: (file: File) => void;
};

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const fileSize = file.size / (1024 * 1024); // Convert bytes to MB

      // Validate file type and size
      if (
        (fileType === "application/pdf" ||
          fileType === "image/jpeg" ||
          fileType === "image/png") &&
        fileSize <= 10
      ) {
        setSelectedFile(file);
        setError("");
      } else {
        setSelectedFile(null);
        setError(
          "Invalid file type or size. Only JPG, PNG, and PDF files under 10MB are allowed."
        );
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload?.(selectedFile);
      alert("File uploaded successfully!");
      extractTextFromFile(selectedFile);
    } else {
      alert("Please select a valid file before uploading.");
    }
  };

  const extractTextFromFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      // Use Tesseract.js for image files
      Tesseract.recognize(file, "eng", {
        logger: (info) => console.log(info), // Optional logger
      })
        .then(({ data: { text } }) => {
          setExtractedText(text);
        })
        .catch((error) => {
          console.error("Error extracting text:", error);
          setError("Failed to extract text from image.");
        });
    } else {
      // Handle PDF text extraction if needed
      setError("Text extraction from PDFs is not implemented.");
    }
  };

  return (
    <div className="bg-white w-full max-w-4xl h-3/4 flex flex-col items-center justify-center rounded-lg shadow-lg mx-4 p-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-10 rounded-lg w-full max-w-2xl">
        <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500 mb-4 text-center">
          Select a file or drag and drop here
        </p>
        <p className="text-gray-500 mb-4 text-center">
          JPG, PNG or PDF, file size no more than 10MB
        </p>

        <input
          type="file"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          SELECT FILE
        </label>

        {selectedFile && (
          <p className="text-green-500 mt-4">
            Selected file: {selectedFile.name}
          </p>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {extractedText && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold">Extracted Text:</h4>
            <p>{extractedText}</p>
          </div>
        )}
      </div>
      <div className="flex justify-between w-full max-w-2xl mt-4 px-10">
        <button
          className="bg-gray-200 text-black px-4 py-2 rounded"
          onClick={() => setSelectedFile(null)}
        >
          Cancel
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleUpload}
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
