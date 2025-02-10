
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Brush, Check, X } from "lucide-react";
import { Mark, ImageEditorProps } from "@/types/imageEditor";
import { MarksList } from "./image-editor/MarksList";
import { PromptInput } from "./image-editor/PromptInput";
import { initializeCanvas } from "@/utils/canvasUtils";

const generateSuggestedPrompts = (markId: string): string[] => {
  return [
    "Make this area brighter",
    "Add more contrast here",
    "Adjust the color balance",
    "Enhance the details",
    "Smooth out this region",
    "Make this pop more",
    "Soften this area",
    "Add more texture here",
  ];
};

export const ImageEditor = ({ imageUrl, onSave, onClose }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [activeMarkId, setActiveMarkId] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ left: 0, top: 0 });
  const [showPopover, setShowPopover] = useState(false);

  // Clean up any empty marks when component unmounts
  useEffect(() => {
    return () => {
      marks.forEach(mark => {
        if (!mark.prompt && fabricCanvas) {
          fabricCanvas.remove(mark.path);
        }
      });
    };
  }, [marks, fabricCanvas]);

  useEffect(() => {
    if (!canvasRef.current) return;

    initializeCanvas(canvasRef.current, imageUrl).then(setFabricCanvas);

    return () => {
      fabricCanvas?.dispose();
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on('path:created', (e: any) => {
      const path = e.path;
      const markId = Math.random().toString(36).substring(7);
      const bounds = path.getBoundingRect();
      const canvasElement = canvasRef.current;
      
      if (canvasElement) {
        const rect = canvasElement.getBoundingClientRect();
        setPopoverPosition({
          left: rect.left + bounds.left + (bounds.width / 2),
          top: rect.top + bounds.top
        });
      }

      const suggestedPrompts = generateSuggestedPrompts(markId);

      setMarks(prev => {
        // Only filter out marks that are empty AND not the active one
        const cleanedMarks = prev.filter(mark => mark.prompt || mark.id === activeMarkId);
        return [...cleanedMarks, { 
          id: markId, 
          path, 
          prompt: "",
          suggestedPrompts,
          left: bounds.left,
          top: bounds.top
        }];
      });
      
      setActiveMarkId(markId);
      setShowPopover(true);
      setCurrentPrompt("");
    });
  }, [fabricCanvas, activeMarkId]);

  const handlePromptSubmit = () => {
    if (!activeMarkId) return;

    const trimmedPrompt = currentPrompt.trim();
    
    if (trimmedPrompt) {
      setMarks(prev => prev.map(mark => 
        mark.id === activeMarkId ? { ...mark, prompt: trimmedPrompt } : mark
      ));
      setActiveMarkId(null);
      setCurrentPrompt("");
      setShowPopover(false);
    } else {
      handleDeleteMark(activeMarkId);
    }
  };

  const handleDeleteMark = (markId: string) => {
    const markToDelete = marks.find(m => m.id === markId);
    if (markToDelete && fabricCanvas) {
      fabricCanvas.remove(markToDelete.path);
      setMarks(prev => prev.filter(mark => mark.id !== markId));
      if (activeMarkId === markId) {
        setActiveMarkId(null);
        setCurrentPrompt("");
        setShowPopover(false);
      }
    }
  };

  const handleEditPrompt = (markId: string) => {
    const mark = marks.find(m => m.id === markId);
    if (mark) {
      setCurrentPrompt(mark.prompt);
      setActiveMarkId(markId);
      setShowPopover(true);
      setPopoverPosition({
        left: mark.left || 0,
        top: mark.top || 0
      });
    }
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL();
    const marksWithAreas = marks.map(mark => ({
      prompt: mark.prompt,
      area: mark.path.toDataURL()
    }));
    onSave(dataUrl, marksWithAreas);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-auto">
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
          
          <div className="flex gap-4">
            <div className="relative border border-gray-200 rounded-lg overflow-hidden w-[512px]">
              <canvas ref={canvasRef} />
              {showPopover && (
                <PromptInput
                  currentPrompt={currentPrompt}
                  suggestedPrompts={marks.find(m => m.id === activeMarkId)?.suggestedPrompts}
                  position={popoverPosition}
                  onChange={setCurrentPrompt}
                  onSubmit={handlePromptSubmit}
                  onCancel={() => handleDeleteMark(activeMarkId!)}
                />
              )}
            </div>
            
            <MarksList
              marks={marks}
              onEdit={handleEditPrompt}
              onDelete={handleDeleteMark}
            />
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
              disabled={marks.some(mark => !mark.prompt)}
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
