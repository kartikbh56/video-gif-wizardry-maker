
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ConvertButtonProps {
  onClick: () => void;
  isConverting: boolean;
  disabled: boolean;
}

const ConvertButton: React.FC<ConvertButtonProps> = ({
  onClick,
  isConverting,
  disabled,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={isConverting || disabled}
      className="w-full"
    >
      {isConverting ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
          <span>Processing...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <span>Convert to GIF</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      )}
    </Button>
  );
};

export default ConvertButton;
