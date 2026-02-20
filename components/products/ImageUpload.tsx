'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  accept?: string;
  label?: string;
}

export default function ImageUpload({
  onUploadComplete,
  onUploadError,
  maxFiles = 1,
  accept = 'image/*',
  label = 'Upload Image',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'product');

      const response = await fetch('/api/vendor/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadComplete(data.data.url);
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
            />
          </div>
        )}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`inline-block px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Max 5MB. JPG, PNG, WebP, GIF
          </p>
        </div>
      </div>
    </div>
  );
}
