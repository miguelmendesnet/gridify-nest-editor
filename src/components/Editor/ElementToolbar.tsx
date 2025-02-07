
import React from 'react';
import { Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { Element } from './types';

interface ElementToolbarProps {
  type: 'text' | 'image' | 'icon';
  onDelete: () => void;
  onFormat?: (format: 'bold' | 'italic' | 'underline') => void;
  onAlign?: (alignment: 'left' | 'center' | 'right') => void;
  currentAlign?: 'left' | 'center' | 'right';
  onTextSize?: (size: 'S' | 'M' | 'L' | 'XL') => void;
  currentTextSize?: 'S' | 'M' | 'L' | 'XL';
  onIconType?: (iconType: Element['iconType']) => void;
  currentIconType?: Element['iconType'];
  isPreview?: boolean;
  onDuplicate?: () => void;
}

const sizeLabels = {
  'S': '12px',
  'M': '14px',
  'L': '22px',
  'XL': '36px'
};

const iconOptions = [
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'check',
  'x',
  'plus',
  'minus',
  'search',
  'user'
] as const;

const ElementToolbar = ({ 
  type, 
  onDelete, 
  onFormat, 
  onAlign, 
  currentAlign = 'left',
  onTextSize,
  currentTextSize = 'M',
  onIconType,
  currentIconType,
  isPreview = false,
  onDuplicate
}: ElementToolbarProps) => {
  return (
    <div className="editor-toolbar flex items-center gap-1 absolute -top-10 left-0 bg-background border rounded-md p-1 shadow-sm">
      {type === 'text' && !isPreview && (
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
      {type === 'icon' && !isPreview && (
        <>
          <select
            className="px-2 py-1 border rounded bg-background"
            value={currentIconType}
            onChange={(e) => onIconType?.(e.target.value as Element['iconType'])}
          >
            {iconOptions.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
          <div className="h-4 w-px bg-border mx-1" />
        </>
      )}
      {(type === 'image' || type === 'icon') && !isPreview && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
        </>
      )}
      {!isPreview && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      )}
    </div>
  );
};

export default ElementToolbar;

