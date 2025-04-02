
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ConversionSettingsType {
  quality: number;
  fps: number;
  startTime: number;
  endTime: number;
  width: number;
}

interface ConversionSettingsProps {
  settings: ConversionSettingsType;
  duration: number;
  onSettingsChange: (settings: Partial<ConversionSettingsType>) => void;
}

const ConversionSettings: React.FC<ConversionSettingsProps> = ({
  settings,
  duration,
  onSettingsChange,
}) => {
  const handleQualityChange = (value: number[]) => {
    onSettingsChange({ quality: value[0] });
  };

  const handleFpsChange = (value: string) => {
    onSettingsChange({ fps: parseInt(value) });
  };

  const handleTimeRangeChange = (value: number[]) => {
    onSettingsChange({
      startTime: value[0],
      endTime: value[1],
    });
  };

  const handleWidthChange = (value: number[]) => {
    onSettingsChange({ width: value[0] });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>GIF Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Quality</Label>
            <span className="text-sm text-muted-foreground">
              {settings.quality}%
            </span>
          </div>
          <Slider
            value={[settings.quality]}
            min={10}
            max={100}
            step={5}
            onValueChange={handleQualityChange}
          />
        </div>

        <div className="space-y-2">
          <Label>Frame Rate</Label>
          <Select
            value={settings.fps.toString()}
            onValueChange={handleFpsChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select FPS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 FPS</SelectItem>
              <SelectItem value="15">15 FPS</SelectItem>
              <SelectItem value="20">20 FPS</SelectItem>
              <SelectItem value="25">25 FPS</SelectItem>
              <SelectItem value="30">30 FPS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Time Range</Label>
            <span className="text-sm text-muted-foreground">
              {formatTime(settings.startTime)} - {formatTime(settings.endTime)}
            </span>
          </div>
          <Slider
            value={[settings.startTime, settings.endTime]}
            min={0}
            max={duration || 10}
            step={0.1}
            onValueChange={handleTimeRangeChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Width (pixels)</Label>
            <span className="text-sm text-muted-foreground">
              {settings.width}px
            </span>
          </div>
          <Slider
            value={[settings.width]}
            min={100}
            max={800}
            step={50}
            onValueChange={handleWidthChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionSettings;
