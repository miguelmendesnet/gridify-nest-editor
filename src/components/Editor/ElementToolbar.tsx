
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

const sizeLabels = {
  'S': '12px',
  'M': '14px',
  'L': '22px',
  'XL': '36px'
};

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
    <div className="editor-toolbar flex items-center gap-1 absolute -top-10 left-0 bg-background border rounded-md p-1 shadow-sm">
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
          {(Object.keys(sizeLabels) as Array<'S' | 'M' | 'L' | 'XL'>).map((size) => (
            <Button
              key={size}
              variant={currentTextSize === size ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTextSize?.(size)}
              className="w-16 flex flex-col items-center gap-0.5"
            >
              <span className="text-xs">{size}</span>
              <span className="text-[10px] text-muted-foreground">{sizeLabels[size]}</span>
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
