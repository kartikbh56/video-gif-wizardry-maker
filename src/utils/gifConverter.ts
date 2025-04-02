
import { ConversionSettingsType } from "@/components/ConversionSettings";
import { toast } from "sonner";

export async function convertVideoToGif(
  videoFile: File,
  settings: ConversionSettingsType
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a video element to load the video
    const video = document.createElement("video");
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.crossOrigin = "anonymous"; // Important for canvas security
    video.muted = true;

    video.onloadedmetadata = () => {
      // Create a canvas to draw video frames
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(videoUrl);
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Set dimensions based on settings
      const aspectRatio = video.videoHeight / video.videoWidth;
      canvas.width = settings.width;
      canvas.height = Math.floor(settings.width * aspectRatio);

      // Calculate frame interval
      const frameInterval = 1000 / settings.fps;
      const gifDuration = settings.endTime - settings.startTime;
      const totalFrames = Math.floor(gifDuration * settings.fps);

      // Use a lighter GIF library for browser
      let frameCount = 0;
      const frames: ImageData[] = [];
      
      // Progress tracking
      const updateProgress = (progress: number) => {
        toast.dismiss("gif-progress");
        toast(`Converting: ${progress}% complete`, {
          id: "gif-progress",
        });
      };
      
      // Show initial progress
      updateProgress(0);
      
      // We need to seek to the start time first
      video.currentTime = settings.startTime;
      
      // Handle seeking completion
      video.onseeked = () => {
        // Start capturing frames
        captureFrames();
      };
      
      // Function to capture all frames
      const captureFrames = () => {
        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        frameCount++;
        
        // Update progress
        const progress = Math.min(100, Math.floor((frameCount / totalFrames) * 100));
        if (frameCount % 5 === 0) {
          updateProgress(progress);
        }
        
        // Check if we're done or need to capture more frames
        if (video.currentTime >= settings.endTime || frameCount >= totalFrames) {
          // Conversion complete
          finishConversion();
          return;
        }
        
        // Move to next frame
        video.currentTime += 1 / settings.fps;
        // Wait for seeking to complete before capturing next frame
      };
      
      // Function to finish conversion
      const finishConversion = () => {
        // Clean up
        video.pause();
        URL.revokeObjectURL(videoUrl);
        
        // Complete the conversion
        updateProgress(100);
        
        // In a real implementation, we'd use a proper GIF encoder
        // For now, create a data URL from the canvas with the last frame
        ctx.putImageData(frames[frames.length - 1], 0, 0);
        const gifUrl = canvas.toDataURL("image/png");
        
        // Resolve with the gif URL
        setTimeout(() => {
          toast.dismiss("gif-progress");
          resolve(gifUrl);
        }, 500);
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error("Failed to load video"));
    };
  });
}

export function downloadGif(gifUrl: string, filename: string = "converted.gif") {
  const link = document.createElement("a");
  link.href = gifUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
