import { files } from "@prisma/client";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface ImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: files[];
  initialImageIndex?: number;
}

export function ImageViewer({ open, onOpenChange, images, initialImageIndex = 0 }: ImageViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentImageIndex(initialImageIndex);
  }, [initialImageIndex]);

  useEffect(() => {
    // Reset zoom and position when changing images
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentImageIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowLeft":
          navigateImage("prev");
          break;
        case "ArrowRight":
          navigateImage("next");
          break;
        case "Escape":
          onOpenChange(false);
          break;
        case "+":
        case "=":
          setZoom((prev) => Math.min(prev + 0.25, 3));
          break;
        case "-":
          setZoom((prev) => Math.max(prev - 0.25, 1));
          break;
        case "0":
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentImageIndex, onOpenChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0">
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/95">
          <div className="relative w-full flex-1 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 text-white hover:bg-white/20 z-50"
              onClick={() => navigateImage("prev")}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div
              className="relative overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoom > 1 ? "grab" : "default" }}
            >
              <img
                src={images[currentImageIndex]?.file_url || ""}
                alt="Full size"
                className="max-h-[calc(95vh-100px)] max-w-[95vw] object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                }}
              />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setZoom((prev) => Math.max(prev - 0.25, 1))}
              >
                <span className="text-lg">−</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                }}
              >
                <span className="text-sm">{Math.round(zoom * 100)}%</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3))}
              >
                <span className="text-lg">+</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 text-white hover:bg-white/20 z-50"
              onClick={() => navigateImage("next")}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <div className="h-[80px] w-full overflow-x-auto flex justify-center items-center gap-2 p-2 bg-black/50">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`h-[60px] min-w-[60px] cursor-pointer transition-all duration-200 rounded-md ${
                  currentImageIndex === index
                    ? "border-2 border-white scale-110"
                    : "border border-gray-600 opacity-70 hover:opacity-100"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={image.compressed_file_url || image.file_url || ""}
                  alt={image.file_name}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
