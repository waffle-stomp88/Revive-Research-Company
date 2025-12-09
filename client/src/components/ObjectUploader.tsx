import { useState, useEffect, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import DashboardModal from "@uppy/react/dashboard-modal";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

const uppyModalStyles = `
  .uppy-Dashboard--modal {
    z-index: 9999 !important;
  }
  .uppy-Dashboard--modal .uppy-Dashboard-overlay {
    background: rgba(0, 0, 0, 0.7) !important;
    z-index: 9998 !important;
  }
  .uppy-Dashboard-inner {
    background: hsl(var(--card)) !important;
    border: 1px solid hsl(var(--border)) !important;
    border-radius: 0.5rem !important;
    z-index: 9999 !important;
  }
  .uppy-Dashboard-AddFiles {
    border: 2px dashed hsl(var(--border)) !important;
    background: hsl(var(--muted)) !important;
  }
  .uppy-Dashboard-AddFiles-title {
    color: hsl(var(--foreground)) !important;
  }
  .uppy-Dashboard-browse {
    color: #E7FB10 !important;
  }
  .uppy-DashboardContent-bar {
    background: hsl(var(--card)) !important;
    border-bottom: 1px solid hsl(var(--border)) !important;
  }
  .uppy-StatusBar {
    background: hsl(var(--card)) !important;
  }
  .uppy-StatusBar-actionBtn--upload {
    background: #E7FB10 !important;
    color: black !important;
  }
  .uppy-Dashboard-close {
    color: hsl(var(--foreground)) !important;
  }
`;

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  children: ReactNode;
  disabled?: boolean;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  allowedFileTypes = ["image/*"],
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  buttonVariant = "outline",
  buttonSize = "default",
  children,
  disabled = false,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const styleId = "uppy-custom-styles";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = uppyModalStyles;
      document.head.appendChild(styleEl);
    }
  }, []);
  
  const uppy = useMemo(() => {
    const instance = new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes,
      },
      autoProceed: false,
    });
    
    instance.use(AwsS3, {
      shouldUseMultipart: false,
      getUploadParameters: onGetUploadParameters,
    });
    
    return instance;
  }, [maxNumberOfFiles, maxFileSize, allowedFileTypes]);

  useEffect(() => {
    const handleComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
      onComplete?.(result);
      setShowModal(false);
      uppy.cancelAll();
    };
    
    uppy.on("complete", handleComplete);
    return () => {
      uppy.off("complete", handleComplete);
    };
  }, [uppy, onComplete]);

  useEffect(() => {
    const awsS3 = uppy.getPlugin("AwsS3");
    if (awsS3) {
      awsS3.setOptions({
        getUploadParameters: onGetUploadParameters,
      });
    }
  }, [uppy, onGetUploadParameters]);

  const handleClose = useCallback(() => {
    uppy.cancelAll();
    setShowModal(false);
  }, [uppy]);

  return (
    <div>
      <Button
        type="button"
        onClick={() => setShowModal(true)}
        className={buttonClassName}
        variant={buttonVariant}
        size={buttonSize}
        disabled={disabled}
        data-testid="button-upload-trigger"
      >
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={handleClose}
        proudlyDisplayPoweredByUppy={false}
        note="Images only, up to 10 MB"
        browserBackButtonClose={true}
        closeModalOnClickOutside={true}
        disablePageScrollWhenModalOpen={true}
      />
    </div>
  );
}
