import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { API_BASE, authFetch } from '../../config';

export default function ImageUploader({ currentImage, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }

      // Show local preview immediately
      setPreview(URL.createObjectURL(file));
      setUploading(true);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await authFetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.ok) {
          onUpload(data.path);
          toast.success('Image uploaded');
        } else {
          toast.error(data.error || 'Upload failed');
          setPreview(null);
        }
      } catch {
        toast.error('Upload failed');
        setPreview(null);
      }

      setUploading(false);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'] },
    multiple: false,
  });

  const displayImage = preview || currentImage;

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-accent bg-accent/5'
            : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        <input {...getInputProps()} />

        {displayImage ? (
          <div className="relative">
            <img
              src={displayImage}
              alt="Upload preview"
              className="max-h-32 mx-auto rounded-lg object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {uploading && (
              <div className="absolute inset-0 bg-dark-900/80 flex items-center justify-center rounded-lg">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <svg className="w-8 h-8 mx-auto text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-gray-500">Drop image or click to upload</p>
            <p className="text-xs text-gray-600 mt-1">Max 5MB · JPG, PNG, WebP, SVG</p>
          </div>
        )}
      </div>

      {currentImage && (
        <p className="text-xs text-gray-600 mt-1 truncate font-mono">{currentImage}</p>
      )}
    </div>
  );
}
