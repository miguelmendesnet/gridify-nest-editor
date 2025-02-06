import { useState, useEffect } from 'react';
import type { Element } from './EditorContainer';

interface UseElementInteractionProps {
  element: Element;
  onUpdate: (updates: Partial<Element>) => void;
  isPreview: boolean;
}

export const useElementInteraction = ({ element, onUpdate, isPreview }: UseElementInteractionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const GRID_COLUMN_WIDTH = 81.42; // 1140px / 14 columns
  const MIN_WIDTH = GRID_COLUMN_WIDTH;
  const MIN_HEIGHT = 50;

  const handleDragStart = (e: React.MouseEvent) => {
    if (isPreview) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: element.size.width,
      height: element.size.height,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, 1140 - element.size.width));
      const newY = Math.max(0, e.clientY - dragStart.y);
      
      // Snap to grid
      const snappedX = Math.round(newX / GRID_COLUMN_WIDTH) * GRID_COLUMN_WIDTH;
      
      onUpdate({
        position: { x: snappedX, y: newY }
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = Math.max(MIN_WIDTH, resizeStart.width + deltaX);
      const newHeight = Math.max(MIN_HEIGHT, resizeStart.height + deltaY);
      
      newWidth = Math.round(newWidth / GRID_COLUMN_WIDTH) * GRID_COLUMN_WIDTH;
      newWidth = Math.min(newWidth, 1140 - element.position.x);
      
      onUpdate({
        size: { width: newWidth, height: newHeight }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  return {
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart
  };
};