
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import VideoPlayer from "@/components/VideoPlayer";
import ConversionSettings, { ConversionSettingsType } from "@/components/ConversionSettings";
import ConvertButton from "@/components/ConvertButton";
import GifPreview from "@/components/GifPreview";
import { convertVideoToGif, downloadGif } from "@/utils/gifConverter";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<ConversionSettingsType>({
    quality: 75,
    fps: 15,
    startTime: 0,
    endTime: 5,
    width: 400,
  });

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (gifUrl && gifUrl.startsWith("blob:")) URL.revokeObjectURL(gifUrl);
    };
  }, [videoUrl, gifUrl]);

  // Handle video file selection
  const handleFileSelected = (file: File) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (gifUrl && gifUrl.startsWith("blob:")) URL.revokeObjectURL(gifUrl);
    
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setGifUrl(null);
    
    // Get video duration to update end time in settings
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
      setSettings((prev) => ({
        ...prev,
        endTime: Math.min(10, video.duration), // Limit initial selection to 10s
      }));
    };
    video.src = URL.createObjectURL(file);
  };

  // Handle settings change
  const handleSettingsChange = (newSettings: Partial<ConversionSettingsType>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Handle conversion
  const handleConvert = async () => {
    if (!videoFile) return;
    
    setIsConverting(true);
    try {
      const result = await convertVideoToGif(videoFile, settings);
      setGifUrl(result);
      toast({
        title: "Conversion Complete!",
        description: "Your GIF is ready to download.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your video.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!gifUrl || !videoFile) return;
    
    const filename = videoFile.name.replace(/\.[^/.]+$/, "") + ".gif";
    downloadGif(gifUrl, filename);
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">Video to GIF Wizard</h1>
          <p className="mt-2 text-muted-foreground">
            Upload a video, customize settings, and convert it to a GIF!
          </p>
        </div>

        <div className="grid gap-8">
          {!videoFile ? (
            <FileUpload onFileSelected={handleFileSelected} />
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Video Preview</h2>
                  {videoUrl && videoFile && (
                    <VideoPlayer videoSrc={videoUrl} videoFile={videoFile} />
                  )}
                </div>
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Settings</h2>
                  <ConversionSettings
                    settings={settings}
                    duration={videoDuration}
                    onSettingsChange={handleSettingsChange}
                  />
                </div>
              </div>

              <div className="mt-4">
                <ConvertButton
                  onClick={handleConvert}
                  isConverting={isConverting}
                  disabled={!videoFile}
                />
              </div>

              {gifUrl && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h2 className="mb-4 text-xl font-semibold">Your GIF</h2>
                    <GifPreview gifUrl={gifUrl} onDownload={handleDownload} />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
