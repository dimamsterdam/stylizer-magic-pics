
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Image, PencilBrush } from "fabric";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Brush, Check, X } from "lucide-react";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (maskDataUrl: string) => void;
  onClose: () => void;
}

export const ImageEditor = ({ imageUrl, onSave, onClose }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create canvas with initial dimensions
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 512,
      height: 512,
      isDrawingMode: true,
    });

    // Initialize the brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "rgba(255, 0, 0, 0.3)";
    canvas.freeDrawingBrush.width = 20;

    // Load and set the background image while maintaining aspect ratio
    Image.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    }).then((img) => {
      // Calculate scaling factors to maintain aspect ratio while fitting within 512x512
      const imgAspectRatio = img.width! / img.height!;
      const canvasAspectRatio = canvas.width! / canvas.height!;
      
      let scaleX, scaleY;
      if (imgAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas ratio
        scaleX = canvas.width! / img.width!;
        scaleY = scaleX;
      } else {
        // Image is taller than canvas ratio
        scaleY = canvas.height! / img.height!;
        scaleX = scaleY;
      }

      // Center the image
      img.scaleX = scaleX;
      img.scaleY = scaleY;
      img.left = (canvas.width! - (img.width! * scaleX)) / 2;
      img.top = (canvas.height! - (img.height! * scaleY)) / 2;
      img.selectable = false;
      
      // Set as background
      canvas.backgroundImage = img;
      canvas.renderAll();
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  const handleSave = () => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL();
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-auto max-w-[544px]">
        <div className="p-4 flex flex-col gap-4 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brush className="h-5 w-5 text-polaris-text" />
              <span className="text-body-md text-polaris-text">
                Mark areas for regeneration
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden w-[512px]">
            <canvas ref={canvasRef} />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={onClose}
              className="bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-polaris-green hover:bg-polaris-teal text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Marks
            </Button>
          </DialogFooter>
        </div>
      </div>
    </div>
  );
};
