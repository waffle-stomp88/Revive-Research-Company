import { useState, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { successful: Array<{ uploadURL?: string }> }) => void;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  children: ReactNode;
  disabled?: boolean;
  showDropZone?: boolean;
  dropZoneLabel?: string;
}

export function ObjectUploader({
  maxFileSize = 10485760,
  allowedFileTypes = ["image/*"],
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  buttonVariant = "outline",
  buttonSize = "default",
  children,
  disabled = false,
  showDropZone = false,
  dropZoneLabel = "Drag & drop a file here, or",
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isFileTypeAllowed = useCallback((file: File) => {
    return allowedFileTypes.some((type) => {
      if (type.endsWith("/*")) {
        const category = type.split("/")[0];
        return file.type.startsWith(category + "/");
      }
      return file.type === type || type === "." + file.name.split(".").pop()?.toLowerCase();
    });
  }, [allowedFileTypes]);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > maxFileSize) {
      alert(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
      return;
    }

    if (!isFileTypeAllowed(file)) {
      const typeList = allowedFileTypes.join(", ");
      alert(`File type not supported. Allowed: ${typeList}`);
      return;
    }

    setIsUploading(true);

    try {
      const { url } = await onGetUploadParameters();

      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const uploadURL = url.split("?")[0];

      onComplete?.({
        successful: [{ uploadURL }],
      });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [maxFileSize, isFileTypeAllowed, allowedFileTypes, onGetUploadParameters, onComplete]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  }, [disabled, isUploading, uploadFile]);

  const acceptString = allowedFileTypes.join(",");

  if (showDropZone) {
    return (
      <div
        className={`relative rounded-md border-2 border-dashed transition-colors ${
          isDragOver
            ? "border-[#E7FB10] bg-[#E7FB10]/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${disabled || isUploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-testid="dropzone-file-upload"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          onChange={handleFileChange}
          style={{ display: "none" }}
          data-testid="input-file-upload"
        />
        <div className="flex flex-col items-center justify-center gap-3 p-6">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-[#E7FB10]" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </>
          ) : isDragOver ? (
            <>
              <Upload className="h-8 w-8 text-[#E7FB10]" />
              <span className="text-sm text-[#E7FB10] font-medium">Drop file to upload</span>
            </>
          ) : (
            <>
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-muted-foreground">{dropZoneLabel}</span>
                <Button
                  type="button"
                  onClick={handleButtonClick}
                  className={buttonClassName}
                  variant={buttonVariant}
                  size={buttonSize}
                  disabled={disabled}
                  data-testid="button-upload-trigger"
                >
                  {children}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        onChange={handleFileChange}
        style={{ display: "none" }}
        data-testid="input-file-upload"
      />
      <Button
        type="button"
        onClick={handleButtonClick}
        className={buttonClassName}
        variant={buttonVariant}
        size={buttonSize}
        disabled={disabled || isUploading}
        data-testid="button-upload-trigger"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}
