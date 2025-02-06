import React, { useState } from 'react';
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreview) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y
    });
    onSelect();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, 1140 - element.size.width));
    const newY = Math.max(0, e.clientY - dragStart.y);
    
    // Snap to grid (81.42px columns)
    const snappedX = Math.round(newX / 81.42) * 81.42;
    
    onUpdate({
      position: { x: snappedX, y: newY }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTextFormat = (format: 'bold' | 'italic' | 'underline') => {
    const style = window.getSelection()?.toString()
      ? `<span class="${format}">${window.getSelection()?.toString()}</span>`
      : '';
    document.execCommand(format, false, style);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      className={`editor-element ${isSelected ? 'selected' : ''}`}
      style={{
        transform: `translate(${element.position.x}px, ${element.position.y}px)`,
        width: element.size.width,
        height: element.size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      {isSelected && !isPreview && (
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