
import React, { useRef } from 'react';
import ElementToolbar from './ElementToolbar';
import ResizeHandle from './ResizeHandle';
import { useElementInteraction } from './useElementInteraction';
import type { Element } from './types';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, X, Plus, Minus, Search, User } from 'lucide-react';

const iconComponents = {
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'check': Check,
  'x': X,
  'plus': Plus,
  'minus': Minus,
  'search': Search,
  'user': User,
};

interface EditorElementProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Element>) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  isPreview: boolean;
}

const EditorElement: React.FC<EditorElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  isPreview
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const { handleDragStart, handleResizeStart } = useElementInteraction({
    element,
    onUpdate,
    isPreview
  });

  const handleTextFormat = (format: 'bold' | 'italic' | 'underline') => {
    document.execCommand(format, false);
  };

  const handleAlignment = (alignment: 'left' | 'center' | 'right') => {
    onUpdate({ textAlign: alignment });
  };

  const handleTextSize = (size: 'S' | 'M' | 'L' | 'XL') => {
    onUpdate({ textSize: size });
  };

  const handleIconType = (iconType: Element['iconType']) => {
    onUpdate({ iconType, content: iconType });
  };

  const getTextSizeClass = (size?: 'S' | 'M' | 'L' | 'XL') => {
    switch (size) {
      case 'S': return 'text-xs';
      case 'M': return 'text-sm';
      case 'L': return 'text-xl';
      case 'XL': return 'text-4xl';
      default: return 'text-sm';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreview) return;
    
    const target = e.target as HTMLElement;
    if (!target.classList.contains('resize-handle')) {
      handleDragStart(e);
      onSelect();
    }
  };

  const renderIcon = () => {
    if (!element.iconType || !iconComponents[element.iconType]) return null;
    const IconComponent = iconComponents[element.iconType];
    return (
      <IconComponent 
        className="w-full h-full text-blue-500" 
        style={{ 
          width: '100%', 
          height: '100%' 
        }} 
      />
    );
  };

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
          <ElementToolbar
            type={element.type}
            onDelete={onDelete}
            onFormat={handleTextFormat}
            onAlign={handleAlignment}
            currentAlign={element.textAlign}
            onTextSize={handleTextSize}
            currentTextSize={element.textSize}
            onIconType={handleIconType}
            currentIconType={element.iconType}
            isPreview={isPreview}
            onDuplicate={onDuplicate}
          />
          <ResizeHandle onResizeStart={handleResizeStart} />
        </>
      )}
      
      {element.type === 'text' ? (
        <div
          contentEditable={!isPreview}
          suppressContentEditableWarning
          className={`w-full h-full p-2 ${getTextSizeClass(element.textSize)}`}
          style={{ textAlign: element.textAlign || 'left' }}
          onBlur={(e) => onUpdate({ content: e.currentTarget.innerHTML })}
          dangerouslySetInnerHTML={{ __html: element.content }}
        />
      ) : element.type === 'image' ? (
        <img
          src={element.content}
          alt="Editor element"
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {renderIcon()}
        </div>
      )}
    </div>
  );
};

export default EditorElement;

