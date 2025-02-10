
import { Canvas as FabricCanvas, Image, PencilBrush } from "fabric";

export const initializeCanvas = (
  canvasElement: HTMLCanvasElement,
  imageUrl: string
): Promise<FabricCanvas> => {
  const canvas = new FabricCanvas(canvasElement, {
    width: 512,
    height: 512,
    isDrawingMode: true,
  });

  canvas.freeDrawingBrush = new PencilBrush(canvas);
  canvas.freeDrawingBrush.color = "rgba(255, 0, 0, 0.3)";
  canvas.freeDrawingBrush.width = 20;

  return new Promise((resolve) => {
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
      resolve(canvas);
    });
  });
};

