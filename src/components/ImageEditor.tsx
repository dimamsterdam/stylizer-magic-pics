
import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Image, PencilBrush } from "fabric";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Brush, Check, X, Pen, Trash2 } from "lucide-react";

interface Mark {
  id: string;
  path: any;
  prompt: string;
  left?: number;
  top?: number;
}

interface ImageEditorProps {
  imageUrl: string;
  onSave: (maskDataUrl: string, marks: { prompt: string; area: string }[]) => void;
  onClose: () => void;
}

export const ImageEditor = ({ imageUrl, onSave, onClose }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [activeMarkId, setActiveMarkId] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ left: 0, top: 0 });
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 512,
      height: 512,
      isDrawingMode: true,
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "rgba(255, 0, 0, 0.3)";
    canvas.freeDrawingBrush.width = 20;

    canvas.on('path:created', (e: any) => {
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

      setMarks(prev => [...prev, { 
        id: markId, 
        path, 
        prompt: "",
        left: bounds.left,
        top: bounds.top
      }]);
      setActiveMarkId(markId);
      setShowPopover(true);
      setCurrentPrompt("");
    });

    Image.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    }).then((img) => {
      const imgAspectRatio = img.width! / img.height!;
      const canvasAspectRatio = canvas.width! / canvas.height!;
      
      let scaleX, scaleY;
      if (imgAspectRatio > canvasAspectRatio) {
        scaleX = canvas.width! / img.width!;
        scaleY = scaleX;
      } else {
        scaleY = canvas.height! / img.height!;
        scaleX = scaleY;
      }

      img.scaleX = scaleX;
      img.scaleY = scaleY;
      img.left = (canvas.width! - (img.width! * scaleX)) / 2;
      img.top = (canvas.height! - (img.height! * scaleY)) / 2;
      img.selectable = false;
      
      canvas.backgroundImage = img;
      canvas.renderAll();
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  useEffect(() => {
    if (showPopover && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showPopover]);

  const handlePromptSubmit = () => {
    if (!activeMarkId) return;
    
    if (!currentPrompt.trim()) {
      handleDeleteMark(activeMarkId);
    } else {
      setMarks(prev => prev.map(mark => 
        mark.id === activeMarkId ? { ...mark, prompt: currentPrompt } : mark
      ));
      setCurrentPrompt("");
      setActiveMarkId(null);
    }
    setShowPopover(false);
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
                <div 
                  className="absolute"
                  style={{
                    left: `${popoverPosition.left}px`,
                    top: `${popoverPosition.top}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
                    <Input
                      ref={inputRef}
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePromptSubmit();
                        } else if (e.key === 'Escape') {
                          handleDeleteMark(activeMarkId!);
                        }
                      }}
                      placeholder="Describe the change..."
                      className="min-w-[200px]"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-64 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-polaris-text">
                  Marked Areas:
                </label>
                <div className="flex flex-col gap-2">
                  {marks.map((mark) => (
                    <div
                      key={mark.id}
                      className="group flex items-start gap-2 p-2 rounded-md hover:bg-gray-50"
                    >
                      <p className="flex-1 text-sm">
                        {mark.prompt || "No prompt added"}
                      </p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEditPrompt(mark.id)}
                        >
                          <Pen className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteMark(mark.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
