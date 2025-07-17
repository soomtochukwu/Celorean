"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  ImageIcon,
  X,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface CourseThumbnailUploadProps {
  onThumbnailUploaded: (file: File, previewUrl: string) => void;
  courseTitle?: string;
}

export function CourseThumbnailUpload({ 
  onThumbnailUploaded, 
  courseTitle = "" 
}: CourseThumbnailUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const simulateUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadProgress(progress);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const preview = URL.createObjectURL(file);
    setUploadedFile(file);
    setPreviewUrl(preview);
    setUploadProgress(0);
    setIsUploading(false);
    
    onThumbnailUploaded(file, preview);
    toast.success("Thumbnail uploaded successfully!");
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      simulateUpload(file);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    disabled: isUploading,
    maxSize: 5 * 1024 * 1024, // 5MB limit
  });

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      <div className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
        <Card
          className={`
            border-2 border-dashed transition-all duration-300 cursor-pointer
            ${
              isDragActive
                ? "border-primary bg-primary/10"
                : uploadedFile
                ? "border-green-500 bg-green-500/10"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
            }
          `}
        >
          <CardContent {...getRootProps()} className="p-6">
            <input {...getInputProps()} />
            {uploadedFile && previewUrl ? (
              <div className="text-center transition-opacity duration-300">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border">
                    <img
                      src={previewUrl}
                      alt="Course thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  {uploadedFile.name}
                </h4>
                <p className="text-muted-foreground mb-4">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-500 font-medium">
                    Thumbnail ready
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="text-red-500 border-red-500 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="text-center transition-opacity duration-300">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h4 className="text-lg font-semibold mb-2">
                  {isDragActive
                    ? "Drop thumbnail here"
                    : "Upload course thumbnail"}
                </h4>
                <p className="text-muted-foreground mb-4">
                  Drag and drop an image here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: JPG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>
            )}

            {isUploading && (
              <div className="mt-4 transition-opacity duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Uploading...
                  </span>
                  <span className="text-sm text-primary">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}