import React, { useState, useRef } from 'react';
import { Trash2, Bold, Italic, Underline } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { Element } from './EditorContainer';

interface EditorElementProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Element>) => void;
  onDelete: () => void;
  isPreview: boolean;
}

const EditorElement: React.FC<EditorElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  isPreview
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const GRID_COLUMN_WIDTH = 81.42; // 1140px / 14 columns
  const MIN_WIDTH = GRID_COLUMN_WIDTH;
  const MIN_HEIGHT = 50;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreview) return;
    
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      handleResizeStart(e);
    } else {
      handleDragStart(e);
    }
    onSelect();
  };

  const handleDragStart = (e: React.MouseEvent) => {
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

  const handleMouseMove = (e: React.MouseEvent) => {
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
      
      // Calculate new width and height
      let newWidth = Math.max(MIN_WIDTH, resizeStart.width + deltaX);
      const newHeight = Math.max(MIN_HEIGHT, resizeStart.height + deltaY);
      
      // Snap width to grid
      newWidth = Math.round(newWidth / GRID_COLUMN_WIDTH) * GRID_COLUMN_WIDTH;
      
      // Ensure element doesn't exceed grid boundaries
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

  const handleTextFormat = (format: 'bold' | 'italic' | 'underline') => {
    const style = window.getSelection()?.toString()
      ? `<span class="${format}">${window.getSelection()?.toString()}</span>`
      : '';
    document.execCommand(format, false, style);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  return (
    <div
      ref={elementRef}
      className={`editor-element ${isSelected ? 'selected' : ''}`}
      style={{
        transform: `translate(${element.position.x}px, ${element.position.y}px)`,
        width: element.size.width,
        height: element.size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      {isSelected && !isPreview && (
        <>
          <div className="editor-toolbar">
            {element.type === 'text' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTextFormat('bold')}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTextFormat('italic')}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTextFormat('underline')}
                >
                  <Underline className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          <div className="resize-handle resize-handle-se" onMouseDown={handleResizeStart} />
        </>
      )}
      
      {element.type === 'text' ? (
        <div
          contentEditable={!isPreview}
          suppressContentEditableWarning
          className="w-full h-full p-2"
          onBlur={(e) => onUpdate({ content: e.currentTarget.innerHTML })}
        >
          {element.content}
        </div>
      ) : (
        <img
          src={element.content}
          alt="Editor element"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default EditorElement;