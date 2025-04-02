
import { ConversionSettingsType } from "@/components/ConversionSettings";
import { toast } from "sonner";
import GIF from "gif.js";

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

      // Calculate total frames needed
      const gifDuration = settings.endTime - settings.startTime;
      const totalFrames = Math.floor(gifDuration * settings.fps);

      // Create a new GIF
      const gif = new GIF({
        workers: 2,
        quality: 101 - settings.quality, // Convert quality (higher is better) to GIF.js quality (lower is better)
        width: canvas.width,
        height: canvas.height,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js/dist/gif.worker.js', // Use CDN for worker
      });

      let frameCount = 0;
      
      // Progress tracking
      gif.on('progress', (progress) => {
        const percent = Math.round(progress * 100);
        toast.dismiss("gif-progress");
        toast(`Converting: ${percent}% complete`, {
          id: "gif-progress",
        });
      });

      // When GIF is finished
      gif.on('finished', (blob) => {
        toast.dismiss("gif-progress");
        // Create URL from blob
        const gifUrl = URL.createObjectURL(blob);
        resolve(gifUrl);
      });

      // Show initial progress
      toast(`Starting conversion...`, {
        id: "gif-progress",
      });
      
      // We need to seek to the start time first
      video.currentTime = settings.startTime;
      
      // Handle seeking completion for the first frame
      video.onseeked = function captureFrame() {
        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add the frame to the GIF
        gif.addFrame(ctx, { copy: true, delay: 1000 / settings.fps });
        frameCount++;
        
        // Update progress for frame capture
        const captureProgress = Math.min(100, Math.floor((frameCount / totalFrames) * 100));
        if (frameCount % 5 === 0) {
          toast.dismiss("gif-progress");
          toast(`Capturing frames: ${captureProgress}% complete`, {
            id: "gif-progress",
          });
        }
        
        // Check if we're done or need to capture more frames
        if (video.currentTime >= settings.endTime || frameCount >= totalFrames) {
          // Finish GIF creation
          video.pause();
          URL.revokeObjectURL(videoUrl);
          gif.render(); // This will trigger the 'finished' event when done
          return;
        }
        
        // Move to next frame
        video.currentTime += 1 / settings.fps;
        // The onseeked event will trigger again for the next frame
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
