
import React from 'react';
import { Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ElementToolbarProps {
  type: 'text' | 'image';
  onDelete: () => void;
  onFormat?: (format: 'bold' | 'italic' | 'underline') => void;
  onAlign?: (alignment: 'left' | 'center' | 'right') => void;
  currentAlign?: 'left' | 'center' | 'right';
  onTextSize?: (size: 'S' | 'M' | 'L' | 'XL') => void;
  currentTextSize?: 'S' | 'M' | 'L' | 'XL';
}

const ElementToolbar = ({ 
  type, 
  onDelete, 
  onFormat, 
  onAlign, 
  currentAlign = 'left',
  onTextSize,
  currentTextSize = 'M'
}: ElementToolbarProps) => {
  return (
    <div className="editor-toolbar">
      {type === 'text' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFormat?.('bold')}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFormat?.('italic')}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFormat?.('underline')}
          >
            <Underline className="w-4 h-4" />
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            variant={currentAlign === 'left' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onAlign?.('left')}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant={currentAlign === 'center' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onAlign?.('center')}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant={currentAlign === 'right' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onAlign?.('right')}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          {['S', 'M', 'L', 'XL'].map((size) => (
            <Button
              key={size}
              variant={currentTextSize === size ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTextSize?.(size as 'S' | 'M' | 'L' | 'XL')}
              className="w-8"
            >
              {size}
            </Button>
          ))}
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
  );
};

export default ElementToolbar;
