"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { CameraIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface Props {
  currentPhotoUrl: string | null;
  onPhotoUpdate: (url: string | null) => void;
}

export default function ProfilePhotoUpload({ currentPhotoUrl, onPhotoUpdate }: Props) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.ok) {
        onPhotoUpdate(data.photoUrl);
      } else {
        alert(data.error || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Error uploading photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch("/api/upload-photo", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.ok) {
        onPhotoUpdate(null);
      } else {
        alert(data.error || "Failed to remove photo");
      }
    } catch (error) {
      console.error("Error removing photo:", error);
      alert("Error removing photo");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      {/* Photo Display */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
        {currentPhotoUrl ? (
          <Image
            src={currentPhotoUrl}
            alt="Profile"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserCircleIcon className="w-24 h-24 text-gray-400" />
          </div>
        )}

        {/* Upload Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-2"
        >
          <CameraIcon className="w-4 h-4" />
          {uploading ? "Uploading..." : currentPhotoUrl ? "Change Photo" : "Upload Photo"}
        </motion.button>

        {currentPhotoUrl && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            {deleting ? "Removing..." : "Remove"}
          </motion.button>
        )}

        <p className="text-xs text-gray-500">
          JPG, PNG, WebP or GIF. Max 5MB.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
