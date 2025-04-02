
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Video } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    processFile(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    processFile(files);
  };

  const processFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }

    onFileSelected(file);
    toast.success("Video uploaded successfully!");
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        isDragging ? "border-primary bg-muted" : "border-border"
      }`}
    >
      <CardContent
        className="flex flex-col items-center justify-center py-12 text-center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="mb-4 rounded-full bg-muted p-6">
          <Video className="h-10 w-10 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Upload a video</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Drag and drop a video file or click the button below
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          className="hidden"
          data-testid="file-input"
        />
        <Button onClick={handleButtonClick} className="gap-2">
          <Upload className="h-4 w-4" />
          Select Video
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
