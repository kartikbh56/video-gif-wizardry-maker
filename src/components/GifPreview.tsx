
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface GifPreviewProps {
  gifUrl: string | null;
  onDownload: () => void;
}

const GifPreview: React.FC<GifPreviewProps> = ({ gifUrl, onDownload }) => {
  if (!gifUrl) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex justify-center">
          <img
            src={gifUrl}
            alt="Converted GIF"
            className="max-h-[400px] rounded border border-border"
          />
        </div>
        <Button
          onClick={onDownload}
          variant="outline"
          className="w-full gap-2"
        >
          <Download className="h-4 w-4" />
          Download GIF
        </Button>
      </CardContent>
    </Card>
  );
};

export default GifPreview;
