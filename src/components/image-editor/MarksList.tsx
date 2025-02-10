
import { Button } from "@/components/ui/button";
import { Pen, Trash2 } from "lucide-react";
import { Mark } from "@/types/imageEditor";

interface MarksListProps {
  marks: Mark[];
  onEdit: (markId: string) => void;
  onDelete: (markId: string) => void;
}

export const MarksList = ({ marks, onEdit, onDelete }: MarksListProps) => {
  return (
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
                  onClick={() => onEdit(mark.id)}
                >
                  <Pen className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500 hover:text-red-600"
                  onClick={() => onDelete(mark.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

