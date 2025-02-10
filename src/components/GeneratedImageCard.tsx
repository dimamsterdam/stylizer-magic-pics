
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Check, Trash, RefreshCw, ZoomIn, Brush } from "lucide-react";
import { useState } from "react";
import { ImageEditor } from "./ImageEditor";
import { useToast } from "@/hooks/use-toast";

interface GeneratedImageProps {
  id: string;
  url: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onRegenerate: (id: string, maskDataUrl?: string, marks?: { prompt: string; area: string }[]) => void;
}

export const GeneratedImageCard = ({
  id,
  url,
  selected,
  onSelect,
  onRemove,
  onRegenerate,
}: GeneratedImageProps) => {
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleSaveMask = (maskDataUrl: string, marks: { prompt: string; area: string }[]) => {
    onRegenerate(id, maskDataUrl, marks);
    setIsEditorOpen(false);
    toast({
      title: "Processing marked areas",
      description: `Regenerating the image with ${marks.length} marked ${marks.length === 1 ? 'area' : 'areas'}...`,
    });
  };

  return (
    <div
      className={`relative group cursor-pointer ${
        selected ? "ring-2 ring-polaris-teal rounded-lg" : ""
      }`}
      onClick={() => onSelect(id)}
    >
      <img
        src={url}
        alt="Generated product"
        className="w-full h-48 md:h-64 object-cover rounded-lg"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
        <div className="absolute top-2 right-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate(id);
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <img
                src={url}
                alt="Generated product"
                className="w-full h-auto rounded-lg"
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditorOpen(true);
            }}
          >
            <Brush className="h-4 w-4" />
          </Button>
        </div>
        {selected && (
          <div className="absolute top-2 left-2">
            <div className="bg-polaris-teal rounded-full p-1">
              <Check className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>
      {isEditorOpen && (
        <ImageEditor
          imageUrl={url}
          onSave={handleSaveMask}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
