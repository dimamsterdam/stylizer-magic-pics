
export interface Mark {
  id: string;
  path: any;
  prompt: string;
  left?: number;
  top?: number;
}

export interface ImageEditorProps {
  imageUrl: string;
  onSave: (maskDataUrl: string, marks: { prompt: string; area: string }[]) => void;
  onClose: () => void;
}

