
import React from 'react';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { X, Users } from "lucide-react";

interface Model {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  gender: string;
  starred: boolean;
}

interface ModelImageModalProps {
  model: Model | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ModelImageModal = ({ model, isOpen, onClose }: ModelImageModalProps) => {
  if (!model) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full p-0 border-0 bg-transparent">
        <div className="relative">
          <DialogClose className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors">
            <X className="h-4 w-4" />
          </DialogClose>
          
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
              {model.imageUrl ? (
                <img
                  src={model.imageUrl}
                  alt={model.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <Users className="h-32 w-32 text-gray-400" />
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{model.name}</h3>
              <p className="text-gray-600 capitalize">{model.gender}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
